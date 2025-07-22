// Check existing users and create test users

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

async function checkAndCreateUsers() {
    console.log('👥 Überprüfe vorhandene Benutzer...');
    
    try {
        const client = await pool.connect();
        
        // Prüfe vorhandene Benutzer
        const existingUsers = await client.query('SELECT id, name, email, rolle FROM sbv_benutzer ORDER BY id');
        
        console.log('\n📋 Aktuelle Benutzer in der Datenbank:');
        console.log('ID | Name | Email | Rolle');
        console.log('---|------|-------|-------');
        
        if (existingUsers.rows.length === 0) {
            console.log('❌ Keine Benutzer gefunden!');
        } else {
            existingUsers.rows.forEach(row => {
                console.log(`${row.id} | ${row.name || 'N/A'} | ${row.email || 'N/A'} | ${row.rolle || 'N/A'}`);
            });
        }
        
        // Prüfe Tabellen-Struktur
        console.log('\n🔍 Prüfe Tabellen-Struktur...');
        const columns = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'sbv_benutzer' 
            ORDER BY ordinal_position
        `);
        
        console.log('\n📊 sbv_benutzer Tabellen-Spalten:');
        columns.rows.forEach(col => {
            console.log(`  - ${col.column_name} (${col.data_type})`);
        });
        
        client.release();
        
    } catch (error) {
        console.error('❌ Fehler:', error.message);
    }
    
    pool.end();
}

checkAndCreateUsers();
