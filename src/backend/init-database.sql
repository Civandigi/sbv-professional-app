-- Datenbank-Schema für Rapport-Management

-- 1. Haupttabelle für Rapporte
CREATE TABLE rapporte (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rapport_nummer VARCHAR(20) UNIQUE NOT NULL, -- z.B. "R-2024-001"
    teilprojekt VARCHAR(50) NOT NULL, -- 'leitmedien', 'digitale-medien', 'social-media', 'messen'
    jahr INT NOT NULL,
    periode VARCHAR(20) NOT NULL, -- 'Q1', 'Q2', 'Q3', 'Q4', 'JAHR'
    status VARCHAR(30) DEFAULT 'ausstehend', -- 'ausstehend', 'in-bearbeitung', 'zur-pruefung', 'genehmigt', 'abgelehnt'
    
    -- Budget-Informationen
    budget_brutto DECIMAL(10,2) NOT NULL,
    ist_brutto DECIMAL(10,2) DEFAULT 0,
    aufwandsminderung DECIMAL(10,2) DEFAULT 0,
    kosten_netto DECIMAL(10,2) GENERATED ALWAYS AS (ist_brutto - aufwandsminderung) STORED,
    budget_varianz DECIMAL(5,2) GENERATED ALWAYS AS ((ist_brutto - budget_brutto) / budget_brutto * 100) STORED,
    
    -- Qualitative Bewertung
    was_lief_gut TEXT,
    abweichungen TEXT,
    lessons_learned TEXT,
    
    -- Meta-Informationen
    erstellt_von INT REFERENCES users(id),
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aktualisiert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    genehmigt_von INT REFERENCES users(id),
    genehmigt_am TIMESTAMP NULL,
    
    INDEX idx_teilprojekt (teilprojekt),
    INDEX idx_jahr_periode (jahr, periode),
    INDEX idx_status (status)
);

-- 2. Tabelle für Maßnahmen (editierbar durch Admin)
CREATE TABLE rapport_massnahmen (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rapport_id INT NOT NULL REFERENCES rapporte(id) ON DELETE CASCADE,
    massnahme_name VARCHAR(200) NOT NULL,
    budget_plan DECIMAL(10,2) NOT NULL,
    ist_wert DECIMAL(10,2) DEFAULT 0,
    beschreibung TEXT,
    sortierung INT DEFAULT 0,
    
    INDEX idx_rapport (rapport_id)
);

-- 3. Tabelle für KPIs (editierbar durch Admin)
CREATE TABLE rapport_kpis (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rapport_id INT NOT NULL REFERENCES rapporte(id) ON DELETE CASCADE,
    kpi_name VARCHAR(200) NOT NULL,
    einheit VARCHAR(50) NOT NULL, -- 'Personen', '%', 'CHF', 'Impressions', etc.
    zielwert DECIMAL(15,2) NOT NULL,
    istwert DECIMAL(15,2) DEFAULT 0,
    zielerreichung DECIMAL(5,2) GENERATED ALWAYS AS (istwert / zielwert * 100) STORED,
    sortierung INT DEFAULT 0,
    
    INDEX idx_rapport (rapport_id)
);

-- 4. Template-Tabelle für Teilprojekt-Standards (für neue Rapporte)
CREATE TABLE teilprojekt_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teilprojekt VARCHAR(50) NOT NULL,
    budget_standard DECIMAL(10,2) NOT NULL,
    aktiv BOOLEAN DEFAULT TRUE,
    UNIQUE KEY uk_teilprojekt (teilprojekt)
);

-- 5. Template für Standard-Maßnahmen pro Teilprojekt
CREATE TABLE template_massnahmen (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teilprojekt VARCHAR(50) NOT NULL,
    massnahme_name VARCHAR(200) NOT NULL,
    budget_standard DECIMAL(10,2) NOT NULL,
    sortierung INT DEFAULT 0,
    aktiv BOOLEAN DEFAULT TRUE,
    
    INDEX idx_teilprojekt (teilprojekt)
);

-- 6. Template für Standard-KPIs pro Teilprojekt
CREATE TABLE template_kpis (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teilprojekt VARCHAR(50) NOT NULL,
    kpi_name VARCHAR(200) NOT NULL,
    einheit VARCHAR(50) NOT NULL,
    zielwert_standard DECIMAL(15,2) NOT NULL,
    sortierung INT DEFAULT 0,
    aktiv BOOLEAN DEFAULT TRUE,
    
    INDEX idx_teilprojekt (teilprojekt)
);

-- Beispiel-Daten für Templates
INSERT INTO teilprojekt_templates (teilprojekt, budget_standard) VALUES
('leitmedien', 45000),
('digitale-medien', 35000),
('social-media', 25000),
('messen', 20000);

INSERT INTO template_massnahmen (teilprojekt, massnahme_name, budget_standard, sortierung) VALUES
-- Leitmedien
('leitmedien', 'Anzeigen in Fachzeitschriften', 20000, 1),
('leitmedien', 'Redaktionelle Beiträge', 15000, 2),
('leitmedien', 'Advertorials', 10000, 3),
-- Digitale Medien
('digitale-medien', 'Website-Content', 15000, 1),
('digitale-medien', 'Newsletter-Kampagnen', 10000, 2),
('digitale-medien', 'SEA/Google Ads', 10000, 3),
-- Social Media
('social-media', 'Content Creation', 10000, 1),
('social-media', 'Community Management', 8000, 2),
('social-media', 'Paid Social Ads', 7000, 3),
-- Messen
('messen', 'Messestand Design', 8000, 1),
('messen', 'Personal & Logistik', 7000, 2),
('messen', 'Promotion-Material', 5000, 3);

INSERT INTO template_kpis (teilprojekt, kpi_name, einheit, zielwert_standard, sortierung) VALUES
-- Leitmedien
('leitmedien', 'Reichweite Print', 'Leser', 50000, 1),
('leitmedien', 'Anzeigen-Impressions', 'Views', 100000, 2),
-- Digitale Medien
('digitale-medien', 'Website-Traffic', 'Besucher', 25000, 1),
('digitale-medien', 'Conversion Rate', '%', 3.5, 2),
('digitale-medien', 'Newsletter Open Rate', '%', 25, 3),
-- Social Media
('social-media', 'Follower-Wachstum', '%', 15, 1),
('social-media', 'Engagement Rate', '%', 4.5, 2),
('social-media', 'Reach', 'Impressions', 500000, 3),
-- Messen
('messen', 'Besucher am Stand', 'Personen', 1500, 1),
('messen', 'Qualifizierte Kontakte', 'Leads', 200, 2);

-- Nach Zeile 216 (Periode-Select) - Füge Gesamtjahr-Option hinzu
ALTER TABLE rapporte
ADD COLUMN gesamtjahr BOOLEAN DEFAULT FALSE;

-- Ersetze das Periode-Select mit erweiterter Version
<select name="periode" required class="w-full px-3 py-2 border border-gray-300 rounded-lg">
    <option value="">Bitte wählen</option>
    <option value="Q1-2024">Q1 2024</option>
    <option value="Q2-2024">Q2 2024</option>
    <option value="Q3-2024">Q3 2024</option>
    <option value="Q4-2024">Q4 2024</option>
    <option value="JAHR-2024">Gesamtjahr 2024</option>
</select>