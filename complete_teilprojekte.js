// Script zum Erstellen der restlichen Teilprojekte
const { Pool } = require('pg');

// PostgreSQL connection
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

async function completeTeiprojekte() {
    try {
        console.log('🔧 Vervollständige Teilprojekte-System...');
        
        // Prüfe aktuelle Teilprojekte
        const existing = await pool.query('SELECT id, name FROM sbv_teilprojekte ORDER BY id');
        console.log(`📊 Bereits vorhandene Teilprojekte: ${existing.rows.length}`);
        existing.rows.forEach(row => {
            console.log(`   • ${row.name} (ID: ${row.id})`);
        });
        
        // Die restlichen 5 Teilprojekte
        const teilprojekte = [
            {
                name: 'TP2 - Digitale Medien',
                beschreibung: 'Online-Präsenz, Social Media und digitale Kampagnen',
                budget: 675000,
                jahr: 2025,
                status: 'aktiv',
                kategorie: 'digital'
            },
            {
                name: 'TP3 - Messen & Ausstellungen',
                beschreibung: 'Präsenz auf Fachmessen und Ausstellungen',
                budget: 540000,
                jahr: 2025,
                status: 'aktiv',
                kategorie: 'events'
            },
            {
                name: 'TP4 - Events & Aktionen',
                beschreibung: 'Eigene Events und Aktionen zur Zielgruppenerreichung',
                budget: 945000,
                jahr: 2025,
                status: 'aktiv',
                kategorie: 'events'
            },
            {
                name: 'TP5 - Schulprojekte',
                beschreibung: 'Bildungs- und Aufklärungsprojekte in Schulen',
                budget: 675000,
                jahr: 2025,
                status: 'aktiv',
                kategorie: 'bildung'
            },
            {
                name: 'TP6 - Partnerprojekte',
                beschreibung: 'Kooperationen und Partnerschaften mit anderen Organisationen',
                budget: 765000,
                jahr: 2025,
                status: 'aktiv',
                kategorie: 'kooperationen'
            }
        ];
        
        // Erstelle die restlichen Teilprojekte
        console.log('\n📊 Erstelle fehlende Teilprojekte...');
        for (const tp of teilprojekte) {
            // Prüfe ob bereits vorhanden
            const existingCheck = await pool.query('SELECT id FROM sbv_teilprojekte WHERE name = $1', [tp.name]);
            
            if (existingCheck.rows.length === 0) {
                const result = await pool.query(
                    `INSERT INTO sbv_teilprojekte 
                    (name, beschreibung, budget, jahr, status, kategorie, created_at) 
                    VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
                    RETURNING id, name`,
                    [tp.name, tp.beschreibung, tp.budget, tp.jahr, tp.status, tp.kategorie]
                );
                
                console.log(`✅ Erstellt: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
            } else {
                console.log(`⚠️  Bereits vorhanden: ${tp.name}`);
            }
        }
        
        // Prüfe Maßnahmen-Tabelle Struktur
        console.log('\n🔍 Prüfe rapport_massnahmen Tabelle...');
        try {
            const tableInfo = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'rapport_massnahmen'
                ORDER BY ordinal_position
            `);
            
            console.log('📋 Aktuelle Spalten in rapport_massnahmen:');
            tableInfo.rows.forEach(row => {
                console.log(`   • ${row.column_name}: ${row.data_type}`);
            });
            
            // Prüfe ob teilprojekt_id Spalte existiert
            const hasColumn = tableInfo.rows.some(row => row.column_name === 'teilprojekt_id');
            
            if (!hasColumn) {
                console.log('🔧 Füge teilprojekt_id Spalte hinzu...');
                await pool.query('ALTER TABLE rapport_massnahmen ADD COLUMN teilprojekt_id INTEGER');
                console.log('✅ Spalte teilprojekt_id hinzugefügt');
            }
            
        } catch (error) {
            console.log('ℹ️  rapport_massnahmen Tabelle existiert noch nicht, erstelle sie...');
            await pool.query(`
                CREATE TABLE rapport_massnahmen (
                    id SERIAL PRIMARY KEY,
                    teilprojekt_id INTEGER,
                    name VARCHAR(255) NOT NULL,
                    beschreibung TEXT,
                    budget DECIMAL(12,2) DEFAULT 0,
                    status VARCHAR(50) DEFAULT 'geplant',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Tabelle rapport_massnahmen erstellt');
        }
        
        // Prüfe KPIs-Tabelle
        console.log('\n🔍 Prüfe rapport_kpis Tabelle...');
        try {
            await pool.query('SELECT 1 FROM rapport_kpis LIMIT 1');
            console.log('✅ Tabelle rapport_kpis existiert bereits');
        } catch (error) {
            console.log('🔧 Erstelle rapport_kpis Tabelle...');
            await pool.query(`
                CREATE TABLE rapport_kpis (
                    id SERIAL PRIMARY KEY,
                    teilprojekt_id INTEGER,
                    name VARCHAR(255) NOT NULL,
                    zielwert DECIMAL(10,2),
                    aktueller_wert DECIMAL(10,2) DEFAULT 0,
                    einheit VARCHAR(50),
                    status VARCHAR(50) DEFAULT 'in_bearbeitung',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Tabelle rapport_kpis erstellt');
        }
        
        // Finale Übersicht
        const allTeilprojekte = await pool.query('SELECT id, name, budget FROM sbv_teilprojekte ORDER BY id');
        const totalBudget = allTeilprojekte.rows.reduce((sum, row) => sum + parseFloat(row.budget), 0);
        
        console.log(`\n📈 Finale Übersicht:`);
        console.log(`   • Teilprojekte gesamt: ${allTeilprojekte.rows.length}`);
        console.log(`   • Gesamtbudget: CHF ${totalBudget.toLocaleString()}`);
        console.log(`\n🔍 Alle Teilprojekte:`);
        allTeilprojekte.rows.forEach(row => {
            console.log(`   • ${row.name} (ID: ${row.id}) - CHF ${parseFloat(row.budget).toLocaleString()}`);
        });
        
        console.log('\n🎉 Teilprojekte-System ist jetzt vollständig!');
        
    } catch (error) {
        console.error('❌ Fehler:', error);
    } finally {
        await pool.end();
    }
}

// Script ausführen
completeTeiprojekte();
