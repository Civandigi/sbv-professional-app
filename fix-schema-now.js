const { Client } = require('pg');

async function repairSchemaImmediate() {
  const client = new Client({
    host: 'postgresql-sbv-fg-app-u38422.vm.elestio.app',
    port: 25432,
    database: 'postgres',
    user: 'postgres',
    password: 'RvFb9djO-BpZC-JpFFB2su',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔧 SCHEMA-REPARATUR GESTARTET...');
    
    // 1. Aktuelles Schema prüfen
    const currentSchema = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'sbv_gesuche' 
      ORDER BY ordinal_position
    `);
    
    const columns = currentSchema.rows.map(r => r.column_name);
    console.log('📋 Aktuelle Spalten:', columns.join(', '));
    
    // 2. Prüfen ob eingereicht_am fehlt
    const hasEingereichtAm = columns.includes('eingereicht_am');
    
    if (!hasEingereichtAm) {
      console.log('⚠️ Spalte eingereicht_am fehlt - wird hinzugefügt...');
      
      // 3. Spalte hinzufügen
      await client.query('ALTER TABLE sbv_gesuche ADD COLUMN eingereicht_am TIMESTAMP DEFAULT NOW()');
      console.log('✅ Spalte eingereicht_am erfolgreich hinzugefügt');
      
      // 4. Bestehende Datensätze aktualisieren
      const updateResult = await client.query('UPDATE sbv_gesuche SET eingereicht_am = NOW() WHERE eingereicht_am IS NULL');
      console.log('✅ Bestehende Datensätze aktualisiert:', updateResult.rowCount);
      
    } else {
      console.log('✅ Spalte eingereicht_am bereits vorhanden');
    }
    
    // 5. Finales Schema anzeigen
    const finalSchema = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'sbv_gesuche' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 FINALES SCHEMA sbv_gesuche:');
    finalSchema.rows.forEach(row => {
      const nullable = row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`  - ${row.column_name} (${row.data_type}) ${nullable}`);
    });
    
    console.log('\n🎯 SCHEMA-REPARATUR ERFOLGREICH ABGESCHLOSSEN!');
    console.log('📤 Upload-System ist jetzt bereit zum Testen!');
    
  } catch (err) {
    console.error('❌ Fehler bei Schema-Reparatur:', err.message);
    console.error('Detail:', err);
  } finally {
    await client.end();
  }
}

repairSchemaImmediate();
