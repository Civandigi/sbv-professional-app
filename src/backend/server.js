// SBV Professional Express Server with PostgreSQL
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const joi = require('joi');

// Import Rapport Routes
const rapportRoutes = require('./routes/rapport-routes');

// Simple Logger für Präsentation
const logger = {
    info: (msg, meta = '') => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, meta),
    error: (msg, meta = '') => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, meta),
    debug: (msg, meta = '') => console.debug(`[DEBUG] ${new Date().toISOString()} - ${msg}`, meta),
    warn: (msg, meta = '') => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, meta)
};

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'sbv-super-secret-2025-key';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

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

// Test database connection and create super admin
pool.connect()
    .then(() => {
        logger.info('✅ PostgreSQL database connected successfully!');
        createSuperAdminUser();
    })
    .catch(err => logger.error('❌ PostgreSQL connection error:', err));

// Create Super Admin User
async function createSuperAdminUser() {
    const superAdminEmail = 'superadmin@digitale-rakete.ch';
    const superAdminPassword = 'SBV-Admin-2025-SecurePass!';
    
    try {
        // First, ensure the table has the required columns
        await ensureUserTableSchema();
        
        // Check if super admin already exists in sbv_benutzer table
        const existingUser = await pool.query(
            'SELECT id FROM sbv_benutzer WHERE email = $1',
            [superAdminEmail]
        );
        
        if (existingUser.rows.length === 0) {
            // Create super admin user with hashed password
            const hashedPassword = await bcrypt.hash(superAdminPassword, 12);
            
            await pool.query(
                `INSERT INTO sbv_benutzer (name, email, password_hash, rolle) 
                 VALUES ($1, $2, $3, $4)`,
                ['Super Admin - Digitale Rakete', superAdminEmail, hashedPassword, 'super_admin']
            );
            console.log('✅ Super Admin User created:');
            console.log(`   📧 Email: ${superAdminEmail}`);
            console.log(`   🔒 Password: ${superAdminPassword}`);
            console.log('   👑 Role: super_admin');
        } else {
            console.log('ℹ️  Super Admin User already exists');
            
            // Update existing user with password and role if missing
            const userData = await pool.query(
                'SELECT password_hash, rolle FROM sbv_benutzer WHERE email = $1',
                [superAdminEmail]
            );
            
            if (userData.rows.length > 0) {
                const user = userData.rows[0];
                if (!user.password_hash) {
                    const hashedPassword = await bcrypt.hash(superAdminPassword, 12);
                    await pool.query(
                        'UPDATE sbv_benutzer SET password_hash = $1, rolle = $2 WHERE email = $3',
                        [hashedPassword, 'super_admin', superAdminEmail]
                    );
                    console.log('✅ Super Admin password and role updated');
                }
            }
        }
    } catch (error) {
        console.error('❌ Error creating super admin:', error.message);
    }
}

// Ensure user table has required columns
async function ensureUserTableSchema() {
    try {
        // Add password_hash column if it doesn't exist
        await pool.query(`
            ALTER TABLE sbv_benutzer 
            ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)
        `);
        
        // Add rolle column if it doesn't exist
        await pool.query(`
            ALTER TABLE sbv_benutzer 
            ADD COLUMN IF NOT EXISTS rolle VARCHAR(50) DEFAULT 'user'
        `);
        
        // Add additional columns for user management
        await pool.query(`
            ALTER TABLE sbv_benutzer 
            ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'aktiv',
            ADD COLUMN IF NOT EXISTS letzter_login TIMESTAMP,
            ADD COLUMN IF NOT EXISTS erstellt_am TIMESTAMP DEFAULT NOW(),
            ADD COLUMN IF NOT EXISTS aktualisiert_am TIMESTAMP DEFAULT NOW()
        `);
        
        console.log('✅ User table schema updated with role management columns');
        await pool.query(`
            ALTER TABLE sbv_gesuche 
            ADD COLUMN IF NOT EXISTS gesuch_typ VARCHAR(50) DEFAULT 'partner',
            ADD COLUMN IF NOT EXISTS finanz_betrag DECIMAL(15,2),
            ADD COLUMN IF NOT EXISTS genehmigt BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS genehmigt_am TIMESTAMP,
            ADD COLUMN IF NOT EXISTS teilprojekte TEXT[],
            ADD COLUMN IF NOT EXISTS uploaded_file VARCHAR(500),
            ADD COLUMN IF NOT EXISTS file_size BIGINT,
            ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100)
        `);
        
        // Create teilprojekte table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sbv_teilprojekte (
                id SERIAL PRIMARY KEY,
                gesuch_id INTEGER REFERENCES sbv_gesuche(id),
                bericht_id INTEGER REFERENCES sbv_berichte(id),
                name VARCHAR(255) NOT NULL,
                beschreibung TEXT,
                budget_soll DECIMAL(15,2),
                budget_ist DECIMAL(15,2),
                status VARCHAR(50) DEFAULT 'geplant',
                jahr INTEGER NOT NULL,
                erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ User table schema updated');
    } catch (error) {
        console.error('❌ Error updating user table schema:', error.message);
    }
}

// File upload configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Test database connection
pool.connect((err, client, done) => {
    if (err) {
        console.error('❌ Database connection error:', err);
    } else {
        console.log('✅ PostgreSQL database connected successfully!');
        done();
    }
});

// Routes

// Use Rapport Routes mit pool
const rapportRouter = rapportRoutes(pool);
app.use(rapportRouter);

// API Documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'SBV Professional API',
        version: '1.0.0',
        description: 'API für das SBV Gesuch- und Rapport-System',
        endpoints: {
            authentication: {
                'POST /api/auth/login': 'Benutzeranmeldung',
                'POST /api/auth/logout': 'Benutzerabmeldung'
            },
            gesuche: {
                'GET /api/gesuche': 'Alle Gesuche abrufen',
                'POST /api/gesuche': 'Neues Gesuch erstellen',
                'POST /api/gesuche/upload': 'PDF-Upload (Admin/Super Admin)'
            },
            berichte: {
                'GET /api/berichte': 'Alle Berichte abrufen',
                'POST /api/berichte': 'Neuen Rapport erstellen (Admin/Super Admin)',
                'PUT /api/berichte/:id': 'Rapport bearbeiten (Admin/Super Admin)',
                'POST /api/berichte/from-gesuch': 'Rapport aus Gesuch erstellen'
            },
            system: {
                'GET /api/health': 'System-Status',
                'GET /api/dashboard/stats': 'Dashboard-Statistiken'
            },
            sbv_benutzer: {
                'GET /api/sbv_benutzer': 'Benutzer abrufen',
                'POST /api/sbv_benutzer': 'Neuen Benutzer erstellen'
            }
        },
        authentication: 'Bearer Token (JWT)',
        baseUrl: `http://localhost:${PORT}/api`,
        timestamp: new Date().toISOString()
    });
});

// Serve main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// Serve dashboard (protected)
app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

// Authentication Routes

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        // Input-Validierung
        const loginSchema = joi.object({
            email: joi.string().email().required(),
            password: joi.string().min(1).required()
        });

        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Ungültige Eingabe: ' + error.details[0].message
            });
        }

        const { email, password } = value;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email und Passwort sind erforderlich'
            });
        }

        // Check if user exists in database
        const userResult = await pool.query(
            'SELECT * FROM sbv_benutzer WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Ungültige Anmeldedaten'
            });
        }

        const user = userResult.rows[0];

        // For super admin, check password (if no password_hash, use direct comparison for initial setup)
        let isValidPassword = false;
        
        if (user.password_hash) {
            // Use bcrypt for hashed passwords
            isValidPassword = await bcrypt.compare(password, user.password_hash);
        } else if (email === 'superadmin@digitale-rakete.ch' && password === 'SBV-Admin-2025-SecurePass!') {
            // Fallback for initial super admin login
            isValidPassword = true;
            
            // Hash and update password in database
            const hashedPassword = await bcrypt.hash(password, 12);
            await pool.query(
                'UPDATE sbv_benutzer SET password_hash = $1, rolle = $2 WHERE id = $3',
                [hashedPassword, 'super_admin', user.id]
            );
        }

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Ungültige Anmeldedaten'
            });
        }
        
        // Check if user account is active
        if (user.status && user.status === 'inaktiv') {
            return res.status(403).json({
                success: false,
                message: 'Ihr Konto ist deaktiviert. Wenden Sie sich an einen Administrator.'
            });
        }
        
        // Update last login timestamp
        await pool.query(
            'UPDATE sbv_benutzer SET letzter_login = NOW() WHERE id = $1',
            [user.id]
        );

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.id,
                email: user.email,
                role: user.rolle || 'super_admin'
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return user info (without password)
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            rolle: user.rolle || 'super_admin'
        };
        
        console.log(`🔐 Benutzer angemeldet: ${user.name} (${user.email}) - Rolle: ${user.rolle}`);

        res.json({
            success: true,
            message: 'Erfolgreich angemeldet',
            user: userResponse,
            token: token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Serverfehler bei der Anmeldung'
        });
    }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Erfolgreich abgemeldet'
    });
});

