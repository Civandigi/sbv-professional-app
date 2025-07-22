const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    host: 'postgresql-sbv-fg-app-u38422.vm.elestio.app',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres'
});

async function fixUserSystem() {
    try {
        console.log('🔧 Benutzer-System reparieren...\n');
        
        // 1. Prüfe welche Tabellen existieren
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name IN ('users', 'sbv_benutzer')
        `);
        
        const existingTables = tablesResult.rows.map(row => row.table_name);
        console.log('🔍 Vorhandene User-Tabellen:', existingTables);
        
        // 2. Erstelle sbv_benutzer Tabelle falls sie nicht existiert
        if (!existingTables.includes('sbv_benutzer')) {
            console.log('📝 Erstelle sbv_benutzer Tabelle...');
            await pool.query(`
                CREATE TABLE IF NOT EXISTS sbv_benutzer (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255),
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255),
                    rolle VARCHAR(50) DEFAULT 'mitarbeiter',
                    status VARCHAR(20) DEFAULT 'aktiv',
                    letzter_login TIMESTAMP,
                    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    aktualisiert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ sbv_benutzer Tabelle erstellt');
        }
        
        // 3. Falls users Tabelle existiert, kopiere Daten
        if (existingTables.includes('users') && existingTables.includes('sbv_benutzer')) {
            console.log('🔄 Kopiere Daten von users zu sbv_benutzer...');
            
            // Prüfe ob sbv_benutzer leer ist
            const count = await pool.query('SELECT COUNT(*) FROM sbv_benutzer');
            if (parseInt(count.rows[0].count) === 0) {
                await pool.query(`
                    INSERT INTO sbv_benutzer (name, email, password_hash, rolle, status, erstellt_am)
                    SELECT name, email, password_hash, rolle, status, erstellt_am 
                    FROM users
                    ON CONFLICT (email) DO NOTHING
                `);
                console.log('✅ Daten kopiert');
            }
        }
        
        // 4. Super Admin erstellen/aktualisieren
        console.log('👑 Super Admin Check...');
        const superAdminEmail = 'superadmin@digitale-rakete.ch';
        const superAdminPassword = 'admin123';
        
        const existingAdmin = await pool.query(
            'SELECT * FROM sbv_benutzer WHERE email = $1',
            [superAdminEmail]
        );
        
        const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
        
        if (existingAdmin.rows.length === 0) {
            // Erstellen
            await pool.query(`
                INSERT INTO sbv_benutzer (name, email, password_hash, rolle, status)
                VALUES ($1, $2, $3, $4, $5)
            `, [
                'Super Admin',
                superAdminEmail,
                hashedPassword,
                'super_admin',
                'aktiv'
            ]);
            console.log('✅ Super Admin erstellt');
        } else {
            // Aktualisieren
            await pool.query(`
                UPDATE sbv_benutzer 
                SET password_hash = $1, rolle = $2, status = $3, name = $4
                WHERE email = $5
            `, [
                hashedPassword,
                'super_admin',
                'aktiv',
                'Super Admin',
                superAdminEmail
            ]);
            console.log('✅ Super Admin aktualisiert');
        }
        
        // 5. Alle Benutzer anzeigen
        console.log('\n📊 Aktuelle Benutzer in sbv_benutzer:');
        const allUsers = await pool.query('SELECT id, name, email, rolle, status FROM sbv_benutzer ORDER BY id');
        allUsers.rows.forEach(user => {
            console.log(`   - ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Rolle: ${user.rolle}`);
        });
        
        console.log('\n🔑 Login-Daten:');
        console.log('   Email: superadmin@digitale-rakete.ch');
        console.log('   Passwort: admin123');
        console.log('\n✅ Benutzer-System repariert!');
        
    } catch (error) {
        console.error('❌ Fehler:', error.message);
    } finally {
        await pool.end();
    }
}

fixUserSystem();
