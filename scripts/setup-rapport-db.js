// Node.js Script zum Ausführen des Rapport-Schemas

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// PostgreSQL-Verbindung (identisch zu server.js)
const pool = new Pool({
    host: 'postgresql-sbv-gesuche-team.d.elest.io',
    port: 5432,
    database: 'sbv_gesuche_db',
    user: 'root',
    password: 'H8vF2pT9qN3xK7mR4nL6sA1dG5jQ8wE2',
    ssl: {
        rejectUnauthorized: false
    }
});

async function setupRapportSchema() {
    console.log('🔧 Ausführung des Rapport-Schemas...');
    
    try {
        // Teste die Verbindung
        const client = await pool.connect();
        console.log('✅ PostgreSQL-Verbindung erfolgreich!');
        
        // Lese das Schema-File
        const schemaPath = path.join(__dirname, '../docs/database/rapport-schema-postgresql.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('📋 Führe SQL-Schema aus...');
        
        // Führe das Schema aus
        await client.query(schemaSql);
        
        console.log('✅ Rapport-Schema erfolgreich ausgeführt!');
        console.log('📊 Tabellen erstellt:');
        console.log('  - rapporte (Haupt-Rapporte)');
        console.log('  - rapport_massnahmen (Maßnahmen)');  
        console.log('  - rapport_kpis (Key Performance Indicators)');
        console.log('  - rapport_anhaenge (Datei-Anhänge)');
        console.log('  - rapport_templates (Vorlagen)');
        console.log('  - rapport_audit_log (Änderungsprotokoll)');
        console.log('');
        console.log('🎯 Demo-Daten eingefügt für 2024');
        
        // Validiere die erstellten Tabellen
        console.log('🔍 Validiere erstellte Tabellen...');
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE 'rapport%'
            ORDER BY table_name
        `);
        
        console.log('📋 Gefundene Rapport-Tabellen:');
        tablesResult.rows.forEach(row => {
            console.log(`  ✓ ${row.table_name}`);
        });
        
        // Teste Demo-Daten
        const demoResult = await client.query('SELECT COUNT(*) as count FROM rapporte');
        console.log(`📈 Demo-Rapporte gefunden: ${demoResult.rows[0].count}`);
        
        client.release();
        
    } catch (error) {
        console.error('❌ Fehler bei der Schema-Ausführung:', error.message);
        console.error('📋 Details:', error.stack);
        process.exit(1);
    }
    
    console.log('');
    console.log('🎉 Rapport-System Backend Integration abgeschlossen!');
    console.log('📋 Nächste Schritte:');
    console.log('  1. Server testen: node src/backend/server.js');
    console.log('  2. API testen: http://localhost:3000/api/rapporte');
    console.log('  3. Frontend testen: Rapport-Seite öffnen');
    
    process.exit(0);
}

// Führe Setup aus
setupRapportSchema();
