// Schnell-Setup für Kunden-Demo
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    user: 'postgres',
    host: 'postgresql-sbv-fg-app-u38422.vm.elestio.app',
    database: 'sbv-fg-app',
    password: 'tV+9Fh6NvO7rTcgUYYMsT2LGaQZvVIxnJlIRNTr1o2xpNXV7r7YBo44gTAcPH9Vr',
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

async function quickSetup() {
    console.log('🔧 Schnell-Setup für Kunden-Demo...');
    
    const client = await pool.connect();
    
    // Tabelle erstellen
    await client.query(`
        CREATE TABLE IF NOT EXISTS sbv_benutzer (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            rolle VARCHAR(50) NOT NULL DEFAULT 'gast',
            status VARCHAR(20) DEFAULT 'aktiv',
            erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    
    // Test-User
    const testHash = await bcrypt.hash('test123', 10);
    const demoHash = await bcrypt.hash('demo123', 10);
    
    try {
        await client.query(
            'INSERT INTO sbv_benutzer (name, email, password_hash, rolle) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
            ['Test Admin', 'test@kunde.ch', testHash, 'admin']
        );
        
        await client.query(
            'INSERT INTO sbv_benutzer (name, email, password_hash, rolle) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING', 
            ['Demo User', 'demo@kunde.ch', demoHash, 'mitarbeiter']
        );
        
        console.log('✅ Test-User erstellt:');
        console.log('   Admin: test@kunde.ch / test123');
        console.log('   User: demo@kunde.ch / demo123');
        
    } catch (err) {
        console.log('⚠️ User bereits vorhanden oder Fehler:', err.message);
    }
    
    client.release();
    pool.end();
}

quickSetup().catch(console.error);