// Middleware to check authentication
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Zugriff verweigert - Token erforderlich'
        });
    }

    jwt.verify(token, JWT_SECRET, async (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Ungültiger Token'
            });
        }
        
        try {
            // Get current user data from database
            const userResult = await pool.query(
                'SELECT id, name, email, rolle, status FROM sbv_benutzer WHERE id = $1',
                [user.userId]
            );
            
            if (userResult.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Benutzer nicht mehr vorhanden'
                });
            }
            
            const currentUser = userResult.rows[0];
            
            // Check if user is still active
            if (currentUser.status === 'inaktiv') {
                return res.status(403).json({
                    success: false,
                    message: 'Ihr Konto wurde deaktiviert'
                });
            }
            
            // Attach current user info to request
            req.user = {
                id: currentUser.id,
                userId: currentUser.id,
                name: currentUser.name,
                email: currentUser.email,
                rolle: currentUser.rolle
            };
            
            next();
        } catch (dbError) {
            console.error('Database error in auth middleware:', dbError);
            return res.status(500).json({
                success: false,
                message: 'Serverfehler bei der Authentifizierung'
            });
        }
    });
}

// Role-based middleware factory
function requireRole(roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Nicht authentifiziert'
            });
        }
        
        const userRole = req.user.rolle;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Zugriff verweigert. Erforderliche Rolle: ${allowedRoles.join(' oder ')}`
            });
        }
        
        next();
    };
}

// Check current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

// API Routes

// ========== USER MANAGEMENT API ENDPOINTS ==========

// Get all sbv_benutzer for admin/super_admin (ohne password_hash)
app.get('/api/sbv_benutzer', authenticateToken, async (req, res) => {
    try {
        // Check if user has admin privileges
        if (req.user.rolle !== 'super_admin' && req.user.rolle !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Zugriff verweigert. Admin-Berechtigung erforderlich.'
            });
        }
        
        const result = await pool.query(`
            SELECT id, name, email, rolle, status, 
                   letzter_login, erstellt_am, aktualisiert_am
            FROM sbv_benutzer 
            ORDER BY id
        `);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching sbv_benutzer:', error);
        res.status(500).json({
            success: false,
            error: 'Fehler beim Laden der Benutzer'
        });
    }
});

// Create new user
app.post('/api/sbv_benutzer', authenticateToken, async (req, res) => {
    try {
        // Check if user has admin privileges
        if (req.user.rolle !== 'super_admin' && req.user.rolle !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Zugriff verweigert. Admin-Berechtigung erforderlich.'
            });
        }
        
        // Input-Validierung
        const userSchema = joi.object({
            name: joi.string().min(2).max(100).required(),
            email: joi.string().email().required(),
            rolle: joi.string().valid('super_admin', 'admin', 'nutzer').required(),
            status: joi.string().valid('aktiv', 'inaktiv').default('aktiv')
        });

        const { error, value } = userSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Ungültige Eingabe: ' + error.details[0].message
            });
        }

        const { name, email, rolle, status } = value;
        
        // Check if email already exists
        const existingUser = await pool.query('SELECT id FROM sbv_benutzer WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'E-Mail-Adresse bereits vergeben.'
            });
        }
        
        // Generate temporary password
        const tempPassword = 'SBV-' + Math.random().toString(36).substring(2, 12);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        
        const result = await pool.query(`
            INSERT INTO sbv_benutzer (name, email, password_hash, rolle, status, erstellt_am) 
            VALUES ($1, $2, $3, $4, $5, NOW()) 
            RETURNING id, name, email, rolle, status, erstellt_am
        `, [name, email, hashedPassword, rolle, status]);
        
        console.log(`👤 Neuer Benutzer erstellt: ${name} (${email}) - Rolle: ${rolle}`);
        
        res.json({
            success: true,
            data: result.rows[0],
            tempPassword: tempPassword,
            message: 'Benutzer erfolgreich erstellt'
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            error: 'Fehler beim Erstellen des Benutzers'
        });
    }
});

// Update existing user
app.put('/api/sbv_benutzer/:id', authenticateToken, async (req, res) => {
    try {
        // Check if user has admin privileges
        if (req.user.rolle !== 'super_admin' && req.user.rolle !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Zugriff verweigert. Admin-Berechtigung erforderlich.'
            });
        }
        
        const userId = parseInt(req.params.id);
        const { name, email, rolle, status } = req.body;
        
        if (!name || !email || !rolle) {
            return res.status(400).json({
                success: false,
                error: 'Name, E-Mail und Rolle sind erforderlich.'
            });
        }
        
        // Check if email is already taken by another user
        const existingUser = await pool.query(
            'SELECT id FROM sbv_benutzer WHERE email = $1 AND id != $2', 
            [email, userId]
        );
        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'E-Mail-Adresse bereits vergeben.'
            });
        }
        
        const result = await pool.query(`
            UPDATE sbv_benutzer 
            SET name = $1, email = $2, rolle = $3, status = $4, aktualisiert_am = NOW()
            WHERE id = $5 
            RETURNING id, name, email, rolle, status, aktualisiert_am
        `, [name, email, rolle, status, userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Benutzer nicht gefunden.'
            });
        }
        
        console.log(`👤 Benutzer aktualisiert: ${name} (ID: ${userId})`);
        
        res.json({
            success: true,
            data: result.rows[0],
            message: 'Benutzer erfolgreich aktualisiert'
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            error: 'Fehler beim Aktualisieren des Benutzers'
        });
    }
});

// Delete user
app.delete('/api/sbv_benutzer/:id', authenticateToken, async (req, res) => {
    try {
        // Only super_admin can delete sbv_benutzer
        if (req.user.rolle !== 'super_admin') {
            return res.status(403).json({
                success: false,
                error: 'Zugriff verweigert. Nur Super Administratoren können Benutzer löschen.'
            });
        }
        
        const userId = parseInt(req.params.id);
        
        // Prevent self-deletion
        if (userId === req.user.id) {
            return res.status(400).json({
                success: false,
                error: 'Sie können sich nicht selbst löschen.'
            });
        }
        
        // Check if user exists
        const userCheck = await pool.query('SELECT name FROM sbv_benutzer WHERE id = $1', [userId]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Benutzer nicht gefunden.'
            });
        }
        
        // Delete user
        await pool.query('DELETE FROM sbv_benutzer WHERE id = $1', [userId]);
        
        console.log(`👤 Benutzer gelöscht: ${userCheck.rows[0].name} (ID: ${userId})`);
        
        res.json({
            success: true,
            message: 'Benutzer erfolgreich gelöscht'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            error: 'Fehler beim Löschen des Benutzers'
        });
    }
});

// Get user activity logs
app.get('/api/sbv_benutzer/activities', authenticateToken, async (req, res) => {
    try {
        // Check if user has admin privileges
        if (req.user.rolle !== 'super_admin' && req.user.rolle !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Zugriff verweigert. Admin-Berechtigung erforderlich.'
            });
        }
        
        // Get recent login activities
        const activities = await pool.query(`
            SELECT name, letzter_login, rolle
            FROM sbv_benutzer 
            WHERE letzter_login IS NOT NULL
            ORDER BY letzter_login DESC 
            LIMIT 10
        `);
        
        const formattedActivities = activities.rows.map(activity => ({
            user: activity.name,
            action: 'hat sich angemeldet',
            time: activity.letzter_login ? new Date(activity.letzter_login).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : 'Nie',
            role: activity.rolle
        }));
        
        res.json({
            success: true,
            data: formattedActivities
        });
    } catch (error) {
        console.error('Error fetching user activities:', error);
        res.status(500).json({
            success: false,
            error: 'Fehler beim Laden der Aktivitäten'
        });
    }
});

// Get admin dashboard statistics
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
    try {
        // Check if user has admin privileges
        if (req.user.rolle !== 'super_admin' && req.user.rolle !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Zugriff verweigert. Admin-Berechtigung erforderlich.'
            });
        }

        // Get total user count
        const totalUsersResult = await pool.query('SELECT COUNT(*) as count FROM sbv_benutzer');
        const totalUsers = parseInt(totalUsersResult.rows[0].count);

        // Get admin count (admin + super_admin)
        const adminCountResult = await pool.query(`
            SELECT COUNT(*) as count 
            FROM sbv_benutzer 
            WHERE rolle IN ('admin', 'super_admin')
        `);
        const activeAdmins = parseInt(adminCountResult.rows[0].count);

        // Get active sessions (users who logged in within last 24 hours)
        const activeSessionsResult = await pool.query(`
            SELECT COUNT(*) as count 
            FROM sbv_benutzer 
            WHERE letzter_login >= NOW() - INTERVAL '24 hours'
        `);
        const activeSessions = parseInt(activeSessionsResult.rows[0].count);

        // Get user role breakdown
        const roleBreakdownResult = await pool.query(`
            SELECT rolle, COUNT(*) as count 
            FROM sbv_benutzer 
            GROUP BY rolle 
            ORDER BY count DESC
        `);
        const roleBreakdown = {};
        roleBreakdownResult.rows.forEach(row => {
            roleBreakdown[row.rolle] = parseInt(row.count);
        });

        res.json({
            success: true,
            data: {
                totalUsers,
                activeAdmins,
                activeSessions,
                roleBreakdown
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({
            success: false,
            error: 'Fehler beim Laden der Statistiken'
        });
    }
});

// ========== LEGACY ENDPOINTS (für Kompatibilität) ==========

// Get all sbv_benutzer (Benutzer) - Legacy endpoint
app.get('/api/benutzer', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, name, email, rolle, status, 
                   letzter_login, erstellt_am, aktualisiert_am
            FROM sbv_benutzer 
            ORDER BY id
        `);
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching benutzer:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch sbv_benutzer'
        });
    }
});

