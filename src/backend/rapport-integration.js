// SBV Rapport Management Integration für den bestehenden PostgreSQL Server
// Zu integrieren in src/backend/server.js

// ==========================================
// RAPPORT MANAGEMENT ROUTES 
// ==========================================

// Rapport-Schema für PostgreSQL (statt MySQL)
const rapportSchema = `
-- PostgreSQL Rapport Management Tables

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
    
    erstellt_von INTEGER REFERENCES sbv_benutzer(id),
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aktualisiert_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maßnahmen-Tabelle
CREATE TABLE IF NOT EXISTS rapport_massnahmen (
    id SERIAL PRIMARY KEY,
    rapport_id INTEGER REFERENCES rapporte(id) ON DELETE CASCADE,
    massnahme_name VARCHAR(200) NOT NULL,
    budget_plan DECIMAL(10,2) NOT NULL,
    ist_wert DECIMAL(10,2) DEFAULT 0,
    sortierung INTEGER DEFAULT 0
);

-- KPI-Tabelle
CREATE TABLE IF NOT EXISTS rapport_kpis (
    id SERIAL PRIMARY KEY,
    rapport_id INTEGER REFERENCES rapporte(id) ON DELETE CASCADE,
    kpi_name VARCHAR(200) NOT NULL,
    einheit VARCHAR(50) NOT NULL,
    zielwert DECIMAL(15,2) NOT NULL,
    istwert DECIMAL(15,2) DEFAULT 0,
    sortierung INTEGER DEFAULT 0
);

-- Template-Tabellen
CREATE TABLE IF NOT EXISTS teilprojekt_templates (
    id SERIAL PRIMARY KEY,
    teilprojekt VARCHAR(50) NOT NULL UNIQUE,
    budget_standard DECIMAL(10,2) NOT NULL,
    aktiv BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS template_massnahmen (
    id SERIAL PRIMARY KEY,
    teilprojekt VARCHAR(50) NOT NULL,
    massnahme_name VARCHAR(200) NOT NULL,
    budget_standard DECIMAL(10,2) NOT NULL,
    sortierung INTEGER DEFAULT 0,
    aktiv BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS template_kpis (
    id SERIAL PRIMARY KEY,
    teilprojekt VARCHAR(50) NOT NULL,
    kpi_name VARCHAR(200) NOT NULL,
    einheit VARCHAR(50) NOT NULL,
    zielwert_standard DECIMAL(15,2) NOT NULL,
    sortierung INTEGER DEFAULT 0,
    aktiv BOOLEAN DEFAULT TRUE
);
`;

