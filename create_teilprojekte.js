// Script zum Erstellen der 6 Teilprojekte in der Datenbank
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

async function createTeilprojekte() {
    try {
        console.log('🗄️  Erstelle Teilprojekte in der Datenbank...');
        
        // Zuerst prüfen ob Teilprojekte bereits existieren
        const existingCheck = await pool.query('SELECT COUNT(*) FROM sbv_teilprojekte');
        const count = parseInt(existingCheck.rows[0].count);
        
        console.log(`📊 Gefundene Teilprojekte in DB: ${count}`);
        
        if (count > 0) {
            console.log('⚠️  Teilprojekte existieren bereits. Lösche bestehende...');
            await pool.query('DELETE FROM sbv_teilprojekte');
        }
        
        // Erstelle alle 6 Teilprojekte
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
        }
        
        // Statistik anzeigen
        const totalBudget = teilprojekte.reduce((sum, tp) => sum + tp.budget, 0);
        console.log(`\n📈 Zusammenfassung:`);
        console.log(`   • Teilprojekte erstellt: ${teilprojekte.length}`);
        console.log(`   • Gesamtbudget: CHF ${totalBudget.toLocaleString()}`);
        console.log(`   • Jahr: 2025`);
        
        // Finale Überprüfung
        const finalCheck = await pool.query('SELECT id, name, budget FROM sbv_teilprojekte ORDER BY id');
        console.log(`\n🔍 Erstellte Teilprojekte:`);
        finalCheck.rows.forEach(row => {
            console.log(`   • ${row.name} (ID: ${row.id}) - CHF ${row.budget.toLocaleString()}`);
        });
        
        console.log('\n🎉 Teilprojekte erfolgreich erstellt!');
        
    } catch (error) {
        console.error('❌ Fehler beim Erstellen der Teilprojekte:', error);
    } finally {
        await pool.end();
    }
}

// Script ausführen
createTeilprojekte();