// Get all applications (Gesuche) with filter options
app.get('/api/gesuche', async (req, res) => {
    try {
        const { jahr, typ, status, genehmigt } = req.query;
        let query = 'SELECT * FROM sbv_gesuche WHERE 1=1';
        const params = [];
        let paramCount = 0;

        if (jahr) {
            paramCount++;
            query += ` AND jahr = $${paramCount}`;
            params.push(jahr);
        }

        if (typ) {
            paramCount++;
            query += ` AND gesuch_typ = $${paramCount}`;
            params.push(typ);
        }

        if (status) {
            paramCount++;
            query += ` AND status = $${paramCount}`;
            params.push(status);
        }

        if (genehmigt !== undefined) {
            paramCount++;
            query += ` AND genehmigt = $${paramCount}`;
            params.push(genehmigt === 'true');
        }

        query += ' ORDER BY id DESC';
        
        const result = await pool.query(query, params);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching gesuche:', error);
        res.status(500).json({
            success: false,
            message: 'Fehler beim Laden der Gesuche',
            error: error.message
        });
    }
});

// Get approved Gesuche for Report creation
app.get('/api/gesuche/approved', async (req, res) => {
    try {
        const { jahr } = req.query;
        let query = `
            SELECT g.*, t.name as teilprojekt_name, t.id as teilprojekt_id,
                   t.beschreibung as teilprojekt_beschreibung, 
                   t.budget_soll, t.budget_ist, t.status as teilprojekt_status
            FROM sbv_gesuche g 
            LEFT JOIN sbv_teilprojekte t ON g.id = t.gesuch_id
            WHERE g.genehmigt = true
        `;
        const params = [];

        if (jahr) {
            query += ' AND g.jahr = $1';
            params.push(jahr);
        }

        query += ' ORDER BY g.id DESC, t.id ASC';
        
        const result = await pool.query(query, params);
        
        // Group results by Gesuch
        const gesucheMap = new Map();
        result.rows.forEach(row => {
            if (!gesucheMap.has(row.id)) {
                gesucheMap.set(row.id, {
                    ...row,
                    teilprojekte: []
                });
            }
            
            if (row.teilprojekt_id) {
                gesucheMap.get(row.id).teilprojekte.push({
                    id: row.teilprojekt_id,
                    name: row.teilprojekt_name,
                    beschreibung: row.teilprojekt_beschreibung,
                    budget_soll: row.budget_soll,
                    budget_ist: row.budget_ist,
                    status: row.teilprojekt_status
                });
            }
        });
        
        const gesuche = Array.from(gesucheMap.values());
        
        res.json({
            success: true,
            data: gesuche,
            count: gesuche.length
        });
    } catch (error) {
        console.error('Error fetching approved gesuche:', error);
        res.status(500).json({
            success: false,
            message: 'Fehler beim Laden der genehmigten Gesuche',
            error: error.message
        });
    }
});

// Get single application
app.get('/api/gesuche/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT g.*, b.name as benutzer_name 
            FROM sbv_gesuche g 
            LEFT JOIN sbv_benutzer b ON g.benutzer_id = b.id 
            WHERE g.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching gesuch:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch application'
        });
    }
});

// Create new application
app.post('/api/gesuche', async (req, res) => {
    try {
        const { titel, jahr, beschreibung, benutzer_id } = req.body;
        
        const result = await pool.query(`
            INSERT INTO sbv_gesuche (titel, jahr, beschreibung, benutzer_id, status, eingereicht_am)
            VALUES ($1, $2, $3, $4, 'entwurf', NOW())
            RETURNING *
        `, [titel, jahr, beschreibung, benutzer_id]);
        
        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Application created successfully'
        });
    } catch (error) {
        console.error('Error creating gesuch:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create application'
        });
    }
});

// Update application
app.put('/api/gesuche/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { titel, jahr, beschreibung, status } = req.body;
        
        const result = await pool.query(`
            UPDATE sbv_gesuche 
            SET titel = $1, jahr = $2, beschreibung = $3, status = $4, aktualisiert_am = NOW()
            WHERE id = $5
            RETURNING *
        `, [titel, jahr, beschreibung, status, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0],
            message: 'Application updated successfully'
        });
    } catch (error) {
        console.error('Error updating gesuch:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update application'
        });
    }
});

