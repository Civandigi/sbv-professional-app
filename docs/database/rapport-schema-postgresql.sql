-- PostgreSQL-Datenbank-Schema für Rapport-Management

-- 1. Haupttabelle für Rapporte
CREATE TABLE rapporte (
    id SERIAL PRIMARY KEY,
    rapport_nummer VARCHAR(20) UNIQUE NOT NULL, -- z.B. "R-2024-001"
    teilprojekt VARCHAR(50) NOT NULL, -- 'leitmedien', 'digitale-medien', 'social-media', 'messen'
    jahr INTEGER NOT NULL,
    periode VARCHAR(20) NOT NULL, -- 'Q1', 'Q2', 'Q3', 'Q4', 'JAHR'
    status VARCHAR(30) DEFAULT 'ausstehend', -- 'ausstehend', 'in-bearbeitung', 'zur-pruefung', 'genehmigt', 'abgelehnt'
    
    -- Budget-Informationen
    budget_brutto DECIMAL(10,2) NOT NULL,
    ist_brutto DECIMAL(10,2) DEFAULT 0,
    aufwandsminderung DECIMAL(10,2) DEFAULT 0,
    kosten_netto DECIMAL(10,2) GENERATED ALWAYS AS (ist_brutto - aufwandsminderung) STORED,
    budget_varianz DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN budget_brutto != 0 THEN (ist_brutto - budget_brutto) / budget_brutto * 100 
            ELSE 0 
        END
    ) STORED,
    
    -- Qualitative Bewertung
    was_lief_gut TEXT,
    abweichungen TEXT,
    lessons_learned TEXT,
    
    -- Meta-Informationen
    erstellt_von INTEGER REFERENCES sbv_benutzer(id),
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aktualisiert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    genehmigt_von INTEGER REFERENCES sbv_benutzer(id),
    genehmigt_am TIMESTAMP NULL
);

-- Index für bessere Performance
CREATE INDEX idx_rapporte_teilprojekt ON rapporte(teilprojekt);
CREATE INDEX idx_rapporte_jahr_periode ON rapporte(jahr, periode);
CREATE INDEX idx_rapporte_status ON rapporte(status);

-- 2. Tabelle für Maßnahmen (editierbar durch Admin)
CREATE TABLE rapport_massnahmen (
    id SERIAL PRIMARY KEY,
    rapport_id INTEGER NOT NULL REFERENCES rapporte(id) ON DELETE CASCADE,
    massnahme_name VARCHAR(200) NOT NULL,
    budget_plan DECIMAL(10,2) NOT NULL,
    ist_wert DECIMAL(10,2) DEFAULT 0,
    beschreibung TEXT,
    sortierung INTEGER DEFAULT 0
);

CREATE INDEX idx_rapport_massnahmen_rapport ON rapport_massnahmen(rapport_id);

-- 3. Tabelle für KPIs (editierbar durch Admin)
CREATE TABLE rapport_kpis (
    id SERIAL PRIMARY KEY,
    rapport_id INTEGER NOT NULL REFERENCES rapporte(id) ON DELETE CASCADE,
    kpi_name VARCHAR(200) NOT NULL,
    zielwert DECIMAL(10,2) NOT NULL,
    ist_wert DECIMAL(10,2) DEFAULT 0,
    zielerreichung DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN zielwert != 0 THEN (ist_wert / zielwert * 100) 
            ELSE 0 
        END
    ) STORED,
    einheit VARCHAR(50), -- 'Stück', 'EUR', '%', 'Leads', etc.
    beschreibung TEXT,
    sortierung INTEGER DEFAULT 0
);

CREATE INDEX idx_rapport_kpis_rapport ON rapport_kpis(rapport_id);

-- 4. Tabelle für Rapport-Anhänge
CREATE TABLE rapport_anhaenge (
    id SERIAL PRIMARY KEY,
    rapport_id INTEGER NOT NULL REFERENCES rapporte(id) ON DELETE CASCADE,
    dateiname VARCHAR(255) NOT NULL,
    datei_pfad VARCHAR(500) NOT NULL,
    dateigröße BIGINT,
    mime_type VARCHAR(100),
    hochgeladen_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hochgeladen_von INTEGER REFERENCES sbv_benutzer(id)
);

