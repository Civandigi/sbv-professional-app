const { Client } = require('pg');

async function fixAllSchemas() {
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
    console.log('🔧 VOLLSTÄNDIGE SCHEMA-REPARATUR GESTARTET...');
    console.log('====================================================');
    
    // 1. sbv_gesuche Schema reparieren
    console.log('\n📋 1. REPARIERE sbv_gesuche...');
    
    const gesucheSchema = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'sbv_gesuche' ORDER BY ordinal_position
    `);
    
    const gesucheSpalten = gesucheSchema.rows.map(r => r.column_name);
    console.log('   Vorhandene Spalten:', gesucheSpalten.join(', '));
    
    const gesucheRequired = [
      { name: 'eingereicht_am', type: 'TIMESTAMP DEFAULT NOW()' },
      { name: 'antragsteller', type: 'TEXT' },
      { name: 'benutzer_id', type: 'TEXT' }
    ];
    
    for (const column of gesucheRequired) {
      if (!gesucheSpalten.includes(column.name)) {
        console.log(`   ⚠️ Spalte ${column.name} fehlt - wird hinzugefügt...`);
        await client.query(`ALTER TABLE sbv_gesuche ADD COLUMN ${column.name} ${column.type}`);
        console.log(`   ✅ Spalte ${column.name} hinzugefügt`);
      } else {
        console.log(`   ✅ Spalte ${column.name} bereits vorhanden`);
      }
    }
    
    // 2. sbv_berichte Schema reparieren
    console.log('\n📋 2. REPARIERE sbv_berichte...');
    
    const berichteSchema = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'sbv_berichte' ORDER BY ordinal_position
    `);
    
    const berichteSpalten = berichteSchema.rows.map(r => r.column_name);
    console.log('   Vorhandene Spalten:', berichteSpalten.join(', '));
    
    const berichteRequired = [
      { name: 'bericht_typ', type: 'TEXT DEFAULT \'gesuch\'' },
      { name: 'erstellt_am', type: 'TIMESTAMP DEFAULT NOW()' },
      { name: 'gesuch_id', type: 'TEXT' },
      { name: 'ersteller', type: 'TEXT' },
      { name: 'inhalt', type: 'TEXT' }
    ];
    
    for (const column of berichteRequired) {
      if (!berichteSpalten.includes(column.name)) {
        console.log(`   ⚠️ Spalte ${column.name} fehlt - wird hinzugefügt...`);
        await client.query(`ALTER TABLE sbv_berichte ADD COLUMN ${column.name} ${column.type}`);
        console.log(`   ✅ Spalte ${column.name} hinzugefügt`);
      } else {
        console.log(`   ✅ Spalte ${column.name} bereits vorhanden`);
      }
    }
    
    // 3. Finales Schema-Check
    console.log('\n📋 3. FINALE SCHEMA-VERIFIKATION...');
    
    const finalGesucheSchema = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'sbv_gesuche' ORDER BY ordinal_position
    `);
    
    const finalBerichteSchema = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'sbv_berichte' ORDER BY ordinal_position
    `);
    
    console.log('\n   sbv_gesuche (' + finalGesucheSchema.rows.length + ' Spalten):');
    finalGesucheSchema.rows.forEach(row => {
      console.log(`     - ${row.column_name} (${row.data_type})`);
    });
    
    console.log('\n   sbv_berichte (' + finalBerichteSchema.rows.length + ' Spalten):');
    finalBerichteSchema.rows.forEach(row => {
      console.log(`     - ${row.column_name} (${row.data_type})`);
    });
    
    // 4. Kritische Spalten-Check
    const finalGesucheSpalten = finalGesucheSchema.rows.map(r => r.column_name);
    const finalBerichteSpalten = finalBerichteSchema.rows.map(r => r.column_name);
    
    console.log('\n🎯 KRITISCHE SPALTEN-CHECK:');
    console.log('   sbv_gesuche:');
    console.log('     - eingereicht_am:', finalGesucheSpalten.includes('eingereicht_am') ? '✅ OK' : '❌ FEHLT');
    console.log('     - antragsteller:', finalGesucheSpalten.includes('antragsteller') ? '✅ OK' : '❌ FEHLT');
    console.log('     - benutzer_id:', finalGesucheSpalten.includes('benutzer_id') ? '✅ OK' : '❌ FEHLT');
    
    console.log('   sbv_berichte:');
    console.log('     - bericht_typ:', finalBerichteSpalten.includes('bericht_typ') ? '✅ OK' : '❌ FEHLT');
    console.log('     - erstellt_am:', finalBerichteSpalten.includes('erstellt_am') ? '✅ OK' : '❌ FEHLT');
    console.log('     - gesuch_id:', finalBerichteSpalten.includes('gesuch_id') ? '✅ OK' : '❌ FEHLT');
    
    const allGood = 
      finalGesucheSpalten.includes('eingereicht_am') &&
      finalGesucheSpalten.includes('antragsteller') &&
      finalGesucheSpalten.includes('benutzer_id') &&
      finalBerichteSpalten.includes('bericht_typ') &&
      finalBerichteSpalten.includes('erstellt_am') &&
      finalBerichteSpalten.includes('gesuch_id');
    
    console.log('\n====================================================');
    if (allGood) {
      console.log('🎉 ALLE SCHEMAS ERFOLGREICH REPARIERT!');
      console.log('📤 Upload-System ist jetzt 100% bereit!');
      console.log('🔄 Server neu starten für vollständige Funktionalität.');
    } else {
      console.log('⚠️ EINIGE PROBLEME BESTEHEN NOCH - PRÜFUNG ERFORDERLICH');
    }
    
  } catch (err) {
    console.error('❌ FEHLER BEI SCHEMA-REPARATUR:', err.message);
    console.error('Detail:', err);
  } finally {
    await client.end();
  }
}

fixAllSchemas();
