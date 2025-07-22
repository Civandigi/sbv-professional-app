const { Pool } = require('pg');

const pool = new Pool({
    host: 'postgresql-sbv-fg-app-u38422.vm.elestio.app',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres'
});

async function setAdminRole() {
    try {
        // Prüfe ob User existiert
        const checkUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            ['superadmin@digitale-rakete.ch']
        );
        
        if (checkUser.rows.length === 0) {
            // User erstellen falls er nicht existiert
            const result = await pool.query(
                'INSERT INTO users (name, email, rolle, status) VALUES ($1, $2, $3, $4) RETURNING *',
                ['Super Admin', 'superadmin@digitale-rakete.ch', 'super_admin', 'aktiv']
            );
            console.log('✅ User erstellt:', result.rows[0]);
        } else {
            // User-Rolle aktualisieren
            const result = await pool.query(
                'UPDATE users SET rolle = $1 WHERE email = $2 RETURNING *',
                ['super_admin', 'superadmin@digitale-rakete.ch']
            );
            console.log('✅ Admin-Rechte gesetzt für:', result.rows[0]);
        }
        
    } catch (error) {
        console.error('❌ Fehler:', error);
    } finally {
        await pool.end();
    }
}

setAdminRole();