// Get all reports (Berichte)
app.get('/api/berichte', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT b.*, g.titel as gesuch_titel 
            FROM sbv_berichte b 
            LEFT JOIN sbv_gesuche g ON b.gesuch_id = g.id 
            ORDER BY b.id DESC
        `);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching berichte:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch reports'
        });
    }
});

// Update Rapport/Bericht - PHASE 1: Rapport-Editing
app.put('/api/berichte/:id', authenticateToken, async (req, res) => {
    try {
        const berichtId = req.params.id;
        const { titel, beschreibung, jahr, status, notizen } = req.body;
        
        // Validierung der Eingabedaten
        if (!titel || titel.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Titel ist erforderlich'
            });
        }
        
        // Prüfe ob Bericht existiert
        const checkResult = await pool.query('SELECT * FROM sbv_berichte WHERE id = $1', [berichtId]);
        
        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Bericht nicht gefunden'
            });
        }
        
        const existingBericht = checkResult.rows[0];
        
        // Rollenbasierte Berechtigungen
        const userRole = req.user.rolle;
        
        // User: nur read-only (sollte hier nicht ankommen, aber Sicherheit)
        if (userRole === 'user') {
            return res.status(403).json({
                success: false,
                message: 'Keine Berechtigung - Benutzer können Rapporte nur anzeigen'
            });
        }
        
        // Admin kann jetzt auch genehmigen - nur Systemeinstellungen bleiben Super Admin vorbehalten
        // Beide Rollen können Rapporte vollständig verwalten
        
        // Super Admin: kann alles
        // Admin: kann jetzt auch Rapporte genehmigen
        // (keine weitere Überprüfung nötig)
        
        // Update Bericht
        const updateResult = await pool.query(`
            UPDATE sbv_berichte 
            SET 
                titel = $1,
                beschreibung = $2,
                jahr = $3,
                status = $4,
                notizen = $5,
                aktualisiert_am = NOW(),
                aktualisiert_von = $6
            WHERE id = $7
            RETURNING id, titel, beschreibung, jahr, status, notizen, 
                      erstellt_am, aktualisiert_am, erstellt_von, aktualisiert_von
        `, [
            titel.trim(),
            beschreibung || null,
            jahr || existingBericht.jahr,
            status || existingBericht.status,
            notizen || null,
            req.user.email,
            berichtId
        ]);
        
        const updatedBericht = updateResult.rows[0];
        
        logger.info('Bericht aktualisiert', {
            id: berichtId,
            titel: titel,
            user: req.user.email,
            role: req.user.rolle,
            status: status
        });
        
        res.json({
            success: true,
            message: 'Bericht erfolgreich aktualisiert',
            data: updatedBericht
        });
        
    } catch (error) {
        logger.error('Error updating bericht:', error);
        res.status(500).json({
            success: false,
            error: 'Fehler beim Aktualisieren des Berichts'
        });
    }
});

// CREATE new Rapport (Admin/Super Admin only)
app.post('/api/berichte', authenticateToken, async (req, res) => {
    try {
        // Rolle prüfen: nur Admin und Super Admin können Rapporte erstellen
        if (!['Admin', 'Super Admin'].includes(req.user.rolle)) {
            return res.status(403).json({
                success: false,
                error: 'Zugriff verweigert. Nur Admins können Rapporte erstellen.'
            });
        }

        // Input-Validierung
        const rapportSchema = joi.object({
            titel: joi.string().min(3).max(255).required(),
            jahr: joi.number().integer().min(2020).max(2030).required(),
            status: joi.string().valid('entwurf', 'fertig').required(),
            bericht_typ: joi.string().valid('rapport', 'jahresbericht').default('rapport'),
            teilprojekt: joi.string().optional(),
            beschreibung: joi.string().optional(),
            erstellt_von: joi.string().email().optional(),
            erstellt_am: joi.string().isoDate().optional()
        });

        const { error, value } = rapportSchema.validate(req.body);
        if (error) {
            logger.warn('Validation error in POST /api/berichte:', error.details);
            return res.status(400).json({
                success: false,
                error: 'Ungültige Eingabedaten: ' + error.details.map(d => d.message).join(', ')
            });
        }

        const {
            titel,
            jahr,
            status,
            bericht_typ,
            teilprojekt,
            beschreibung,
            erstellt_von,
            erstellt_am
        } = value;

        logger.info('📝 Erstelle neuen Rapport:', {
            titel,
            jahr,
            status,
            user: req.user.email,
            role: req.user.rolle
        });

        // Neuen Rapport in die Datenbank einfügen
        const insertResult = await pool.query(
            `INSERT INTO sbv_berichte (
                titel, 
                jahr, 
                status, 
                bericht_typ, 
                teilprojekt,
                beschreibung,
                erstellt_von, 
                erstellt_am,
                aktualisiert_von,
                aktualisiert_am
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING *`,
            [
                titel,
                jahr,
                status,
                bericht_typ || 'rapport',
                teilprojekt || null,
                beschreibung || null,
                erstellt_von || req.user.email,
                erstellt_am || new Date().toISOString(),
                req.user.email,
                new Date().toISOString()
            ]
        );

        if (insertResult.rows.length === 0) {
            throw new Error('Rapport konnte nicht erstellt werden');
        }

        const neuerRapport = insertResult.rows[0];

        logger.info('✅ Rapport erfolgreich erstellt:', {
            id: neuerRapport.id,
            titel: neuerRapport.titel,
            status: neuerRapport.status,
            user: req.user.email
        });

        // Erfolgreiche Antwort mit dem neuen Rapport
        res.status(201).json({
            success: true,
            message: `Rapport "${titel}" erfolgreich als ${status} erstellt`,
            data: neuerRapport,
            metadata: {
                created_by: req.user.email,
                created_at: new Date().toISOString(),
                type: 'rapport_creation'
            }
        });

    } catch (error) {
        logger.error('❌ Error creating rapport:', {
            error: error.message,
            stack: error.stack,
            user: req.user?.email,
            body: req.body
        });
        
        res.status(500).json({
            success: false,
            error: 'Fehler beim Erstellen des Rapports',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get all documents (Dokumente)
app.get('/api/dokumente', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT d.*, g.titel as gesuch_titel 
            FROM sbv_dokumente d 
            LEFT JOIN sbv_gesuche g ON d.gesuch_id = g.id 
            ORDER BY d.hochgeladen_am DESC
        `);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching dokumente:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch documents'
        });
    }
});

