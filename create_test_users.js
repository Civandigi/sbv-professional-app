const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'postgresql-sbv-fg-app-u38422.vm.elestio.app',
    database: 'sbv-fg-app',
    password: 'tV+9Fh6NvO7rTcgUYYMsT2LGaQZvVIxnJlIRNTr1o2xpNXV7r7YBo44gTAcPH9Vr',
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

async function createTestUsers() {
    try {
        const client = await pool.connect();
        console.log('🔌 Verbindung zur Datenbank hergestellt');

        // Prüfe aktuelle sbv_benutzer Tabelle
        try {
            const existing = await client.query('SELECT name, email, rolle FROM sbv_benutzer ORDER BY id');
            console.log('\n📋 Aktuelle Benutzer in sbv_benutzer:');
            existing.rows.forEach((user, i) => {
                console.log(`  ${i+1}. ${user.name} (${user.email}) - ${user.rolle}`);
            });
        } catch (err) {
            console.log('⚠️ sbv_benutzer Tabelle existiert noch nicht');
        }

        // Erstelle Test-Benutzer für den Kunden
        const bcrypt = require('bcrypt');
        
        const testUsers = [
            {
                name: 'Max Mustermann',
                email: 'test@kunde.ch',
                password: 'test123',
                rolle: 'admin'
            },
            {
                name: 'Anna Beispiel',
                email: 'demo@kunde.ch', 
                password: 'demo123',
                rolle: 'mitarbeiter'
            },
            {
                name: 'Super Administrator',
                email: 'superadmin@digitale-rakete.ch',
                password: 'admin123',
                rolle: 'super_admin'
            }
        ];

        console.log('\n👥 Erstelle Test-Benutzer...');
        
        // Tabelle erstellen falls sie nicht existiert
        await client.query(`
            CREATE TABLE IF NOT EXISTS sbv_benutzer (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                rolle VARCHAR(50) NOT NULL DEFAULT 'gast',
                status VARCHAR(20) DEFAULT 'aktiv',
                erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                letzter_login TIMESTAMP
            );
        `);
        
        for (const user of testUsers) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            
            try {
                await client.query(
                    'INSERT INTO sbv_benutzer (name, email, password_hash, rolle) VALUES ($1, $2, $3, $4)',
                    [user.name, user.email, hashedPassword, user.rolle]
                );
                console.log(`  ✅ ${user.name} (${user.email}) erstellt`);
            } catch (err) {
                if (err.code === '23505') { // Unique constraint violation
                    console.log(`  ⚠️ ${user.email} existiert bereits`);
                } else {
                    console.log(`  ❌ Fehler bei ${user.email}:`, err.message);
                }
            }
        }

        // Finale Übersicht
        const final = await client.query('SELECT name, email, rolle FROM sbv_benutzer ORDER BY id');
        console.log('\n🎉 Finale Benutzer-Liste:');
        final.rows.forEach((user, i) => {
            console.log(`  ${i+1}. ${user.name} (${user.email}) - ${user.rolle}`);
        });

        console.log('\n📋 Login-Daten für Tests:');
        console.log('  Admin: test@kunde.ch / test123');
        console.log('  Mitarbeiter: demo@kunde.ch / demo123');
        console.log('  Super Admin: superadmin@digitale-rakete.ch / admin123');

        client.release();
        await pool.end();
        
    } catch (err) {
        console.error('❌ Fehler:', err.message);
    }
}

createTestUsers();