// RAPPORT API ROUTES - Zu integrieren in server.js nach Zeile 200
const rapportRoutes = `

// ==========================================
// RAPPORT MANAGEMENT API ENDPOINTS
// ==========================================

// GET: Alle Rapporte abrufen
app.get('/api/rapporte', requireAuth, async (req, res) => {
    try {
        const { jahr, periode, teilprojekt, status } = req.query;
        let query = \`
            SELECT r.*, 
                   COUNT(DISTINCT rm.id) as anzahl_massnahmen,
                   COUNT(DISTINCT rk.id) as anzahl_kpis,
                   AVG(CASE WHEN rk.zielwert > 0 THEN rk.istwert / rk.zielwert * 100 ELSE 0 END) as durchschnitt_kpi_erreichung,
                   u.name as ersteller_name
            FROM rapporte r
            LEFT JOIN rapport_massnahmen rm ON r.id = rm.rapport_id
            LEFT JOIN rapport_kpis rk ON r.id = rk.rapport_id
            LEFT JOIN sbv_benutzer u ON r.erstellt_von = u.id
            WHERE 1=1
        \`;
        const params = [];
        let paramIndex = 1;

        if (jahr) {
            query += \` AND r.jahr = $\${paramIndex++}\`;
            params.push(jahr);
        }
        if (periode) {
            query += \` AND r.periode = $\${paramIndex++}\`;
            params.push(periode);
        }
        if (teilprojekt) {
            query += \` AND r.teilprojekt = $\${paramIndex++}\`;
            params.push(teilprojekt);
        }
        if (status) {
            query += \` AND r.status = $\${paramIndex++}\`;
            params.push(status);
        }

        query += ' GROUP BY r.id, u.name ORDER BY r.jahr DESC, r.periode DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        logger.error('Error fetching rapporte:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET: Einzelnen Rapport mit Details abrufen
app.get('/api/rapporte/:id', requireAuth, async (req, res) => {
    try {
        const rapportId = req.params.id;
        
        // Rapport-Grunddaten
        const rapportResult = await pool.query(
            \`SELECT r.*, u.name as ersteller_name 
             FROM rapporte r 
             LEFT JOIN sbv_benutzer u ON r.erstellt_von = u.id 
             WHERE r.id = $1\`,
            [rapportId]
        );
        
        if (rapportResult.rows.length === 0) {
            return res.status(404).json({ error: 'Rapport nicht gefunden' });
        }

        // Maßnahmen abrufen
        const massnahmenResult = await pool.query(
            'SELECT * FROM rapport_massnahmen WHERE rapport_id = $1 ORDER BY sortierung',
            [rapportId]
        );

        // KPIs abrufen
        const kpisResult = await pool.query(
            'SELECT * FROM rapport_kpis WHERE rapport_id = $1 ORDER BY sortierung',
            [rapportId]
        );

        const result = {
            ...rapportResult.rows[0],
            massnahmen: massnahmenResult.rows,
            kpis: kpisResult.rows
        };

        res.json(result);
    } catch (error) {
        logger.error('Error fetching rapport details:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST: Neuen Rapport erstellen
app.post('/api/rapporte', requireAuth, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { teilprojekt, jahr, periode, massnahmen, kpis, ...rapportData } = req.body;
        
        // Generiere Rapport-Nummer
        const lastRapportResult = await client.query(
            'SELECT rapport_nummer FROM rapporte WHERE jahr = $1 ORDER BY id DESC LIMIT 1',
            [jahr]
        );
        const nextNumber = lastRapportResult.rows.length > 0 
            ? parseInt(lastRapportResult.rows[0].rapport_nummer.split('-')[2]) + 1 
            : 1;
        const rapportNummer = \`R-\${jahr}-\${String(nextNumber).padStart(3, '0')}\`;

        // Budget aus Template laden falls nicht provided
        let budgetBrutto = rapportData.budget_brutto || rapportData.budgetBrutto;
        if (!budgetBrutto) {
            const templateResult = await client.query(
                'SELECT budget_standard FROM teilprojekt_templates WHERE teilprojekt = $1',
                [teilprojekt]
            );
            budgetBrutto = templateResult.rows[0]?.budget_standard || 0;
        }

        // Rapport erstellen
        const rapportResult = await client.query(
            \`INSERT INTO rapporte (
                rapport_nummer, teilprojekt, jahr, periode, budget_brutto, ist_brutto,
                aufwandsminderung, erstellt_von, was_lief_gut, abweichungen, lessons_learned
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id\`,
            [
                rapportNummer, teilprojekt, jahr, periode, budgetBrutto,
                rapportData.ist_brutto || rapportData.istBrutto || 0, 
                rapportData.aufwandsminderung || 0,
                req.user.id,
                rapportData.was_lief_gut, rapportData.abweichungen, 
                rapportData.lessons_learned
            ]
        );

        const rapportId = rapportResult.rows[0].id;

        // Maßnahmen einfügen
        if (massnahmen && massnahmen.length > 0) {
            for (const [index, massnahme] of massnahmen.entries()) {
                await client.query(
                    \`INSERT INTO rapport_massnahmen 
                    (rapport_id, massnahme_name, budget_plan, ist_wert, sortierung) 
                    VALUES ($1, $2, $3, $4, $5)\`,
                    [rapportId, massnahme.name, massnahme.budget || 0, massnahme.ist || 0, index]
                );
            }
        }

        // KPIs einfügen
        if (kpis && kpis.length > 0) {
            for (const [index, kpi] of kpis.entries()) {
                await client.query(
                    \`INSERT INTO rapport_kpis 
                    (rapport_id, kpi_name, einheit, zielwert, istwert, sortierung) 
                    VALUES ($1, $2, $3, $4, $5, $6)\`,
                    [rapportId, kpi.name, kpi.einheit, kpi.zielwert || 0, kpi.istwert || 0, index]
                );
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ 
            success: true, 
            rapportId, 
            rapportNummer,
            message: 'Rapport erfolgreich erstellt' 
        });

    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error creating rapport:', error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

// PUT: Rapport aktualisieren (nur für Admin)
app.put('/api/rapporte/:id', requireAuth, async (req, res) => {
    // Check admin permissions
    if (req.user.rolle !== 'admin' && req.user.rolle !== 'super_admin') {
        return res.status(403).json({ error: 'Keine Berechtigung - Admin-Zugang erforderlich' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { massnahmen, kpis, ...rapportData } = req.body;
        
        // Rapport aktualisieren
        const updateFields = [];
        const updateValues = [];
        let paramIndex = 1;

        if (rapportData.ist_brutto !== undefined || rapportData.istBrutto !== undefined) {
            updateFields.push(\`ist_brutto = $\${paramIndex++}\`);
            updateValues.push(rapportData.ist_brutto || rapportData.istBrutto);
        }
        if (rapportData.aufwandsminderung !== undefined) {
            updateFields.push(\`aufwandsminderung = $\${paramIndex++}\`);
            updateValues.push(rapportData.aufwandsminderung);
        }
        if (rapportData.was_lief_gut !== undefined) {
            updateFields.push(\`was_lief_gut = $\${paramIndex++}\`);
            updateValues.push(rapportData.was_lief_gut);
        }
        if (rapportData.abweichungen !== undefined) {
            updateFields.push(\`abweichungen = $\${paramIndex++}\`);
            updateValues.push(rapportData.abweichungen);
        }
        if (rapportData.lessons_learned !== undefined) {
            updateFields.push(\`lessons_learned = $\${paramIndex++}\`);
            updateValues.push(rapportData.lessons_learned);
        }
        if (rapportData.status !== undefined) {
            updateFields.push(\`status = $\${paramIndex++}\`);
            updateValues.push(rapportData.status);
        }
        
        updateFields.push(\`aktualisiert_am = $\${paramIndex++}\`);
        updateValues.push(new Date());
        updateValues.push(req.params.id);

        if (updateFields.length > 1) { // > 1 because we always have aktualisiert_am
            await client.query(
                \`UPDATE rapporte SET \${updateFields.join(', ')} WHERE id = $\${paramIndex}\`,
                updateValues
            );
        }

        // Alte Maßnahmen und KPIs löschen
        await client.query('DELETE FROM rapport_massnahmen WHERE rapport_id = $1', [req.params.id]);
        await client.query('DELETE FROM rapport_kpis WHERE rapport_id = $1', [req.params.id]);

        // Neue Maßnahmen einfügen
        if (massnahmen && massnahmen.length > 0) {
            for (const [index, massnahme] of massnahmen.entries()) {
                await client.query(
                    \`INSERT INTO rapport_massnahmen 
                    (rapport_id, massnahme_name, budget_plan, ist_wert, sortierung) 
                    VALUES ($1, $2, $3, $4, $5)\`,
                    [req.params.id, massnahme.name, massnahme.budget || 0, massnahme.ist || 0, index]
                );
            }
        }

        // Neue KPIs einfügen
        if (kpis && kpis.length > 0) {
            for (const [index, kpi] of kpis.entries()) {
                await client.query(
                    \`INSERT INTO rapport_kpis 
                    (rapport_id, kpi_name, einheit, zielwert, istwert, sortierung) 
                    VALUES ($1, $2, $3, $4, $5, $6)\`,
                    [req.params.id, kpi.name, kpi.einheit, kpi.zielwert || 0, kpi.istwert || 0, index]
                );
            }
        }

        await client.query('COMMIT');
        res.json({ success: true, message: 'Rapport erfolgreich aktualisiert' });

    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error updating rapport:', error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

// DELETE: Rapport löschen (nur für Admin)
app.delete('/api/rapporte/:id', requireAuth, async (req, res) => {
    if (req.user.rolle !== 'admin' && req.user.rolle !== 'super_admin') {
        return res.status(403).json({ error: 'Keine Berechtigung' });
    }

    try {
        const result = await pool.query('DELETE FROM rapporte WHERE id = $1', [req.params.id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Rapport nicht gefunden' });
        }
        
        res.json({ success: true, message: 'Rapport erfolgreich gelöscht' });
    } catch (error) {
        logger.error('Error deleting rapport:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET: Templates für Teilprojekte abrufen
app.get('/api/templates/:teilprojekt', requireAuth, async (req, res) => {
    try {
        const { teilprojekt } = req.params;
        
        // Template-Grunddaten
        const templateResult = await pool.query(
            'SELECT * FROM teilprojekt_templates WHERE teilprojekt = $1 AND aktiv = true',
            [teilprojekt]
        );
        
        if (templateResult.rows.length === 0) {
            return res.status(404).json({ error: 'Template nicht gefunden' });
        }

        // Standard-Maßnahmen
        const massnahmenResult = await pool.query(
            'SELECT * FROM template_massnahmen WHERE teilprojekt = $1 AND aktiv = true ORDER BY sortierung',
            [teilprojekt]
        );

        // Standard-KPIs
        const kpisResult = await pool.query(
            'SELECT * FROM template_kpis WHERE teilprojekt = $1 AND aktiv = true ORDER BY sortierung',
            [teilprojekt]
        );

        res.json({
            ...templateResult.rows[0],
            massnahmen: massnahmenResult.rows,
            kpis: kpisResult.rows
        });
    } catch (error) {
        logger.error('Error fetching template:', error);
        res.status(500).json({ error: error.message });
    }
});
`;