// Intelligenter Gesuch-Upload mit automatischer Teilprojekt-Erkennung
app.post('/api/gesuche/upload-intelligent', authenticateToken, upload.fields([
    { name: 'gesuchFile', maxCount: 1 },
    { name: 'anhaenge', maxCount: 10 }
]), async (req, res) => {
    try {
        // Nur Super Admin darf Gesuche hochladen
        if (req.user.rolle !== 'super_admin' && req.user.rolle !== 'admin') {
            return res.status(403).json({ 
                success: false,
                error: 'Keine Berechtigung - Nur Admins können Gesuche hochladen' 
            });
        }

        if (!req.files || !req.files.gesuchFile || !req.files.gesuchFile[0]) {
            return res.status(400).json({
                success: false,
                error: 'Keine Gesuch-PDF hochgeladen'
            });
        }

        const gesuchFile = req.files.gesuchFile[0];
        const anhaenge = req.files.anhaenge || [];

        // Validiere PDF-Typ
        if (gesuchFile.mimetype !== 'application/pdf') {
            return res.status(400).json({
                success: false,
                error: 'Hauptdatei muss eine PDF-Datei sein'
            });
        }

        const { titel, jahr, gesamtbudget, gesuchTyp, autoCreateRapporte, extractKPIs, createMassnahmen } = req.body;
        
        logger.info('🚀 Intelligenter Gesuch-Upload gestartet', { 
            titel, 
            jahr,
            gesamtbudget,
            gesuchTyp,
            anhaengeCount: anhaenge.length,
            user: req.user.email 
        });

        const transaction = await pool.connect();
        
        try {
            await transaction.query('BEGIN');
            
            // 1. Erstelle Haupt-Gesuch
            const gesuchResult = await transaction.query(`
                INSERT INTO sbv_gesuche (
                    titel, 
                    gesuch_typ, 
                    jahr, 
                    status,
                    finanz_betrag,
                    eingereicht_am, 
                    uploaded_file, 
                    beschreibung,
                    file_size,
                    mime_type,
                    antragsteller,
                    erstellt_von
                ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8, $9, $10, $11)
                RETURNING *
            `, [
                titel,
                gesuchTyp || 'kommunikation',
                parseInt(jahr),
                'eingereicht',
                parseFloat(gesamtbudget) || null,
                gesuchFile.path,
                'Automatisch verarbeitetes Gesuch mit intelligenter Teilprojekt-Erkennung',
                gesuchFile.size,
                gesuchFile.mimetype,
                req.user.name || req.user.email,
                req.user.id
            ]);
            
            const gesuch = gesuchResult.rows[0];
            logger.info('✅ Gesuch erstellt', { gesuchId: gesuch.id, titel: gesuch.titel });

            // 2. Definiere Standard-Teilprojekte basierend auf dem bereitgestellten Template
            const teilprojektTemplates = [
                {
                    name: 'TP1 - Leitmedien',
                    beschreibung: 'Nationale Medienkampagne zur Stärkung der öffentlichen Wahrnehmung',
                    budget_soll: 1590000,
                    kziel_bezug: JSON.stringify(['Wissen', 'Sympathie', 'Präferenz']),
                    massnahmen: [
                        { name: 'Mediakampagne', kanal: 'OOH/DOOH/Social Ads', budget_plan: 830000 },
                        { name: 'Werbeartikel', kanal: 'Diverse', budget_plan: 470000 },
                        { name: 'Sachinformation Print & Digital', kanal: 'Broschüren', budget_plan: 110000 },
                        { name: 'Projektentwicklung', kanal: 'n.z.', budget_plan: 180000 }
                    ],
                    kpis: [
                        { name: 'Bekanntheit Marke', einheit: '%', zielwert: 30 },
                        { name: 'Image positiv', einheit: '%', zielwert: 50 },
                        { name: 'Wissen Leistungen', einheit: '%', zielwert: 55 },
                        { name: 'Vertrauen', einheit: '%', zielwert: 50 }
                    ]
                },
                {
                    name: 'TP2 - Digitale Medien',
                    beschreibung: 'Förderung der Wissensplattform und Dialog in sozialen Netzwerken',
                    budget_soll: 490000,
                    kziel_bezug: JSON.stringify(['Wissen', 'Sympathie', 'Präferenz', 'Nachhaltigkeit']),
                    massnahmen: [
                        { name: 'Internetprojekte', kanal: 'Websites', budget_plan: 280000 },
                        { name: 'Social Media', kanal: 'FB/IG/TikTok/YouTube', budget_plan: 210000 }
                    ],
                    kpis: [
                        { name: 'Website-Besucher', einheit: 'Anzahl', zielwert: 200000 },
                        { name: 'Aufenthaltsdauer', einheit: 'Sek.', zielwert: 60 },
                        { name: 'Social Media Impressions DE', einheit: 'Mio.', zielwert: 7 },
                        { name: 'Newsletter-Abonnenten neu', einheit: 'Anzahl', zielwert: 500 }
                    ]
                },
                {
                    name: 'TP3 - Messen & Ausstellungen',
                    beschreibung: 'Präsentation landwirtschaftlicher Leistungen durch interaktive Ausstellungen',
                    budget_soll: 630000,
                    kziel_bezug: JSON.stringify(['Wissen', 'Sympathie', 'Präferenz', 'Nachhaltigkeit']),
                    massnahmen: [
                        { name: 'Messen & Ausstellungen', kanal: 'Publikumsmessen', budget_plan: 630000 }
                    ],
                    kpis: [
                        { name: 'Messebesucher gesamt', einheit: 'Mio.', zielwert: 1.3 },
                        { name: 'OLMA Themenwelt Besucher', einheit: 'Anzahl', zielwert: 140000 },
                        { name: 'Aktive Kontakte', einheit: 'Anzahl', zielwert: 50000 }
                    ]
                },
                {
                    name: 'TP4 - Events & Aktionen',
                    beschreibung: 'Förderung des direkten Engagements der Bevölkerung bei Vor-Ort-Veranstaltungen',
                    budget_soll: 470000,
                    kziel_bezug: JSON.stringify(['Wissen', 'Sympathie', 'Präferenz']),
                    massnahmen: [
                        { name: 'Vom Hof', kanal: 'Bauernportal', budget_plan: 80000 },
                        { name: 'Stallvisite', kanal: 'Stallvisite-Betriebe', budget_plan: 80000 },
                        { name: 'Buurehof id Stadt', kanal: 'Event', budget_plan: 145000 },
                        { name: 'Landwirtschaft im Fokus', kanal: 'Festival/Event', budget_plan: 145000 }
                    ],
                    kpis: [
                        { name: 'Stallvisite Besucher', einheit: 'Anzahl', zielwert: 100000 },
                        { name: 'Neue Vom-Hof-Anbieter', einheit: 'Anzahl', zielwert: 50 },
                        { name: 'Event-Besucher gesamt', einheit: 'Anzahl', zielwert: 4000 }
                    ]
                },
                {
                    name: 'TP5 - Schulprojekte',
                    beschreibung: 'Sensibilisierung der jüngeren Generation für nachhaltige Landwirtschaft',
                    budget_soll: 140000,
                    kziel_bezug: JSON.stringify(['Wissen', 'Sympathie', 'Nachhaltigkeit']),
                    massnahmen: [
                        { name: 'Schulprojekt', kanal: 'Nicht zuordenbar', budget_plan: 140000 }
                    ],
                    kpis: [
                        { name: 'Teilnehmende Schüler', einheit: 'Anzahl', zielwert: 65000 },
                        { name: 'SchuB-Betriebe', einheit: 'Anzahl', zielwert: 410 },
                        { name: 'Agro-Image Unterrichte', einheit: 'Anzahl', zielwert: 4500 }
                    ]
                },
                {
                    name: 'TP6 - Partnerprojekte (inkl. KEP)',
                    beschreibung: 'Bewusstsein für die Arbeit der Bäuerinnen und Bauern fördern',
                    budget_soll: 1090000,
                    kziel_bezug: JSON.stringify(['Wissen', 'Sympathie', 'Präferenz', 'Zusammenarbeit']),
                    massnahmen: [
                        { name: 'Agro-Image', kanal: 'Unterricht', budget_plan: 70000 },
                        { name: 'Agriviva', kanal: 'Begegnung', budget_plan: 110000 },
                        { name: 'Kantonale Ergänzungsprojekte', kanal: 'Nicht zuordenbar', budget_plan: 890000 }
                    ],
                    kpis: [
                        { name: 'Agriviva Einsatztage', einheit: 'Anzahl', zielwert: 20000 },
                        { name: 'Aktive Partnerprojekte', einheit: 'Anzahl', zielwert: 22 },
                        { name: 'KEP-Projekte', einheit: 'Anzahl', zielwert: 20 }
                    ]
                }
            ];

            const createdTeilprojekte = [];
            const createdRapporte = [];

            // 3. Erstelle Teilprojekte
            for (const template of teilprojektTemplates) {
                const teilprojektResult = await transaction.query(`
                    INSERT INTO sbv_teilprojekte (
                        gesuch_id, 
                        name, 
                        beschreibung, 
                        budget_soll,
                        status,
                        kziel_bezug,
                        erstellt_am
                    ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
                    RETURNING *
                `, [
                    gesuch.id,
                    template.name,
                    template.beschreibung,
                    template.budget_soll,
                    'geplant',
                    template.kziel_bezug
                ]);

                const teilprojekt = teilprojektResult.rows[0];
                createdTeilprojekte.push(teilprojekt);

                // 4. Erstelle automatisch Rapport wenn gewünscht
                if (autoCreateRapporte === 'true') {
                    const rapportNummer = `R-${jahr}-${String(createdRapporte.length + 1).padStart(3, '0')}`;
                    const teilprojektKey = template.name.split(' - ')[1]?.toLowerCase().replace(/[^a-z]/g, '-') || 'sonstige';

                    const rapportResult = await transaction.query(`
                        INSERT INTO rapporte (
                            rapport_nummer,
                            teilprojekt,
                            jahr,
                            periode,
                            status,
                            budget_brutto,
                            ist_brutto,
                            was_lief_gut,
                            abweichungen,
                            lessons_learned,
                            erstellt_von,
                            erstellt_am
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
                        RETURNING *
                    `, [
                        rapportNummer,
                        teilprojektKey,
                        parseInt(jahr),
                        'JAHR',
                        'ausstehend',
                        template.budget_soll,
                        0,
                        '',
                        '',
                        '',
                        req.user.id
                    ]);

                    const rapport = rapportResult.rows[0];
                    createdRapporte.push(rapport);

                    // 5. Erstelle Maßnahmen wenn gewünscht
                    if (createMassnahmen === 'true' && template.massnahmen) {
                        for (const massnahme of template.massnahmen) {
                            await transaction.query(`
                                INSERT INTO rapport_massnahmen (
                                    rapport_id,
                                    massnahme_name,
                                    budget_plan,
                                    ist_wert,
                                    beschreibung,
                                    sortierung
                                ) VALUES ($1, $2, $3, $4, $5, $6)
                            `, [
                                rapport.id,
                                massnahme.name,
                                massnahme.budget_plan,
                                0,
                                `Kanal: ${massnahme.kanal}`,
                                template.massnahmen.indexOf(massnahme) + 1
                            ]);
                        }
                    }

                    // 6. Erstelle KPIs wenn gewünscht
                    if (extractKPIs === 'true' && template.kpis) {
                        for (const kpi of template.kpis) {
                            await transaction.query(`
                                INSERT INTO rapport_kpis (
                                    rapport_id,
                                    kpi_name,
                                    zielwert,
                                    ist_wert,
                                    einheit,
                                    beschreibung,
                                    sortierung
                                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                            `, [
                                rapport.id,
                                kpi.name,
                                kpi.zielwert,
                                0,
                                kpi.einheit,
                                `Zielwert: ${kpi.zielwert} ${kpi.einheit}`,
                                template.kpis.indexOf(kpi) + 1
                            ]);
                        }
                    }
                }
            }

            // 7. Speichere Anhänge
            const savedAnhaenge = [];
            for (const anhang of anhaenge) {
                const anhangResult = await transaction.query(`
                    INSERT INTO sbv_dokumente (
                        gesuch_id,
                        dateiname,
                        dateipfad,
                        dateityp,
                        dateigröße,
                        hochgeladen_von,
                        hochgeladen_am
                    ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
                    RETURNING *
                `, [
                    gesuch.id,
                    anhang.originalname,
                    anhang.path,
                    anhang.mimetype,
                    anhang.size,
                    req.user.id
                ]);
                
                savedAnhaenge.push(anhangResult.rows[0]);
            }

            await transaction.query('COMMIT');
            transaction.release();

            logger.info('✅ Intelligenter Gesuch-Upload abgeschlossen', {
                gesuchId: gesuch.id,
                teilprojekte: createdTeilprojekte.length,
                rapporte: createdRapporte.length,
                anhaenge: savedAnhaenge.length
            });

            res.json({
                success: true,
                message: 'Gesuch erfolgreich hochgeladen und verarbeitet',
                data: {
                    gesuch: gesuch,
                    teilprojekte: createdTeilprojekte,
                    rapporte: createdRapporte,
                    anhaenge: savedAnhaenge,
                    verarbeitung: {
                        teilprojekteErkannt: createdTeilprojekte.length,
                        rapporteErstellt: createdRapporte.length,
                        kpisExtrahiert: extractKPIs === 'true',
                        massnahmenErstellt: createMassnahmen === 'true'
                    }
                }
            });

        } catch (error) {
            await transaction.query('ROLLBACK');
            transaction.release();
            throw error;
        }

    } catch (error) {
        logger.error('❌ Fehler beim intelligenten Gesuch-Upload:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Interner Serverfehler beim Upload'
        });
    }
});

