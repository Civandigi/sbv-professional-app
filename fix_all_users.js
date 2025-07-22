// Fix All Admin Users - Complete Database Repair
const { Pool } = require('pg');

const pool = new Pool({
  host: 'postgresql-sbv-fg-app-u38422.vm.elestio.app',
  port: 25432,
  database: 'postgres',
  user: 'postgres',
  password: 'RvFb9djO-BpZC-JpFFB2su',
  ssl: {
    rejectUnauthorized: false
  }
});

async function fixAllAdminUsers() {
  try {
    console.log('🔧 Starte komplette Datenbank-Reparatur...\n');
    
    // Finde alle Benutzer ohne ID
    const usersWithoutId = await pool.query('SELECT email, rolle, name FROM sbv_benutzer WHERE id IS NULL');
    
    console.log(`📋 Gefunden: ${usersWithoutId.rows.length} Benutzer ohne ID`);
    
    let nextId = 5; // Beginne bei ID 5 (da 4 schon vergeben ist)
    
    for (const user of usersWithoutId.rows) {
      console.log(`\n🔧 Repariere: ${user.email}`);
      
      await pool.query(`
        UPDATE sbv_benutzer 
        SET id = $1
        WHERE email = $2 AND id IS NULL
      `, [nextId.toString(), user.email]);
      
      console.log(`✅ ${user.email} → ID: ${nextId}`);
      nextId++;
    }
    
    // Finale Übersicht
    console.log('\n📋 Finale Benutzerliste (mit IDs):');
    const finalUsers = await pool.query('SELECT id, email, rolle, name FROM sbv_benutzer ORDER BY CAST(id AS INTEGER)');
    
    finalUsers.rows.forEach(user => {
      console.log(`ID: ${user.id} | Email: ${user.email} | Rolle: ${user.rolle} | Name: ${user.name}`);
    });
    
    console.log('\n🎉 Alle Benutzer haben jetzt IDs!');
    
  } catch (error) {
    console.error('❌ Fehler:', error);
  } finally {
    await pool.end();
  }
}

fixAllAdminUsers();
