-- PostgreSQL Schema für SBV Professional App
-- Erstellt: 22. Juli 2025

-- Benutzer-Tabelle
CREATE TABLE IF NOT EXISTS sbv_benutzer (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rolle VARCHAR(50) DEFAULT 'user',
    status VARCHAR(20) DEFAULT 'aktiv',
    letzter_login TIMESTAMP,
    erstellt_am TIMESTAMP DEFAULT NOW(),
    aktualisiert_am TIMESTAMP DEFAULT NOW()
);

-- Rapport/Berichte-Tabelle
CREATE TABLE IF NOT EXISTS sbv_berichte (
    id SERIAL PRIMARY KEY,
    titel VARCHAR(255) NOT NULL,
    inhalt TEXT,
    status VARCHAR(50) DEFAULT 'entwurf',
    erstellt_von INTEGER REFERENCES sbv_benutzer(id),
    erstellt_am TIMESTAMP DEFAULT NOW(),
    aktualisiert_am TIMESTAMP DEFAULT NOW(),
    genehmigt_von INTEGER REFERENCES sbv_benutzer(id),
    genehmigt_am TIMESTAMP
);

-- Gesuche-Tabelle
CREATE TABLE IF NOT EXISTS sbv_gesuche (
    id SERIAL PRIMARY KEY,
    titel VARCHAR(255) NOT NULL,
    beschreibung TEXT,
    status VARCHAR(50) DEFAULT 'neu',
    prioritaet VARCHAR(50) DEFAULT 'mittel',
    gesuch_typ VARCHAR(50) DEFAULT 'partner',
    finanz_betrag DECIMAL(15,2),
    genehmigt BOOLEAN DEFAULT false,
    genehmigt_am TIMESTAMP,
    erstellt_von INTEGER REFERENCES sbv_benutzer(id),
    zugewiesen_an INTEGER REFERENCES sbv_benutzer(id),
    erstellt_am TIMESTAMP DEFAULT NOW(),
    aktualisiert_am TIMESTAMP DEFAULT NOW()
);

-- Testdaten einfügen - Super Admin
INSERT INTO sbv_benutzer (name, email, password_hash, rolle, status)
VALUES (
    'Super Admin - Digitale Rakete',
    'superadmin@digitale-rakete.ch',
    -- Das Passwort ist: SBV-Admin-2025-SecurePass!
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewE9fzDGNPXOZZLu',
    'super_admin',
    'aktiv'
) ON CONFLICT (email) DO NOTHING;

-- Testdaten einfügen - Admin
INSERT INTO sbv_benutzer (name, email, password_hash, rolle, status)
VALUES (
    'Test Admin',
    'admin@sbv-demo.ch',
    -- Das Passwort ist: test123
    '$2b$12$K8H6.Z1rx58QwHD9JB0ceuMzusCvv.D4wGI32.WVpIE.3m3y5.Nk2',
    'admin',
    'aktiv'
) ON CONFLICT (email) DO NOTHING;

-- Testdaten einfügen - User
INSERT INTO sbv_benutzer (name, email, password_hash, rolle, status)
VALUES (
    'Test User',
    'user@sbv-demo.ch',
    -- Das Passwort ist: test123
    '$2b$12$K8H6.Z1rx58QwHD9JB0ceuMzusCvv.D4wGI32.WVpIE.3m3y5.Nk2',
    'user',
    'aktiv'
) ON CONFLICT (email) DO NOTHING;
