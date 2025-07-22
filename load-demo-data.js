// Demo-Daten für vollständige Funktionalität
const { Pool } = require('pg');

const pool = new Pool({
    host: 'postgresql-sbv-fg-app-u38422.vm.elestio.app',
    port: 25432,
    user: 'postgres',
    password: 'MDmWLdVvYdHfMbWEA4XHIUQ4j7KZNVW9',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
});

async function insertDemoData() {
    try {
        console.log('🚀 Lade Demo-Daten...');

        // Teilprojekte
        await pool.query(`
            INSERT INTO sbv_teilprojekte (name, beschreibung, budget_soll, start_datum, end_datum, status) VALUES 
            ('TPA - Teilprojekt A', 'Modernisierung der IT-Infrastruktur', 850000, '2024-01-01', '2025-12-31', 'aktiv'),
            ('TPB - Teilprojekt B', 'Digitalisierung der Verwaltungsprozesse', 450000, '2024-03-01', '2025-09-30', 'aktiv'),
            ('TPC - Teilprojekt C', 'Nachhaltigkeit und Energieeffizienz', 320000, '2024-06-01', '2025-12-31', 'aktiv'),
            ('TPD - Teilprojekt D', 'Personalentwicklung und Weiterbildung', 180000, '2024-01-15', '2025-06-30', 'geplant'),
            ('TPE - Teilprojekt E', 'Qualitätssicherung und Prozessoptimierung', 275000, '2024-04-01', '2025-10-31', 'aktiv')
            ON CONFLICT (name) DO NOTHING
        `);

        // Massnahmen
        await pool.query(`
            INSERT INTO sbv_massnahmen (teilprojekt_id, name, beschreibung, budget, start_datum, end_datum, status) VALUES
            (1, 'Server-Upgrade', 'Erneuerung der Serverhardware', 200000, '2024-02-01', '2024-08-31', 'in_bearbeitung'),
            (1, 'Netzwerk-Modernisierung', 'Ausbau der Netzwerkinfrastruktur', 150000, '2024-03-01', '2024-12-31', 'geplant'),
            (1, 'Backup-System', 'Implementation redundanter Backup-Systeme', 120000, '2024-01-15', '2024-06-30', 'abgeschlossen'),
            (2, 'Dokumenten-Management', 'Einführung digitales Dokumentenmanagement', 180000, '2024-04-01', '2025-03-31', 'in_bearbeitung'),
            (2, 'Workflow-Automatisierung', 'Automatisierung wiederkehrender Prozesse', 140000, '2024-06-01', '2025-05-31', 'geplant'),
            (3, 'Photovoltaik-Anlage', 'Installation von Solaranlagen', 180000, '2024-07-01', '2025-06-30', 'in_bearbeitung'),
            (3, 'LED-Beleuchtung', 'Umstellung auf energieeffiziente Beleuchtung', 85000, '2024-06-15', '2024-12-31', 'geplant'),
            (4, 'Schulungsprogramm', 'Umfassendes Weiterbildungsprogramm', 120000, '2024-02-01', '2025-01-31', 'aktiv'),
            (5, 'Qualitäts-Audit', 'Externe Qualitätsprüfung', 80000, '2024-05-01', '2024-11-30', 'geplant'),
            (5, 'Prozess-Dokumentation', 'Standardisierung aller Arbeitsprozesse', 95000, '2024-04-15', '2025-02-28', 'in_bearbeitung')
            ON CONFLICT DO NOTHING
        `);

        // KPIs
        await pool.query(`
            INSERT INTO sbv_kpis (teilprojekt_id, name, beschreibung, zielwert, einheit, aktueller_wert, mess_datum) VALUES
            (1, 'Server-Performance', 'Verbesserte Systemleistung', 95, '%', 78, '2024-06-30'),
            (1, 'Ausfallzeiten', 'Reduzierung der Systemausfälle', 2, 'Stunden/Monat', 8, '2024-06-30'),
            (1, 'Energieeffizienz', 'Reduktion des Stromverbrauchs', 20, '% Einsparung', 12, '2024-06-30'),
            (2, 'Prozesszeit', 'Verkürzung der Bearbeitungszeit', 50, '% Reduktion', 25, '2024-06-30'),
            (2, 'Digitalisierungsgrad', 'Anteil digitaler Prozesse', 80, '%', 45, '2024-06-30'),
            (3, 'CO2-Reduktion', 'Verringerung der CO2-Emissionen', 30, '% Reduktion', 18, '2024-06-30'),
            (3, 'Energieeinsparung', 'Jährliche Energiekosteneinsparung', 150000, 'CHF', 87000, '2024-06-30'),
            (4, 'Schulungsteilnahme', 'Anteil geschulter Mitarbeiter', 90, '%', 65, '2024-06-30'),
            (4, 'Kompetenzbewertung', 'Durchschnittliche Kompetenzbewertung', 4.5, 'Punkte (1-5)', 3.8, '2024-06-30'),
            (5, 'Qualitätsscore', 'Externe Qualitätsbewertung', 95, 'Punkte', 87, '2024-06-30'),
            (5, 'Prozesseffizienz', 'Verbesserung der Prozesseffizienz', 25, '% Steigerung', 15, '2024-06-30')
            ON CONFLICT DO NOTHING
        `);

        // Gesuche
        await pool.query(`
            INSERT INTO sbv_gesuche (titel, gesuch_typ, jahr, status, eingereicht_am, uploaded_file, beschreibung, file_size) VALUES
            ('TPA Modernisierung 2024', 'partner', 2024, 'genehmigt', '2024-01-15', 'TPA_Gesuch_2024.pdf', 'Gesuch für IT-Modernisierung TPA', 2048576),
            ('TPB Digitalisierung 2024', 'partner', 2024, 'in_bearbeitung', '2024-03-01', 'TPB_Antrag_2024.pdf', 'Digitalisierungsinitiative TPB', 3145728),
            ('TPC Nachhaltigkeit 2025', 'partner', 2025, 'eingereicht', '2025-06-01', 'TPC_Gesuch_2025.pdf', 'Nachhaltigkeitsprojekt TPC', 1572864),
            ('TPD Weiterbildung 2023', 'partner', 2023, 'abgeschlossen', '2023-12-15', 'TPD_Gesuch_2023.pdf', 'Personalentwicklung TPD', 2621440),
            ('TPE Qualität 2024', 'partner', 2024, 'genehmigt', '2024-04-20', 'TPE_Antrag_2024.pdf', 'Qualitätssicherung TPE', 1835008)
            ON CONFLICT DO NOTHING
        `);

        console.log('✅ Demo-Daten erfolgreich geladen!');
        console.log('📊 Verfügbare Teilprojekte: TPA, TPB, TPC, TPD, TPE');
        console.log('📋 Alle Teilprojekte haben Massnahmen und KPIs');
        console.log('📄 Demo-Gesuche für verschiedene Jahre (2023-2025)');

    } catch (error) {
        console.error('❌ Fehler beim Laden der Demo-Daten:', error);
    } finally {
        await pool.end();
    }
}

insertDemoData();