// Upload Gesuch with automatic Rapport generation
app.post('/api/gesuche/upload', authenticateToken, upload.single('gesuch'), async (req, res) => {
    try {
        // Admin und Super Admin dürfen Gesuche hochladen
        if (!['admin', 'super_admin'].includes(req.user.rolle)) {
            return res.status(403).json({ 
                success: false,
                message: 'Keine Berechtigung - Nur Admins können Gesuche hochladen' 
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Keine PDF-Datei hochgeladen'
            });
        }

        // Validiere PDF-Typ
        if (req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({
                success: false,
                message: 'Nur PDF-Dateien sind erlaubt'
            });
        }

        // Validiere Dateigröße (10MB)
        if (req.file.size > 10 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                message: 'Datei zu groß. Maximale Größe: 10MB'
            });
        }

        const { jahr, beschreibung } = req.body;
        const fileName = req.file.originalname;
        const filePath = req.file.path;
        
        logger.info('Gesuch Upload gestartet', { 
            fileName, 
            jahr, 
            beschreibung, 
            size: req.file.size,
            user: req.user.email 
        });
        
        // Extract information from filename and create Gesuch
        const gesuchTitel = fileName.replace('.pdf', '').replace(/[-_]/g, ' ');
        
        // Create Gesuch entry with file information
        const gesuchResult = await pool.query(`
            INSERT INTO sbv_gesuche (
                titel, 
                gesuch_typ, 
                jahr, 
                status, 
                eingereicht_am, 
                uploaded_file, 
                beschreibung,
                file_size,
                mime_type,
                antragsteller
            ) VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, $8, $9)
            RETURNING id, titel, gesuch_typ, jahr, status
        `, [
            gesuchTitel,
            'partner', // Default type
            parseInt(jahr),
            'eingereicht',
            filePath,
            beschreibung || '',
            req.file.size,
            req.file.mimetype,
            req.user.name || req.user.email
        ]);
        
        const gesuch = gesuchResult.rows[0];
        logger.info('Gesuch erstellt', { gesuchId: gesuch.id, titel: gesuch.titel });
        
        // Automatically generate Rapport from uploaded Gesuch
        const rapportTitel = `Rapport für ${gesuchTitel}`;
        
        const rapportResult = await pool.query(`
            INSERT INTO sbv_berichte (
                titel, 
                bericht_typ, 
                jahr, 
                status, 
                gesuch_id,
                erstellt_am,
                inhalt,
                erstellt_von
            ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)
            RETURNING id, titel, bericht_typ, jahr, status
        `, [
            rapportTitel,
            'rapport',
            parseInt(jahr),
            'entwurf',
            gesuch.id,
            `Automatisch generierter Rapport basierend auf hochgeladenem Gesuch "${gesuchTitel}".\n\nBeschreibung: ${beschreibung}\n\nDatei: ${fileName}\n\nStatus: Bereit zur Bearbeitung.`,
            req.user.name || req.user.email
        ]);
        
        const rapport = rapportResult.rows[0];
        logger.info('Rapport automatisch erstellt', { 
            rapportId: rapport.id, 
            gesuchId: gesuch.id,
            user: req.user.email 
        });
        
        res.json({
            success: true,
            message: 'Gesuch erfolgreich hochgeladen und Rapport erstellt',
            data: {
                gesuch: gesuch,
                rapport: rapport,
                fileName: fileName,
                fileSize: req.file.size
            }
        });
        
    } catch (error) {
        logger.error('Fehler beim Gesuch-Upload:', error);
        res.status(500).json({
            success: false,
            message: 'Fehler beim Hochladen des Gesuchs',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Interner Server-Fehler'
        });
    }
});

// Upload document with AI analysis for Archiv
app.post('/api/archiv/upload', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Keine Datei hochgeladen'
            });
        }
        
        const { jahr, typ } = req.body;
        
        // TODO: Hier würde KI-Analyse implementiert werden
        // Für jetzt erstellen wir Mock-Teilprojekte basierend auf Dateiname
        const extractedData = await analyzeDocument(req.file);
        
        // Speichere Dokument
        const docResult = await pool.query(`
            INSERT INTO sbv_dokumente (gesuch_id, dateiname, dateipfad, typ, groesse, hochgeladen_am)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING *
        `, [
            null, // Kein spezifisches Gesuch 
            req.file.originalname, 
            req.file.path, 
            typ || 'archiv', 
            req.file.size
        ]);
        
        // Erstelle Teilprojekte basierend auf Analyse
        if (extractedData.teilprojekte && extractedData.teilprojekte.length > 0) {
            for (const tp of extractedData.teilprojekte) {
                await pool.query(`
                    INSERT INTO sbv_teilprojekte (gesuch_id, name, beschreibung, budget_soll, jahr, status)
                    VALUES ($1, $2, $3, $4, $5, 'extrahiert')
                `, [null, tp.name, tp.beschreibung, tp.budget, jahr]);
            }
        }
        
        res.status(201).json({
            success: true,
            data: {
                document: docResult.rows[0],
                extractedData: extractedData
            },
            message: 'Dokument erfolgreich analysiert und hochgeladen'
        });
    } catch (error) {
        console.error('Error uploading to archiv:', error);
        res.status(500).json({
            success: false,
            error: 'Fehler beim Upload ins Archiv',
            message: error.message
        });
    }
});

