const { Pool } = require('pg');
const bcrypt = require('bcrypt');

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

async function createTestUser() {
    console.log('🔧 ERSTELLE TESTBENUTZER FÜR LOGIN\n');
    
    try {
        const client = await pool.connect();
        
        // Hash das Passwort 'test123'
        const passwordHash = await bcrypt.hash('test123', 12);
        
        // Erstelle Testbenutzer
        await client.query(`
            INSERT INTO sbv_benutzer (name, email, password_hash, rolle, status, erstellt_am)
            VALUES ($1, $2, $3, $4, $5, NOW())
            ON CONFLICT (email) 
            DO UPDATE SET 
                password_hash = EXCLUDED.password_hash,
                rolle = EXCLUDED.rolle,
                status = EXCLUDED.status,
                aktualisiert_am = NOW()
        `, [
            'Test Admin',
            'admin@sbv-demo.ch',
            passwordHash,
            'admin',
            'aktiv'
        ]);
        
        // Prüfe, ob der Benutzer erstellt wurde
        const result = await client.query(`
            SELECT id, name, email, rolle, status 
            FROM sbv_benutzer 
            WHERE email = 'admin@sbv-demo.ch'
        `);
        
        if (result.rows.length > 0) {
            const user = result.rows[0];
            console.log('✅ Testbenutzer erfolgreich erstellt/aktualisiert:');
            console.log(`   ID: ${user.id}`);
            console.log(`   Name: ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Rolle: ${user.rolle}`);
            console.log(`   Status: ${user.status}`);
            console.log('\n🔑 LOGIN-DATEN:');
            console.log('   Email: admin@sbv-demo.ch');
            console.log('   Passwort: test123');
            console.log('\n🌐 Versuchen Sie sich jetzt unter http://localhost:3000 anzumelden!');
        }
        
        client.release();
        await pool.end();
        
    } catch (error) {
        console.error('❌ Fehler beim Erstellen des Testbenutzers:', error.message);
        await pool.end();
    }
}

createTestUser();
