const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'postgresql-sbv-fg-app-u38422.vm.elestio.app',
    database: 'postgres',
    password: 'RvFb9djO-BpZC-JpFFB2su',
    port: 25432,
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkDatabase() {
    console.log('🔍 DATENBANK-AUDIT GESTARTET\n');
    console.log('='.repeat(60));
    
    try {
        const client = await pool.connect();
        console.log('✅ Datenbankverbindung erfolgreich!\n');
        
        // 1. Prüfe verfügbare Tabellen
        console.log('📋 1. VERFÜGBARE TABELLEN:');
        console.log('-'.repeat(40));
        const tablesResult = await client.query(`
            SELECT tablename, schemaname 
            FROM pg_tables 
            WHERE schemaname = 'public'
            ORDER BY tablename
        `);
        
        if (tablesResult.rows.length === 0) {
            console.log('❌ KEINE TABELLEN GEFUNDEN!');
        } else {
            tablesResult.rows.forEach(row => {
                console.log(`   ✅ ${row.tablename}`);
            });
        }
        
        // 2. Prüfe sbv_benutzer Tabelle speziell
        console.log('\n📋 2. SBV_BENUTZER TABELLE:');
        console.log('-'.repeat(40));
        try {
            const userTableCheck = await client.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = 'sbv_benutzer' 
                AND table_schema = 'public'
                ORDER BY ordinal_position
            `);
            
            if (userTableCheck.rows.length === 0) {
                console.log('❌ sbv_benutzer Tabelle existiert nicht!');
                console.log('🔧 Erstelle sbv_benutzer Tabelle...');
                
                await client.query(`
                    CREATE TABLE sbv_benutzer (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        email VARCHAR(255) UNIQUE NOT NULL,
                        password_hash VARCHAR(255) NOT NULL,
                        rolle VARCHAR(50) DEFAULT 'user',
                        status VARCHAR(20) DEFAULT 'aktiv',
                        letzter_login TIMESTAMP,
                        erstellt_am TIMESTAMP DEFAULT NOW(),
                        aktualisiert_am TIMESTAMP DEFAULT NOW()
                    )
                `);
                console.log('✅ sbv_benutzer Tabelle erstellt!');
            } else {
                console.log('✅ sbv_benutzer Tabelle existiert');
                console.log('   Spalten:');
                userTableCheck.rows.forEach(col => {
                    console.log(`     - ${col.column_name}: ${col.data_type}`);
                });
            }
        } catch (error) {
            console.log(`❌ Fehler beim Prüfen der sbv_benutzer Tabelle: ${error.message}`);
        }
        
        // 3. Prüfe vorhandene Benutzer
        console.log('\n📋 3. VORHANDENE BENUTZER:');
        console.log('-'.repeat(40));
        try {
            const usersResult = await client.query(`
                SELECT id, name, email, rolle, status, erstellt_am 
                FROM sbv_benutzer 
                ORDER BY id
            `);
            
            if (usersResult.rows.length === 0) {
                console.log('❌ KEINE BENUTZER GEFUNDEN!');
                console.log('🔧 Erstelle Testbenutzer...');
                
                // Erstelle Testbenutzer
                await client.query(`
                    INSERT INTO sbv_benutzer (name, email, password_hash, rolle, status)
                    VALUES 
                    ('Super Admin', 'superadmin@digitale-rakete.ch', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewE9fzDGNPXOZZLu', 'super_admin', 'aktiv'),
                    ('Test Admin', 'admin@sbv-demo.ch', '$2b$12$K8H6.Z1rx58QwHD9JB0ceuMzusCvv.D4wGI32.WVpIE.3m3y5.Nk2', 'admin', 'aktiv'),
                    ('Test User', 'user@sbv-demo.ch', '$2b$12$K8H6.Z1rx58QwHD9JB0ceuMzusCvv.D4wGI32.WVpIE.3m3y5.Nk2', 'user', 'aktiv')
                    ON CONFLICT (email) DO NOTHING
                `);
                
                const newUsersResult = await client.query(`
                    SELECT id, name, email, rolle, status 
                    FROM sbv_benutzer 
                    ORDER BY id
                `);
                
                console.log('✅ Testbenutzer erstellt:');
                newUsersResult.rows.forEach(user => {
                    console.log(`   ${user.id}: ${user.name} (${user.email}) - ${user.rolle}`);
                });
            } else {
                console.log(`✅ ${usersResult.rows.length} Benutzer gefunden:`);
                usersResult.rows.forEach(user => {
                    console.log(`   ${user.id}: ${user.name} (${user.email}) - ${user.rolle}`);
                });
            }
        } catch (error) {
            console.log(`❌ Fehler beim Prüfen der Benutzer: ${error.message}`);
        }
        
        // 4. Test Login-Funktion
        console.log('\n📋 4. LOGIN-FUNKTIONSTEST:');
        console.log('-'.repeat(40));
        try {
            const testLoginResult = await client.query(`
                SELECT id, name, email, rolle, password_hash 
                FROM sbv_benutzer 
                WHERE email = 'admin@sbv-demo.ch'
            `);
            
            if (testLoginResult.rows.length > 0) {
                console.log('✅ Testbenutzer für Login gefunden:');
                const user = testLoginResult.rows[0];
                console.log(`   Email: ${user.email}`);
                console.log(`   Name: ${user.name}`);
                console.log(`   Rolle: ${user.rolle}`);
                console.log(`   Passwort-Hash vorhanden: ${user.password_hash ? 'Ja' : 'Nein'}`);
                console.log('\n🔑 Login-Daten zum Testen:');
                console.log('   Email: admin@sbv-demo.ch');
                console.log('   Passwort: test123');
            } else {
                console.log('❌ Kein Testbenutzer für Login gefunden!');
            }
        } catch (error) {
            console.log(`❌ Fehler beim Login-Test: ${error.message}`);
        }
        
        client.release();
        await pool.end();
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ DATENBANK-AUDIT ABGESCHLOSSEN!');
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('❌ Verbindungsfehler:', error.message);
        await pool.end();
    }
}

checkDatabase();
