// Create missing test users for all roles

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

async function createTestUsers() {
    console.log('👥 Erstelle Test-Benutzer für alle Rollen...');
    
    try {
        const client = await pool.connect();
        
        // Prüfe vorhandene Benutzer
        console.log('\n📋 Vorhandene Benutzer:');
        const existing = await client.query('SELECT email, rolle FROM sbv_benutzer ORDER BY rolle, email');
        existing.rows.forEach(row => {
            console.log(`  ✅ ${row.email} - Rolle: ${row.rolle}`);
        });
        
        // Erstelle Hash für Passwort "123456"
        const passwordHash = await bcrypt.hash('123456', 10);
        
        // Test-Benutzer definieren
        const testUsers = [
            {
                email: 'super@sbv-test.ch',
                name: 'Super Administrator',
                rolle: 'super_admin',
                password: passwordHash
            },
            {
                email: 'admin@sbv-test.ch', 
                name: 'System Administrator',
                rolle: 'admin',
                password: passwordHash
            },
            {
                email: 'mitarbeiter@sbv-test.ch',
                name: 'Test Mitarbeiter',
                rolle: 'mitarbeiter', 
                password: passwordHash
            },
            {
                email: 'gast@sbv-test.ch',
                name: 'Gast Benutzer',
                rolle: 'gast',
                password: passwordHash
            }
        ];
        
        console.log('\n🔧 Erstelle neue Test-Benutzer...');
        
        for (const user of testUsers) {
            try {
                // Prüfe ob Benutzer bereits existiert
                const existingUser = await client.query('SELECT id FROM sbv_benutzer WHERE email = $1', [user.email]);
                
                if (existingUser.rows.length === 0) {
                    // Erstelle neuen Benutzer
                    await client.query(`
                        INSERT INTO sbv_benutzer (email, name, rolle, password_hash, status, erstellt_am)
                        VALUES ($1, $2, $3, $4, 'aktiv', CURRENT_TIMESTAMP)
                    `, [user.email, user.name, user.rolle, user.password]);
                    
                    console.log(`  ✅ Erstellt: ${user.email} (${user.rolle})`);
                } else {
                    console.log(`  ⚠️ Bereits vorhanden: ${user.email} (${user.rolle})`);
                }
            } catch (error) {
                console.error(`  ❌ Fehler bei ${user.email}:`, error.message);
            }
        }
        
        // Finale Übersicht aller Benutzer
        console.log('\n📊 Finale Benutzer-Übersicht:');
        const finalUsers = await client.query(`
            SELECT email, name, rolle, status 
            FROM sbv_benutzer 
            ORDER BY 
                CASE rolle 
                    WHEN 'super_admin' THEN 1
                    WHEN 'admin' THEN 2
                    WHEN 'mitarbeiter' THEN 3
                    WHEN 'gast' THEN 4
                    ELSE 5
                END,
                email
        `);
        
        const roleGroups = {};
        finalUsers.rows.forEach(user => {
            if (!roleGroups[user.rolle]) {
                roleGroups[user.rolle] = [];
            }
            roleGroups[user.rolle].push(user);
        });
        
        Object.keys(roleGroups).forEach(rolle => {
            console.log(`\n🎭 ${rolle.toUpperCase()}:`);
            roleGroups[rolle].forEach(user => {
                console.log(`   👤 ${user.email} - ${user.name} (${user.status})`);
            });
        });
        
        console.log('\n🔐 Login-Daten für Tests:');
        console.log('   Passwort für alle Test-Accounts: 123456');
        console.log('\n✅ Benutzer-Setup abgeschlossen!');
        
        client.release();
        
    } catch (error) {
        console.error('❌ Fehler:', error.message);
    }
    
    pool.end();
}

createTestUsers();
