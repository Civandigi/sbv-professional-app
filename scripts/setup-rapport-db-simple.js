// Node.js Script - Vereinfachte Version ohne Generated Columns

const { Pool } = require('pg');

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

async function setupRapportSchema() {
    console.log('🔧 Erstelle Rapport-Tabellen...');
    
    try {
        const client = await pool.connect();
        console.log('✅ Datenbankverbindung erfolgreich!');
        
        // Einfaches Schema ohne Generated Columns
        const schemaSql = `
-- Haupttabelle für Rapporte
CREATE TABLE IF NOT EXISTS rapporte (
    id SERIAL PRIMARY KEY,
    rapport_nummer VARCHAR(20) UNIQUE NOT NULL,
    teilprojekt VARCHAR(50) NOT NULL,
    jahr INTEGER NOT NULL,
    periode VARCHAR(20) NOT NULL,
    status VARCHAR(30) DEFAULT 'ausstehend',
    budget_brutto DECIMAL(10,2) NOT NULL,
    ist_brutto DECIMAL(10,2) DEFAULT 0,
    aufwandsminderung DECIMAL(10,2) DEFAULT 0,
    was_lief_gut TEXT,
    abweichungen TEXT,
    lessons_learned TEXT,
    erstellt_von INTEGER,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aktualisiert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    genehmigt_von INTEGER,
    genehmigt_am TIMESTAMP NULL
);

-- Tabelle für Maßnahmen
CREATE TABLE IF NOT EXISTS rapport_massnahmen (
    id SERIAL PRIMARY KEY,
    rapport_id INTEGER NOT NULL,
    massnahme_name VARCHAR(200) NOT NULL,
    budget_plan DECIMAL(10,2) NOT NULL,
    ist_wert DECIMAL(10,2) DEFAULT 0,
    beschreibung TEXT,
    sortierung INTEGER DEFAULT 0,
    FOREIGN KEY (rapport_id) REFERENCES rapporte(id) ON DELETE CASCADE
);

-- Tabelle für KPIs
CREATE TABLE IF NOT EXISTS rapport_kpis (
    id SERIAL PRIMARY KEY,
    rapport_id INTEGER NOT NULL,
    kpi_name VARCHAR(200) NOT NULL,
    zielwert DECIMAL(10,2) NOT NULL,
    ist_wert DECIMAL(10,2) DEFAULT 0,
    einheit VARCHAR(50),
    beschreibung TEXT,
    sortierung INTEGER DEFAULT 0,
    FOREIGN KEY (rapport_id) REFERENCES rapporte(id) ON DELETE CASCADE
);

-- Tabelle für Templates
CREATE TABLE IF NOT EXISTS rapport_templates (
    id SERIAL PRIMARY KEY,
    teilprojekt VARCHAR(50) NOT NULL,
    template_name VARCHAR(100) NOT NULL,
    template_data JSONB NOT NULL,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

        await client.query(schemaSql);
        console.log('✅ Tabellen erfolgreich erstellt!');
        
        // Demo-Daten einfügen
        console.log('📊 Füge Demo-Daten ein...');
        
        // Prüfe ob Demo-Daten bereits existieren
        const existingData = await client.query('SELECT COUNT(*) as count FROM rapporte');
        if (existingData.rows[0].count == 0) {
            
            await client.query(`
                INSERT INTO rapporte (rapport_nummer, teilprojekt, jahr, periode, status, budget_brutto, ist_brutto, was_lief_gut, abweichungen, erstellt_von) 
                VALUES 
                ('R-2024-001', 'leitmedien', 2024, 'Q1', 'genehmigt', 25000.00, 23500.00, 'Sehr gute Medienresonanz in Q1', 'Leichte Budgetunterschreitung', 1),
                ('R-2024-002', 'digitale-medien', 2024, 'Q1', 'genehmigt', 35000.00, 36200.00, 'Hohe Conversion-Rate erreicht', 'Leichte Budgetüberschreitung', 1),
                ('R-2024-003', 'leitmedien', 2024, 'Q2', 'zur-pruefung', 28000.00, 27800.00, 'Erfolgreiche Messe-Nachbereitung', 'Planmäßige Umsetzung', 1)
            `);
            
            await client.query(`
                INSERT INTO rapport_massnahmen (rapport_id, massnahme_name, budget_plan, ist_wert, beschreibung, sortierung) VALUES 
                (1, 'Print-Anzeigen', 15000.00, 14200.00, 'Anzeigen in Fachzeitschriften Q1', 1),
                (1, 'PR-Aktivitäten', 8000.00, 7500.00, 'Pressemitteilungen und Events Q1', 2),
                (2, 'Google Ads', 20000.00, 21000.00, 'Suchmaschinenwerbung Q1', 1),
                (2, 'Facebook/LinkedIn Ads', 12000.00, 11800.00, 'Social Media Advertising Q1', 2)
            `);
            
            await client.query(`
                INSERT INTO rapport_kpis (rapport_id, kpi_name, zielwert, ist_wert, einheit, beschreibung, sortierung) VALUES 
                (1, 'Anzeigen-Reichweite', 50000, 52000, 'Kontakte', 'Kontakte über Print-Anzeigen Q1', 1),
                (1, 'PR-Erwähnungen', 25, 28, 'Stück', 'Anzahl PR-Erwähnungen Q1', 2),
                (2, 'CTR Google Ads', 3.5, 4.1, '%', 'Click-Through-Rate Q1', 1),
                (2, 'Conversion Rate', 2.2, 2.8, '%', 'Konversionsrate Landing Page Q1', 2)
            `);
            
            console.log('✅ Demo-Daten eingefügt!');
        } else {
            console.log('ℹ️ Demo-Daten bereits vorhanden');
        }
        
        // Validierung
        const result = await client.query('SELECT COUNT(*) as count FROM rapporte');
        console.log(`📊 Rapporte in Datenbank: ${result.rows[0].count}`);
        
        const tables = await client.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name LIKE 'rapport%'
        `);
        
        console.log('📋 Erstellte Rapport-Tabellen:');
        tables.rows.forEach(row => console.log(`  ✅ ${row.table_name}`));
        
        client.release();
        
    } catch (error) {
        console.error('❌ Fehler:', error.message);
        process.exit(1);
    }
    
    console.log('');
    console.log('🎉 RAPPORT-DATENBANK SETUP ABGESCHLOSSEN!');
    console.log('🚀 Das Backend kann jetzt gestartet werden!');
    
    process.exit(0);
}

setupRapportSchema();
