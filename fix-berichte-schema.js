const { Client } = require('pg');

async function fixBerichteSchema() {
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
    console.log('🔧 BERICHTE-SCHEMA REPARATUR GESTARTET...');
    
    // 1. Aktuelles Schema prüfen
    const currentSchema = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'sbv_berichte' 
      ORDER BY ordinal_position
    `);
    
    const existingColumns = currentSchema.rows.map(r => r.column_name);
    console.log('📋 Vorhandene Berichte-Spalten:', existingColumns.join(', '));
    
    // 2. Erforderliche Spalten für Rapport-System
    const requiredColumns = [
      { name: 'bericht_typ', type: 'TEXT DEFAULT \'gesuch\'' },
      { name: 'erstellt_am', type: 'TIMESTAMP DEFAULT NOW()' },
      { name: 'gesuch_id', type: 'TEXT' },
      { name: 'ersteller', type: 'TEXT' },
      { name: 'inhalt', type: 'TEXT' }
    ];
    
    // 3. Fehlende Spalten hinzufügen
    for (const column of requiredColumns) {
      if (!existingColumns.includes(column.name)) {
        console.log(`⚠️ Spalte ${column.name} fehlt - wird hinzugefügt...`);
        
        await client.query(`ALTER TABLE sbv_berichte ADD COLUMN ${column.name} ${column.type}`);
        console.log(`✅ Spalte ${column.name} erfolgreich hinzugefügt`);
      } else {
        console.log(`✅ Spalte ${column.name} bereits vorhanden`);
      }
    }
    
    // 4. Finales Schema anzeigen
    const finalSchema = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'sbv_berichte' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 FINALES SCHEMA sbv_berichte:');
    finalSchema.rows.forEach(row => {
      const nullable = row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`  - ${row.column_name} (${row.data_type}) ${nullable}`);
    });
    
    console.log('\n🎯 BERICHTE-SCHEMA REPARATUR ABGESCHLOSSEN!');
    console.log('📊 Upload + Rapport-Erstellung sollte jetzt funktionieren!');
    
  } catch (err) {
    console.error('❌ Fehler bei Berichte-Schema-Reparatur:', err.message);
    console.error('Detail:', err);
  } finally {
    await client.end();
  }
}

fixBerichteSchema();
