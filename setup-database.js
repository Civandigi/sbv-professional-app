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

async function setupDatabase() {
    console.log('🔧 DATENBANK-SETUP GESTARTET\n');
    
    try {
        const client = await pool.connect();
        
        // Erstelle sbv_benutzer Tabelle
        console.log('📋 Erstelle sbv_benutzer Tabelle...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS sbv_benutzer (
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
        console.log('✅ sbv_benutzer Tabelle erstellt');
        
        // Füge Testbenutzer hinzu
        console.log('\n👤 Erstelle Testbenutzer...');
        
        // Admin Benutzer
        await client.query(`
            INSERT INTO sbv_benutzer (name, email, password_hash, rolle, status)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (email) DO NOTHING
        `, [
            'Test Admin',
            'admin@sbv-demo.ch',
            '$2b$12$K8H6.Z1rx58QwHD9JB0ceuMzusCvv.D4wGI32.WVpIE.3m3y5.Nk2', // test123
            'admin',
            'aktiv'
        ]);
        
        // Normal User
        await client.query(`
            INSERT INTO sbv_benutzer (name, email, password_hash, rolle, status)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (email) DO NOTHING
        `, [
            'Test User',
            'user@sbv-demo.ch',
            '$2b$12$K8H6.Z1rx58QwHD9JB0ceuMzusCvv.D4wGI32.WVpIE.3m3y5.Nk2', // test123
            'user',
            'aktiv'
        ]);
        
        console.log('✅ Testbenutzer erstellt');
        
        // Prüfe erstellte Benutzer
        const result = await client.query('SELECT id, name, email, rolle FROM sbv_benutzer');
        console.log('\n📋 Vorhandene Benutzer:');
        result.rows.forEach(user => {
            console.log(`   ${user.id}: ${user.name} (${user.email}) - ${user.rolle}`);
        });
        
        client.release();
        await pool.end();
        
        console.log('\n✅ DATENBANK-SETUP ERFOLGREICH ABGESCHLOSSEN!');
        console.log('\nSie können sich jetzt einloggen mit:');
        console.log('Email: admin@sbv-demo.ch');
        console.log('Passwort: test123');
        
    } catch (error) {
        console.error('❌ Fehler beim Datenbank-Setup:', error.message);
        await pool.end();
    }
}

setupDatabase();
