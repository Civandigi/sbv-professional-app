// Script zum Erstellen der Teilprojekte-Tabelle und Daten
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

async function createTeilprojekteTable() {
    try {
        console.log('🏗️  Erstelle sbv_teilprojekte Tabelle...');
        
        // Erstelle die Teilprojekte-Tabelle
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sbv_teilprojekte (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                beschreibung TEXT,
                budget DECIMAL(12,2) DEFAULT 0,
                jahr INTEGER DEFAULT 2025,
                status VARCHAR(50) DEFAULT 'aktiv',
                kategorie VARCHAR(100),
                gesuch_id INTEGER REFERENCES sbv_gesuche(id),
                bericht_id VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Tabelle sbv_teilprojekte erstellt');
        
        // Erstelle auch Tabelle für Maßnahmen
        await pool.query(`
            CREATE TABLE IF NOT EXISTS rapport_massnahmen (
                id SERIAL PRIMARY KEY,
                teilprojekt_id INTEGER REFERENCES sbv_teilprojekte(id),
                name VARCHAR(255) NOT NULL,
                beschreibung TEXT,
                budget DECIMAL(12,2) DEFAULT 0,
                status VARCHAR(50) DEFAULT 'geplant',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Tabelle rapport_massnahmen erstellt');
        
        // Erstelle auch Tabelle für KPIs
        await pool.query(`
            CREATE TABLE IF NOT EXISTS rapport_kpis (
                id SERIAL PRIMARY KEY,
                teilprojekt_id INTEGER REFERENCES sbv_teilprojekte(id),
                name VARCHAR(255) NOT NULL,
                zielwert DECIMAL(10,2),
                aktueller_wert DECIMAL(10,2) DEFAULT 0,
                einheit VARCHAR(50),
                status VARCHAR(50) DEFAULT 'in_bearbeitung',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Tabelle rapport_kpis erstellt');
        
        // Die 6 Teilprojekte-Struktur
        const teilprojekte = [
            {
                name: 'TP1 - Leitmedien',
                beschreibung: 'Traditionelle Medien und Pressearbeit für maximale Reichweite',
                budget: 810000, // CHF 810'000
                jahr: 2025,
                status: 'aktiv',
                kategorie: 'medien'
            },
            {
                name: 'TP2 - Digitale Medien',
                beschreibung: 'Online-Präsenz, Social Media und digitale Kampagnen',
                budget: 675000, // CHF 675'000
                jahr: 2025,
                status: 'aktiv',
                kategorie: 'digital'
            },
            {
                name: 'TP3 - Messen & Ausstellungen',
                beschreibung: 'Präsenz auf Fachmessen und Ausstellungen',
                budget: 540000, // CHF 540'000
                jahr: 2025,
                status: 'aktiv',
                kategorie: 'events'
            },
            {
                name: 'TP4 - Events & Aktionen',
                beschreibung: 'Eigene Events und Aktionen zur Zielgruppenerreichung',
                budget: 945000, // CHF 945'000
                jahr: 2025,
                status: 'aktiv',
                kategorie: 'events'
            },
            {
                name: 'TP5 - Schulprojekte',
                beschreibung: 'Bildungs- und Aufklärungsprojekte in Schulen',
                budget: 675000, // CHF 675'000
                jahr: 2025,
                status: 'aktiv',
                kategorie: 'bildung'
            },
            {
                name: 'TP6 - Partnerprojekte',
                beschreibung: 'Kooperationen und Partnerschaften mit anderen Organisationen',
                budget: 765000, // CHF 765'000
                jahr: 2025,
                status: 'aktiv',
                kategorie: 'kooperationen'
            }
        ];
        
        // Erstelle alle 6 Teilprojekte
        console.log('📊 Erstelle Teilprojekte-Daten...');
        for (let i = 0; i < teilprojekte.length; i++) {
            const tp = teilprojekte[i];
            const result = await pool.query(
                `INSERT INTO sbv_teilprojekte 
                (name, beschreibung, budget, jahr, status, kategorie, created_at) 
                VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
                RETURNING id, name`,
                [tp.name, tp.beschreibung, tp.budget, tp.jahr, tp.status, tp.kategorie]
            );
            
            console.log(`✅ Erstellt: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
            
            // Erstelle Beispiel-Maßnahmen für jedes Teilprojekt
            await pool.query(
                `INSERT INTO rapport_massnahmen (teilprojekt_id, name, beschreibung, budget, status)
                VALUES ($1, $2, $3, $4, 'aktiv')`,
                [result.rows[0].id, `Maßnahme 1 - ${tp.name}`, `Hauptaktivität für ${tp.name}`, tp.budget * 0.6]
            );
            
            await pool.query(
                `INSERT INTO rapport_massnahmen (teilprojekt_id, name, beschreibung, budget, status)
                VALUES ($1, $2, $3, $4, 'geplant')`,
                [result.rows[0].id, `Maßnahme 2 - ${tp.name}`, `Ergänzende Aktivität für ${tp.name}`, tp.budget * 0.4]
            );
            
            // Erstelle Beispiel-KPIs für jedes Teilprojekt
            await pool.query(
                `INSERT INTO rapport_kpis (teilprojekt_id, name, zielwert, aktueller_wert, einheit, status)
                VALUES ($1, 'Reichweite', 100000, 85000, 'Personen', 'auf_kurs')`,
                [result.rows[0].id]
            );
            
            await pool.query(
                `INSERT INTO rapport_kpis (teilprojekt_id, name, zielwert, aktueller_wert, einheit, status)
                VALUES ($1, 'Engagement Rate', 5.5, 4.2, 'Prozent', 'in_bearbeitung')`,
                [result.rows[0].id]
            );
        }
        
        // Statistik anzeigen
        const totalBudget = teilprojekte.reduce((sum, tp) => sum + tp.budget, 0);
        console.log(`\n📈 Zusammenfassung:`);
        console.log(`   • Teilprojekte erstellt: ${teilprojekte.length}`);
        console.log(`   • Gesamtbudget: CHF ${totalBudget.toLocaleString()}`);
        console.log(`   • Jahr: 2025`);
        console.log(`   • Maßnahmen pro TP: 2`);
        console.log(`   • KPIs pro TP: 2`);
        
        // Finale Überprüfung
        const finalCheck = await pool.query('SELECT id, name, budget FROM sbv_teilprojekte ORDER BY id');
        console.log(`\n🔍 Erstellte Teilprojekte:`);
        finalCheck.rows.forEach(row => {
            console.log(`   • ${row.name} (ID: ${row.id}) - CHF ${row.budget.toLocaleString()}`);
        });
        
        console.log('\n🎉 Datenbank vollständig eingerichtet!');
        
    } catch (error) {
        console.error('❌ Fehler:', error);
    } finally {
        await pool.end();
    }
}

// Script ausführen
createTeilprojekteTable();
