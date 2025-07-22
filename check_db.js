const { Pool } = require('pg');

const pool = new Pool({
    host: 'postgresql-sbv-fg-app-u38422.vm.elestio.app',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres'
});

async function checkDatabase() {
    try {
        console.log('🔍 Datenbank-Check startet...\n');
        
        // 1. Verbindung testen
        console.log('1. VERBINDUNGSTEST:');
        await pool.query('SELECT NOW()');
        console.log('   ✅ Datenbankverbindung erfolgreich\n');
        
        // 2. Users Tabelle prüfen
        console.log('2. USERS TABELLE:');
        const usersResult = await pool.query('SELECT * FROM users ORDER BY id');
        console.log(`   📊 ${usersResult.rows.length} Benutzer gefunden:`);
        usersResult.rows.forEach(user => {
            console.log(`   - ID: ${user.id}, Email: ${user.email}, Rolle: ${user.rolle}, Status: ${user.status}`);
        });
        console.log('');
        
        // 3. Super Admin prüfen
        console.log('3. SUPER ADMIN CHECK:');
        const superAdmin = await pool.query("SELECT * FROM users WHERE email = 'superadmin@digitale-rakete.ch'");
        if (superAdmin.rows.length > 0) {
            const admin = superAdmin.rows[0];
            console.log(`   ✅ Super Admin gefunden:`);
            console.log(`   - Name: ${admin.name}`);
            console.log(`   - Email: ${admin.email}`);
            console.log(`   - Rolle: ${admin.rolle}`);
            console.log(`   - Status: ${admin.status}`);
            console.log(`   - Passwort Hash: ${admin.password_hash ? 'Vorhanden' : 'FEHLT!'}`);
        } else {
            console.log('   ❌ Super Admin nicht gefunden!');
            
            // Super Admin erstellen
            const bcrypt = require('bcrypt');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            await pool.query(
                'INSERT INTO users (name, email, password_hash, rolle, status) VALUES ($1, $2, $3, $4, $5)',
                ['Super Admin', 'superadmin@digitale-rakete.ch', hashedPassword, 'super_admin', 'aktiv']
            );
            console.log('   ✅ Super Admin wurde erstellt!');
            console.log('   📧 Email: superadmin@digitale-rakete.ch');
            console.log('   🔑 Passwort: admin123');
        }
        console.log('');
        
        // 4. Tabellen-Schema prüfen
        console.log('4. TABELLEN-SCHEMA:');
        const tablesResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('   📋 Vorhandene Tabellen:');
        tablesResult.rows.forEach(table => {
            console.log(`   - ${table.table_name}`);
        });
        console.log('');
        
        // 5. Users Tabellen-Struktur prüfen
        console.log('5. USERS TABELLEN-STRUKTUR:');
        const columnsResult = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY ordinal_position
        `);
        console.log('   🏗️ Spalten:');
        columnsResult.rows.forEach(col => {
            console.log(`   - ${col.column_name}: ${col.data_type} (Nullable: ${col.is_nullable})`);
        });
        
    } catch (error) {
        console.error('❌ Fehler:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await pool.end();
    }
}

checkDatabase();
