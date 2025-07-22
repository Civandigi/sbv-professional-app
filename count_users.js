const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'postgresql-sbv-fg-app-u38422.vm.elestio.app',
    database: 'postgres',
    password: 'RvFb9djO-BpZC-JpFFB2su',
    port: 25432,
    ssl: { rejectUnauthorized: false }
});

async function countUsers() {
    try {
        console.log('🔍 Verbindung zur Datenbank...');
        
        // Count total users
        const countResult = await pool.query('SELECT COUNT(*) as total FROM sbv_benutzer');
        const totalUsers = countResult.rows[0].total;
        
        // Get all users with details
        const usersResult = await pool.query('SELECT id, email, rolle, created_at FROM sbv_benutzer ORDER BY id');
        
        console.log('📊 BENUTZER-STATISTIK:');
        console.log('='.repeat(50));
        console.log(`Gesamtanzahl Benutzer: ${totalUsers}`);
        console.log('');
        
        console.log('📋 Alle Benutzer:');
        usersResult.rows.forEach((user, index) => {
            const createdDate = user.created_at ? new Date(user.created_at).toLocaleDateString('de-DE') : 'Kein Datum';
            console.log(`${index + 1}. ID: ${user.id} | ${user.email} | ${user.rolle} | ${createdDate}`);
        });
        
        // Count by role
        const rolesResult = await pool.query(`
            SELECT rolle, COUNT(*) as count 
            FROM sbv_benutzer 
            GROUP BY rolle 
            ORDER BY count DESC
        `);
        
        console.log('\n🏷️ Rollen-Verteilung:');
        rolesResult.rows.forEach(role => {
            console.log(`${role.rolle}: ${role.count}`);
        });
        
        await pool.end();
        
    } catch (error) {
        console.error('❌ Fehler beim Abrufen der Benutzerdaten:', error.message);
        await pool.end();
    }
}

countUsers();
