-- Demo-Daten für vollständig funktionsfähiges System
-- Wird in die PostgreSQL-Datenbank eingefügt

-- Teilprojekte mit realistischen Daten
INSERT INTO sbv_teilprojekte (name, beschreibung, budget_soll, start_datum, end_datum, status) VALUES 
('TPA - Teilprojekt A', 'Modernisierung der IT-Infrastruktur', 850000, '2024-01-01', '2025-12-31', 'aktiv'),
('TPB - Teilprojekt B', 'Digitalisierung der Verwaltungsprozesse', 450000, '2024-03-01', '2025-09-30', 'aktiv'),
('TPC - Teilprojekt C', 'Nachhaltigkeit und Energieeffizienz', 320000, '2024-06-01', '2025-12-31', 'aktiv'),
('TPD - Teilprojekt D', 'Personalentwicklung und Weiterbildung', 180000, '2024-01-15', '2025-06-30', 'geplant'),
('TPE - Teilprojekt E', 'Qualitätssicherung und Prozessoptimierung', 275000, '2024-04-01', '2025-10-31', 'aktiv')
ON CONFLICT DO NOTHING;

-- Massnahmen für Teilprojekte
INSERT INTO sbv_massnahmen (teilprojekt_id, name, beschreibung, budget, start_datum, end_datum, status) VALUES
-- TPA Massnahmen
(1, 'Server-Upgrade', 'Erneuerung der Serverhardware', 200000, '2024-02-01', '2024-08-31', 'in_bearbeitung'),
(1, 'Netzwerk-Modernisierung', 'Ausbau der Netzwerkinfrastruktur', 150000, '2024-03-01', '2024-12-31', 'geplant'),
(1, 'Backup-System', 'Implementation redundanter Backup-Systeme', 120000, '2024-01-15', '2024-06-30', 'abgeschlossen'),

-- TPB Massnahmen  
(2, 'Dokumenten-Management', 'Einführung digitales Dokumentenmanagement', 180000, '2024-04-01', '2025-03-31', 'in_bearbeitung'),
(2, 'Workflow-Automatisierung', 'Automatisierung wiederkehrender Prozesse', 140000, '2024-06-01', '2025-05-31', 'geplant'),

-- TPC Massnahmen
(3, 'Photovoltaik-Anlage', 'Installation von Solaranlagen', 180000, '2024-07-01', '2025-06-30', 'in_bearbeitung'),
(3, 'LED-Beleuchtung', 'Umstellung auf energieeffiziente Beleuchtung', 85000, '2024-06-15', '2024-12-31', 'geplant'),

-- TPD Massnahmen
(4, 'Schulungsprogramm', 'Umfassendes Weiterbildungsprogramm', 120000, '2024-02-01', '2025-01-31', 'aktiv'),

-- TPE Massnahmen
(5, 'Qualitäts-Audit', 'Externe Qualitätsprüfung', 80000, '2024-05-01', '2024-11-30', 'geplant'),
(5, 'Prozess-Dokumentation', 'Standardisierung aller Arbeitsprozesse', 95000, '2024-04-15', '2025-02-28', 'in_bearbeitung')
ON CONFLICT DO NOTHING;

-- KPIs für Teilprojekte
INSERT INTO sbv_kpis (teilprojekt_id, name, beschreibung, zielwert, einheit, aktueller_wert, mess_datum) VALUES
-- TPA KPIs
(1, 'Server-Performance', 'Verbesserte Systemleistung', 95, '%', 78, '2024-06-30'),
(1, 'Ausfallzeiten', 'Reduzierung der Systemausfälle', 2, 'Stunden/Monat', 8, '2024-06-30'),
(1, 'Energieeffizienz', 'Reduktion des Stromverbrauchs', 20, '% Einsparung', 12, '2024-06-30'),

-- TPB KPIs
(2, 'Prozesszeit', 'Verkürzung der Bearbeitungszeit', 50, '% Reduktion', 25, '2024-06-30'),
(2, 'Digitalisierungsgrad', 'Anteil digitaler Prozesse', 80, '%', 45, '2024-06-30'),

-- TPC KPIs  
(3, 'CO2-Reduktion', 'Verringerung der CO2-Emissionen', 30, '% Reduktion', 18, '2024-06-30'),
(3, 'Energieeinsparung', 'Jährliche Energiekosteneinsparung', 150000, 'CHF', 87000, '2024-06-30'),

-- TPD KPIs
(4, 'Schulungsteilnahme', 'Anteil geschulter Mitarbeiter', 90, '%', 65, '2024-06-30'),
(4, 'Kompetenzbewertung', 'Durchschnittliche Kompetenzbewertung', 4.5, 'Punkte (1-5)', 3.8, '2024-06-30'),

-- TPE KPIs
(5, 'Qualitätsscore', 'Externe Qualitätsbewertung', 95, 'Punkte', 87, '2024-06-30'),
(5, 'Prozesseffizienz', 'Verbesserung der Prozesseffizienz', 25, '% Steigerung', 15, '2024-06-30')
ON CONFLICT DO NOTHING;

-- Demo-Gesuche mit verschiedenen Jahren
INSERT INTO sbv_gesuche (titel, gesuch_typ, jahr, status, eingereicht_am, uploaded_file, beschreibung, file_size) VALUES
('TPA Modernisierung 2024', 'partner', 2024, 'genehmigt', '2024-01-15', 'TPA_Gesuch_2024.pdf', 'Gesuch für IT-Modernisierung TPA', 2048576),
('TPB Digitalisierung 2024', 'partner', 2024, 'in_bearbeitung', '2024-03-01', 'TPB_Antrag_2024.pdf', 'Digitalisierungsinitiative TPB', 3145728),
('TPC Nachhaltigkeit 2025', 'partner', 2025, 'eingereicht', '2025-06-01', 'TPC_Gesuch_2025.pdf', 'Nachhaltigkeitsprojekt TPC', 1572864),
('TPD Weiterbildung 2023', 'partner', 2023, 'abgeschlossen', '2023-12-15', 'TPD_Gesuch_2023.pdf', 'Personalentwicklung TPD', 2621440),
('TPE Qualität 2024', 'partner', 2024, 'genehmigt', '2024-04-20', 'TPE_Antrag_2024.pdf', 'Qualitätssicherung TPE', 1835008)
ON CONFLICT DO NOTHING;

-- Demo-Berichte/Rapporte
INSERT INTO sbv_berichte (gesuch_id, teilprojekt_id, titel, jahr, periode, status, budget_brutto, ist_brutto, erstellt_am) VALUES
(1, 1, 'TPA Zwischenbericht Q2 2024', 2024, 'Q2-2024', 'bestätigt', 850000, 425000, '2024-06-30'),
(2, 2, 'TPB Statusbericht Q1 2024', 2024, 'Q1-2024', 'in_bearbeitung', 450000, 180000, '2024-03-31'),
(3, 3, 'TPC Projektstart 2025', 2025, 'Q2-2025', 'ausstehend', 320000, 80000, '2025-06-15'),
(4, 4, 'TPD Abschlussbericht 2023', 2023, 'Q4-2023', 'abgeschlossen', 180000, 178500, '2023-12-31'),
(5, 5, 'TPE Quartalsbericht Q2 2024', 2024, 'Q2-2024', 'zur_pruefung', 275000, 137500, '2024-06-30')
ON CONFLICT DO NOTHING;
