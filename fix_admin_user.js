// Fix Admin User - Database Repair Script
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

async function fixAdminUser() {
  try {
    console.log('🔧 Starte Datenbank-Reparatur für Super Admin...\n');
    
    // 1. Prüfe aktuelle Benutzer
    console.log('📋 Aktuelle Benutzer:');
    const allUsers = await pool.query('SELECT id, email, rolle, name FROM sbv_benutzer ORDER BY id');
    
    allUsers.rows.forEach(user => {
      console.log(`ID: ${user.id || 'NULL'} | Email: ${user.email} | Rolle: ${user.rolle || 'NULL'} | Name: ${user.name || ''}`);
    });
    
    // 2. Prüfe speziell den Super Admin
    console.log('\n🔍 Super Admin Status:');
    const adminUser = await pool.query('SELECT * FROM sbv_benutzer WHERE email = $1', ['superadmin@digitale-rakete.ch']);
    
    if (adminUser.rows.length === 0) {
      console.log('❌ Super Admin nicht gefunden!');
      return;
    }
    
    const admin = adminUser.rows[0];
    console.log('Aktueller Status:', JSON.stringify({
      id: admin.id,
      email: admin.email,
      rolle: admin.rolle,
      name: admin.name
    }, null, 2));
    
    // 3. Repariere den Super Admin
    if (!admin.id || !admin.rolle) {
      console.log('\n🔧 Repariere Super Admin...');
      
      // Finde die nächste verfügbare ID (als String)
      const maxIdResult = await pool.query(`
        SELECT COALESCE(MAX(CAST(id AS INTEGER)), 0) + 1 as next_id 
        FROM sbv_benutzer 
        WHERE id IS NOT NULL AND id ~ '^[0-9]+$'
      `);
      const nextId = maxIdResult.rows[0].next_id.toString();
      
      // Update den Super Admin mit ID und Rolle
      await pool.query(`
        UPDATE sbv_benutzer 
        SET 
          id = $1,
          rolle = 'super_admin',
          name = 'Super Admin'
        WHERE email = $2
      `, [nextId, 'superadmin@digitale-rakete.ch']);
      
      console.log(`✅ Super Admin repariert:`);
      console.log(`   - ID: ${nextId}`);
      console.log(`   - Rolle: super_admin`);
      console.log(`   - Name: Super Admin`);
      
      // 4. Verifiziere die Reparatur
      console.log('\n✅ Verifikation:');
      const verifyResult = await pool.query('SELECT id, email, rolle, name FROM sbv_benutzer WHERE email = $1', ['superadmin@digitale-rakete.ch']);
      const repairedAdmin = verifyResult.rows[0];
      
      console.log('Reparierter Super Admin:', JSON.stringify({
        id: repairedAdmin.id,
        email: repairedAdmin.email,
        rolle: repairedAdmin.rolle,
        name: repairedAdmin.name
      }, null, 2));
      
    } else {
      console.log('✅ Super Admin hat bereits ID und Rolle - keine Reparatur nötig');
    }
    
    // 5. Zeige finale Benutzerliste
    console.log('\n📋 Finale Benutzerliste:');
    const finalUsers = await pool.query('SELECT id, email, rolle, name FROM sbv_benutzer ORDER BY id');
    
    finalUsers.rows.forEach(user => {
      console.log(`ID: ${user.id || 'NULL'} | Email: ${user.email} | Rolle: ${user.rolle || 'NULL'} | Name: ${user.name || ''}`);
    });
    
    console.log('\n🎉 Datenbank-Reparatur abgeschlossen!');
    
  } catch (error) {
    console.error('❌ Fehler bei der Reparatur:', error);
  } finally {
    await pool.end();
  }
}

fixAdminUser();