-- 5. Rapport-Templates für Teilprojekte
CREATE TABLE rapport_templates (
    id SERIAL PRIMARY KEY,
    teilprojekt VARCHAR(50) NOT NULL,
    template_name VARCHAR(100) NOT NULL,
    template_data JSONB NOT NULL, -- Enthält Maßnahmen und KPIs als JSON
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aktualisiert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Audit-Log für Rapport-Änderungen
CREATE TABLE rapport_audit_log (
    id SERIAL PRIMARY KEY,
    rapport_id INTEGER REFERENCES rapporte(id) ON DELETE CASCADE,
    aktion VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT'
    alte_daten JSONB,
    neue_daten JSONB,
    benutzer_id INTEGER REFERENCES sbv_benutzer(id),
    zeitstempel TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update Trigger für aktualisiert_am
CREATE OR REPLACE FUNCTION update_aktualisiert_am()
RETURNS TRIGGER AS $$
BEGIN
    NEW.aktualisiert_am = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER rapporte_aktualisiert_am_trigger
    BEFORE UPDATE ON rapporte
    FOR EACH ROW
    EXECUTE FUNCTION update_aktualisiert_am();

CREATE TRIGGER rapport_templates_aktualisiert_am_trigger
    BEFORE UPDATE ON rapport_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_aktualisiert_am();

-- Demo-Daten einfügen (alle für 2024)
INSERT INTO rapport_templates (teilprojekt, template_name, template_data) VALUES 
('leitmedien', 'Standard Leitmedien Template', '{
    "massnahmen": [
        {"name": "Print-Anzeigen", "budget_plan": 15000, "beschreibung": "Anzeigen in Fachzeitschriften"},
        {"name": "PR-Aktivitäten", "budget_plan": 8000, "beschreibung": "Pressemitteilungen und Events"}
    ],
    "kpis": [
        {"name": "Anzeigen-Reichweite", "zielwert": 50000, "einheit": "Kontakte", "beschreibung": "Kontakte über Print-Anzeigen"},
        {"name": "PR-Erwähnungen", "zielwert": 25, "einheit": "Stück", "beschreibung": "Anzahl PR-Erwähnungen"}
    ]
}'),
('digitale-medien', 'Standard Digitale Medien Template', '{
    "massnahmen": [
        {"name": "Google Ads", "budget_plan": 20000, "beschreibung": "Suchmaschinenwerbung"},
        {"name": "Facebook/LinkedIn Ads", "budget_plan": 12000, "beschreibung": "Social Media Advertising"}
    ],
    "kpis": [
        {"name": "CTR Google Ads", "zielwert": 3.5, "einheit": "%", "beschreibung": "Click-Through-Rate"},
        {"name": "Conversion Rate", "zielwert": 2.2, "einheit": "%", "beschreibung": "Konversionsrate Landing Page"}
    ]
}');

-- Demo Rapporte für 2024
INSERT INTO rapporte (rapport_nummer, teilprojekt, jahr, periode, status, budget_brutto, ist_brutto, was_lief_gut, abweichungen, erstellt_von) 
VALUES 
('R-2024-001', 'leitmedien', 2024, 'Q1', 'genehmigt', 25000.00, 23500.00, 'Sehr gute Medienresonanz in Q1', 'Leichte Budgetunterschreitung durch günstigere Medienplätze', 1),
('R-2024-002', 'digitale-medien', 2024, 'Q1', 'genehmigt', 35000.00, 36200.00, 'Hohe Conversion-Rate erreicht', 'Leichte Budgetüberschreitung durch zusätzliche Keywords', 1),
('R-2024-003', 'leitmedien', 2024, 'Q2', 'zur-pruefung', 28000.00, 27800.00, 'Erfolgreiche Messe-Nachbereitung', 'Planmäßige Umsetzung', 1);

-- Demo Maßnahmen
INSERT INTO rapport_massnahmen (rapport_id, massnahme_name, budget_plan, ist_wert, beschreibung, sortierung) VALUES 
(1, 'Print-Anzeigen', 15000.00, 14200.00, 'Anzeigen in Fachzeitschriften Q1', 1),
(1, 'PR-Aktivitäten', 8000.00, 7500.00, 'Pressemitteilungen und Events Q1', 2),
(2, 'Google Ads', 20000.00, 21000.00, 'Suchmaschinenwerbung Q1', 1),
(2, 'Facebook/LinkedIn Ads', 12000.00, 11800.00, 'Social Media Advertising Q1', 2);

-- Demo KPIs  
INSERT INTO rapport_kpis (rapport_id, kpi_name, zielwert, ist_wert, einheit, beschreibung, sortierung) VALUES 
(1, 'Anzeigen-Reichweite', 50000, 52000, 'Kontakte', 'Kontakte über Print-Anzeigen Q1', 1),
(1, 'PR-Erwähnungen', 25, 28, 'Stück', 'Anzahl PR-Erwähnungen Q1', 2),
(2, 'CTR Google Ads', 3.5, 4.1, '%', 'Click-Through-Rate Q1', 1),
(2, 'Conversion Rate', 2.2, 2.8, '%', 'Konversionsrate Landing Page Q1', 2);
