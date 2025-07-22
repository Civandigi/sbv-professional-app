-- Test-Benutzer für SBV Professional Demo
-- Passwort für alle: "test123"

-- Super Admin: Kann alles (Upload, Bearbeiten, Genehmigen)
INSERT INTO sbv_benutzer (name, email, rolle, password_hash, status, erstellt_am) 
VALUES (
    'Max Mustermann (Super Admin)', 
    'superadmin@sbv-demo.ch', 
    'super_admin', 
    '$2b$12$LQv3c7n.5CkM8ZQKx9M4pu8f0eKlP5TmxXRk4cZgOJtRf9MNRQ.9W', 
    'aktiv',
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Admin: Kann Rapporte bearbeiten aber nicht genehmigen
INSERT INTO sbv_benutzer (name, email, rolle, password_hash, status, erstellt_am)
VALUES (
    'Anna Schmidt (Admin)', 
    'admin@sbv-demo.ch', 
    'admin', 
    '$2b$12$LQv3c7n.5CkM8ZQKx9M4pu8f0eKlP5TmxXRk4cZgOJtRf9MNRQ.9W', 
    'aktiv',
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Regular User: Kann nur Rapporte anschauen
INSERT INTO sbv_benutzer (name, email, rolle, password_hash, status, erstellt_am)
VALUES (
    'Peter Weber (User)', 
    'user@sbv-demo.ch', 
    'user', 
    '$2b$12$LQv3c7n.5CkM8ZQKx9M4pu8f0eKlP5TmxXRk4cZgOJtRf9MNRQ.9W', 
    'aktiv',
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Zusätzliche Demo-Daten: Beispiel-Rapporte
INSERT INTO sbv_berichte (titel, jahr, beschreibung, status, erstellt_am, erstellt_von, bericht_typ) VALUES
('Demo Rapport - Digitalisierung Q3', 2025, 'Beispiel-Rapport für Demo-Zwecke', 'entwurf', NOW(), 'System', 'rapport'),
('Infrastruktur Update Juli', 2025, 'Monatlicher Status-Rapport', 'in_bearbeitung', NOW(), 'admin@sbv-demo.ch', 'rapport'),
('Compliance Check 2025', 2025, 'Jährlicher Compliance-Rapport', 'fertig', NOW(), 'superadmin@sbv-demo.ch', 'rapport')
ON CONFLICT DO NOTHING;

-- Test-Credentials Übersicht
SELECT 
    'TEST-BENUTZER ERFOLGREICH ERSTELLT' as Status,
    'Passwort für alle: test123' as Credentials;

SELECT 
    name,
    email,
    rolle,
    status,
    'test123' as password
FROM sbv_benutzer 
WHERE email LIKE '%@sbv-demo.ch' 
ORDER BY 
    CASE 
        WHEN rolle = 'super_admin' THEN 1 
        WHEN rolle = 'admin' THEN 2 
        WHEN rolle = 'user' THEN 3 
    END;