// INITIALIZATION FUNCTION - Zu integrieren in server.js startup
const initRapportTables = \`
async function initRapportTables() {
    try {
        logger.info('🔄 Initializing Rapport Management tables...');
        
        await pool.query(rapportSchema);
        
        // Insert template data
        await pool.query(\`
            INSERT INTO teilprojekt_templates (teilprojekt, budget_standard) VALUES 
            ('leitmedien', 45000),
            ('digitale-medien', 35000),
            ('social-media', 25000),
            ('messen', 20000)
            ON CONFLICT (teilprojekt) DO NOTHING
        \`);
        
        await pool.query(\`
            INSERT INTO template_massnahmen (teilprojekt, massnahme_name, budget_standard, sortierung) VALUES 
            ('leitmedien', 'Anzeigen in Fachzeitschriften', 20000, 1),
            ('leitmedien', 'Redaktionelle Beiträge', 15000, 2),
            ('leitmedien', 'Advertorials', 10000, 3),
            ('digitale-medien', 'Website-Content', 15000, 1),
            ('digitale-medien', 'Newsletter-Kampagnen', 10000, 2),
            ('digitale-medien', 'SEA/Google Ads', 10000, 3),
            ('social-media', 'Content Creation', 10000, 1),
            ('social-media', 'Community Management', 8000, 2),
            ('social-media', 'Paid Social Ads', 7000, 3),
            ('messen', 'Messestand Design', 8000, 1),
            ('messen', 'Personal & Logistik', 7000, 2),
            ('messen', 'Promotion-Material', 5000, 3)
        \`);
        
        await pool.query(\`
            INSERT INTO template_kpis (teilprojekt, kpi_name, einheit, zielwert_standard, sortierung) VALUES 
            ('leitmedien', 'Reichweite Print', 'Leser', 50000, 1),
            ('leitmedien', 'Anzeigen-Impressions', 'Views', 100000, 2),
            ('digitale-medien', 'Website-Traffic', 'Besucher', 25000, 1),
            ('digitale-medien', 'Conversion Rate', '%', 3.5, 2),
            ('digitale-medien', 'Newsletter Open Rate', '%', 25, 3),
            ('social-media', 'Follower-Wachstum', '%', 15, 1),
            ('social-media', 'Engagement Rate', '%', 4.5, 2),
            ('social-media', 'Reach', 'Impressions', 500000, 3),
            ('messen', 'Besucher am Stand', 'Personen', 1500, 1),
            ('messen', 'Qualifizierte Kontakte', 'Leads', 200, 2)
        \`);
        
        logger.info('✅ Rapport Management tables initialized successfully');
    } catch (error) {
        logger.error('❌ Error initializing Rapport Management tables:', error);
    }
}
\`;

module.exports = {
    rapportSchema,
    rapportRoutes,
    initRapportTables
};