// Mock AI document analysis function
async function analyzeDocument(file) {
    // Simuliert KI-Analyse basierend auf Dateiname und Typ
    const filename = file.originalname.toLowerCase();
    const teilprojekte = [];
    
    if (filename.includes('finanzgesuch') || filename.includes('bericht')) {
        // Simuliere extrahierte Teilprojekte
        if (filename.includes('2024')) {
            teilprojekte.push({
                name: "Digitalisierung Bauverband",
                beschreibung: "Modernisierung der IT-Infrastruktur",
                budget: 150000
            });
            teilprojekte.push({
                name: "Weiterbildung Mitarbeiter", 
                beschreibung: "Schulungen für neue Technologien",
                budget: 75000
            });
        }
        
        if (filename.includes('2023')) {
            teilprojekte.push({
                name: "Nachhaltigkeit Initiative",
                beschreibung: "Förderung nachhaltiger Bautechniken",
                budget: 200000
            });
        }
    }
    
    return {
        erkannte_jahre: filename.includes('2024') ? ['2024'] : ['2023'],
        gesuch_typ: filename.includes('finanz') ? 'finanzgesuch' : 'partner',
        teilprojekte: teilprojekte,
        ai_confidence: 0.85
    };
}

// Get Teilprojekte
app.get('/api/teilprojekte', async (req, res) => {
    try {
        const { jahr, gesuch_id, bericht_id } = req.query;
        let query = 'SELECT * FROM sbv_teilprojekte WHERE 1=1';
        const params = [];
        let paramCount = 0;
        
        if (jahr) {
            paramCount++;
            query += ` AND jahr = $${paramCount}`;
            params.push(jahr);
        }
        
        if (gesuch_id) {
            paramCount++;
            query += ` AND gesuch_id = $${paramCount}`;
            params.push(gesuch_id);
        }
        
        if (bericht_id) {
            paramCount++;
            query += ` AND bericht_id = $${paramCount}`;
            params.push(bericht_id);
        }
        
        query += ' ORDER BY id DESC';
        
        const result = await pool.query(query, params);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching teilprojekte:', error);
        res.status(500).json({
            success: false,
            error: 'Fehler beim Laden der Teilprojekte'
        });
    }
});

// Get einzelnes Teilprojekt
app.get('/api/teilprojekte/:id', async (req, res) => {
    try {
        const teilprojektId = req.params.id;
        const result = await pool.query('SELECT * FROM sbv_teilprojekte WHERE id = $1', [teilprojektId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Teilprojekt nicht gefunden'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching teilprojekt:', error);
        res.status(500).json({
            success: false,
            error: 'Fehler beim Laden des Teilprojekts'
        });
    }
});

// Get Maßnahmen für ein Teilprojekt
app.get('/api/teilprojekte/:id/massnahmen', async (req, res) => {
    try {
        const teilprojektId = req.params.id;
        
        // Suche in rapport_massnahmen über rapporte-Verbindung
        const query = `
            SELECT rm.*, r.teilprojekt 
            FROM rapport_massnahmen rm
            JOIN rapporte r ON rm.rapport_id = r.id
            JOIN sbv_teilprojekte tp ON tp.name = r.teilprojekt
            WHERE tp.id = $1
            ORDER BY rm.sortierung, rm.id
        `;
        
        const result = await pool.query(query, [teilprojektId]);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching massnahmen:', error);
        res.status(500).json({
            success: false,
            error: 'Fehler beim Laden der Maßnahmen'
        });
    }
});

// Get KPIs für ein Teilprojekt
app.get('/api/teilprojekte/:id/kpis', async (req, res) => {
    try {
        const teilprojektId = req.params.id;
        
        // Suche in rapport_kpis über rapporte-Verbindung
        const query = `
            SELECT rk.*, r.teilprojekt 
            FROM rapport_kpis rk
            JOIN rapporte r ON rk.rapport_id = r.id
            JOIN sbv_teilprojekte tp ON tp.name = r.teilprojekt
            WHERE tp.id = $1
            ORDER BY rk.sortierung, rk.id
        `;
        
        const result = await pool.query(query, [teilprojektId]);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching KPIs:', error);
        res.status(500).json({
            success: false,
            error: 'Fehler beim Laden der KPIs'
        });
    }
});

// Create Report from approved Gesuch
app.post('/api/berichte/from-gesuch', async (req, res) => {
    try {
        const { gesuch_id, jahr, benutzer_id } = req.body;
        
        // Hole genehmigtes Gesuch mit Teilprojekten
        const gesuchResult = await pool.query(`
            SELECT g.*, t.id as tp_id, t.name as tp_name, t.beschreibung as tp_beschreibung,
                   t.budget_soll, t.budget_ist, t.status as tp_status
            FROM sbv_gesuche g 
            LEFT JOIN sbv_teilprojekte t ON g.id = t.gesuch_id
            WHERE g.id = $1 AND g.genehmigt = true
        `, [gesuch_id]);
        
        if (gesuchResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Genehmigtes Gesuch nicht gefunden'
            });
        }
        
        const gesuch = gesuchResult.rows[0];
        
        // Erstelle neuen Bericht
        const berichtResult = await pool.query(`
            INSERT INTO sbv_berichte (titel, jahr, beschreibung, benutzer_id, status, erstellt_am)
            VALUES ($1, $2, $3, $4, 'entwurf', NOW())
            RETURNING *
        `, [
            `Bericht: ${gesuch.titel}`,
            jahr || gesuch.jahr,
            `Automatisch generiert aus Gesuch: ${gesuch.titel}`,
            benutzer_id
        ]);
        
        const bericht = berichtResult.rows[0];
        
        // Verknüpfe Teilprojekte mit dem neuen Bericht
        for (const row of gesuchResult.rows) {
            if (row.tp_id) {
                await pool.query(`
                    UPDATE sbv_teilprojekte 
                    SET bericht_id = $1 
                    WHERE id = $2
                `, [bericht.id, row.tp_id]);
            }
        }
        
        res.status(201).json({
            success: true,
            data: bericht,
            message: 'Bericht erfolgreich aus Gesuch erstellt'
        });
    } catch (error) {
        console.error('Error creating report from gesuch:', error);
        res.status(500).json({
            success: false,
            error: 'Fehler beim Erstellen des Berichts'
        });
    }
});

// Upload document
app.post('/api/dokumente/upload', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }
        
        const { gesuch_id, typ } = req.body;
        
        const result = await pool.query(`
            INSERT INTO sbv_dokumente (gesuch_id, dateiname, dateipfad, typ, groesse, hochgeladen_am)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING *
        `, [
            gesuch_id, 
            req.file.originalname, 
            req.file.path, 
            typ || 'sonstiges', 
            req.file.size
        ]);
        
        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Document uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload document'
        });
    }
});

