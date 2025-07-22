const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'postgresql-sbv-fg-app-u38422.vm.elestio.app',
  database: 'sbv-fg-app',
  password: 'tV+9Fh6NvO7rTcgUYYMsT2LGaQZvVIxnJlIRNTr1o2xpNXV7r7YBo44gTAcPH9Vr',
  port: 5432,
  connectionTimeoutMillis: 10000,
  statement_timeout: 10000
});

async function dropUsersTable() {
  console.log('🔄 Starte Löschvorgang...');
  
  try {
    const client = await pool.connect();
    console.log('✅ Verbindung hergestellt');
    
    // Drop users table
    console.log('🗑️ Lösche users Tabelle...');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    console.log('✅ users Tabelle erfolgreich gelöscht');
    
    client.release();
    
  } catch (error) {
    console.error('❌ Fehler:', error.message);
  } finally {
    await pool.end();
    console.log('🔚 Verbindung geschlossen');
  }
}

dropUsersTable();