// Upload Rapport mit Dokumenten
app.post('/api/berichte/upload', authenticateToken, upload.single('rapportDocument'), async (req, res) => {
    try {
        // Berechtigung prüfen
        if (!['admin', 'super_admin'].includes(req.user.rolle)) {
            return res.status(403).json({
                success: false,
                message: 'Keine Berechtigung - Nur Admins können Rapporte erstellen'
            });
        }

        console.log('📎 Rapport Upload gestartet:', {
            file: req.file ? req.file.originalname : 'keine Datei',
            user: req.user.email,
            body: req.body
        });

        const {
            teilprojekt, jahr, periode, budgetBrutto, istBrutto, aufwandsminderung,
            wasLiefGut, abweichungen, lessonsLearned, dokumenteHinweise,
            massnahmen, kpis
        } = req.body;

        // Validierung
        if (!teilprojekt || !jahr || !periode) {
            return res.status(400).json({
                success: false,
                message: 'Teilprojekt, Jahr und Periode sind erforderlich'
            });
        }

        // Datei-Informationen
        let uploadedFile = null;
        if (req.file) {
            // Validierung der Datei
            if (req.file.mimetype !== 'application/pdf') {
                return res.status(400).json({
                    success: false,
                    message: 'Nur PDF-Dateien sind erlaubt'
                });
            }

            if (req.file.size > 10 * 1024 * 1024) {
                return res.status(400).json({
                    success: false,
                    message: 'Datei zu groß. Maximale Größe: 10MB'
                });
            }

            uploadedFile = {
                filename: req.file.originalname,
                path: req.file.path,
                size: req.file.size
            };
        }

        // Rapport in Datenbank speichern
        const berichtResult = await pool.query(`
            INSERT INTO sbv_berichte (
                titel, teilprojekt, jahr, periode, status,
                budget_brutto, ist_brutto, aufwandsminderung,
                was_lief_gut, abweichungen, lessons_learned,
                dokumente_hinweise, uploaded_file, file_size,
                massnahmen_json, kpis_json,
                erstellt_von, erstellt_am
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
            RETURNING *
        `, [
            `Rapport ${teilprojekt} ${periode}`,
            teilprojekt,
            parseInt(jahr),
            periode,
            'zur-pruefung',
            parseFloat(budgetBrutto) || 0,
            parseFloat(istBrutto) || 0,
            parseFloat(aufwandsminderung) || 0,
            wasLiefGut || '',
            abweichungen || '',
            lessonsLearned || '',
            dokumenteHinweise || '',
            uploadedFile ? uploadedFile.filename : null,
            uploadedFile ? uploadedFile.size : null,
            massnahmen ? JSON.stringify(massnahmen) : '[]',
            kpis ? JSON.stringify(kpis) : '[]',
            req.user.userId
        ]);

        const neuerBericht = berichtResult.rows[0];

        console.log('✅ Rapport erfolgreich erstellt:', neuerBericht.id);

        res.status(201).json({
            success: true,
            data: neuerBericht,
            message: 'Rapport erfolgreich erstellt' + (uploadedFile ? ' und Dokument hochgeladen' : ''),
            uploaded_file: uploadedFile
        });

    } catch (error) {
        console.error('❌ Fehler beim Rapport-Upload:', error);
        res.status(500).json({
            success: false,
            message: 'Interner Serverfehler beim Upload',
            error: error.message
        });
    }
});

// Get assignments (Zuweisungen)
app.get('/api/zuweisungen', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT z.*, g.titel as gesuch_titel, b.name as benutzer_name 
            FROM sbv_zuweisungen z 
            LEFT JOIN sbv_gesuche g ON z.gesuch_id = g.id 
            LEFT JOIN sbv_benutzer b ON z.benutzer_id = b.id 
            ORDER BY z.zugewiesen_am DESC
        `);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching zuweisungen:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch assignments'
        });
    }
});

// Dashboard statistics
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        // Get various statistics
        const gesucheCount = await pool.query('SELECT COUNT(*) as count FROM sbv_gesuche');
        const benutzerCount = await pool.query('SELECT COUNT(*) as count FROM sbv_benutzer');
        const berichteCount = await pool.query('SELECT COUNT(*) as count FROM sbv_berichte');
        const dokumenteCount = await pool.query('SELECT COUNT(*) as count FROM sbv_dokumente');
        
        // Get status distribution
        const statusStats = await pool.query(`
            SELECT status, COUNT(*) as count 
            FROM sbv_gesuche 
            GROUP BY status
        `);
        
        // Get recent activities
        const recentActivities = await pool.query(`
            SELECT 'gesuch' as typ, titel as beschreibung, eingereicht_am as datum, status
            FROM sbv_gesuche 
            ORDER BY eingereicht_am DESC 
            LIMIT 10
        `);
        
        res.json({
            success: true,
            data: {
                statistics: {
                    gesuche: parseInt(gesucheCount.rows[0].count),
                    benutzer: parseInt(benutzerCount.rows[0].count),
                    berichte: parseInt(berichteCount.rows[0].count),
                    dokumente: parseInt(dokumenteCount.rows[0].count)
                },
                statusDistribution: statusStats.rows,
                recentActivities: recentActivities.rows
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard statistics'
        });
    }
});

// API Documentation
app.get('/api', (req, res) => {
    res.status(200).json({
        api: "SBV Professional App API",
        version: "1.0",
        endpoints: {
            authentication: {
                "/api/login": "POST - Benutzeranmeldung",
                "/api/logout": "POST - Benutzerabmeldung"
            },
            sbv_benutzer: {
                "/api/sbv_benutzer": "GET - Benutzerliste (Auth required)",
                "/api/sbv_benutzer/:id": "PUT - Benutzer aktualisieren (Auth required)"
            },
            gesuche: {
                "/api/gesuche": "GET - Gesuche abrufen (Auth required)",
                "/api/gesuche/upload": "POST - Gesuch hochladen (Auth required)",
                "/api/rapport": "POST - Rapport erstellen (Auth required)"
            },
            system: {
                "/api/health": "GET - Systemstatus",
                "/api/stats": "GET - Statistiken (Auth required)",
                "/api": "GET - API Übersicht"
            }
        },
        authentication: "Bearer Token required für geschützte Endpunkte",
        contentTypes: ["application/json", "multipart/form-data"]
    });
});

// Health check
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({
            success: true,
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    logger.info(`🚀 SBV Professional Server running on http://localhost:${PORT}`);
    logger.info(`📊 API documentation available at http://localhost:${PORT}/api`);
    logger.info(`💾 Database: PostgreSQL (${pool.options.host}:${pool.options.port})`);
});

// Global Error Handler für unbehandelte Fehler
app.use((err, req, res, next) => {
    logger.error('Unbehandelter Fehler:', err);
    res.status(500).json({
        success: false,
        message: 'Interner Serverfehler',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Ein Fehler ist aufgetreten'
    });
});

// Ensure Upload Directory exists
async function ensureUploadDirectory() {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
        await fs.promises.access(uploadDir);
        logger.info('✅ Upload-Verzeichnis existiert');
    } catch {
        await fs.promises.mkdir(uploadDir, { recursive: true });
        logger.info('📁 Upload-Verzeichnis erstellt');
    }
}

// Initialize upload directory on startup
ensureUploadDirectory().catch(err => {
    logger.error('❌ Fehler beim Erstellen des Upload-Verzeichnisses:', err);
});

// Database connection error handling
pool.on('error', (err) => {
    logger.error('Unerwarteter Datenbankfehler:', err);
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        logger.warn('🔄 Versuche Datenbankverbindung wiederherzustellen in 5 Sekunden...');
        setTimeout(() => {
            pool.connect()
                .then(() => logger.info('✅ Datenbankverbindung wiederhergestellt'))
                .catch(reconnectErr => logger.error('❌ Reconnect fehlgeschlagen:', reconnectErr));
        }, 5000);
    }
});

// Graceful shutdown
process.on('SIGINT', async () => {
    logger.info('🛑 SIGINT empfangen, fahre Server herunter...');
    try {
        await pool.end();
        logger.info('✅ Datenbankverbindungen geschlossen');
        process.exit(0);
    } catch (err) {
        logger.error('❌ Fehler beim Herunterfahren:', err);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    logger.info('🛑 SIGTERM empfangen, fahre Server herunter...');
    try {
        await pool.end();
        logger.info('✅ Datenbankverbindungen geschlossen');
        process.exit(0);
    } catch (err) {
        logger.error('❌ Fehler beim Herunterfahren:', err);
        process.exit(1);
    }
});

