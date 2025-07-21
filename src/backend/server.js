// SBV Professional Express Server with PostgreSQL
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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
        console.log('✅ PostgreSQL database connected successfully!');
        createSuperAdminUser();
    })
    .catch(err => console.error('❌ PostgreSQL connection error:', err));

// Create Super Admin User
async function createSuperAdminUser() {
    const superAdminEmail = 'superadmin@digitale-rakete.ch';
    const superAdminPassword = 'SBV-Admin-2025-SecurePass!';
    
    try {
        // Check if super admin already exists in sbv_benutzer table
        const existingUser = await pool.query(
            'SELECT id FROM sbv_benutzer WHERE email = $1',
            [superAdminEmail]
        );
        
        if (existingUser.rows.length === 0) {
            // Create super admin user (simplified without status column)
            await pool.query(
                `INSERT INTO sbv_benutzer (name, email) 
                 VALUES ($1, $2)`,
                ['Super Admin - Digitale Rakete', superAdminEmail]
            );
            console.log('✅ Super Admin User created:');
            console.log(`   📧 Email: ${superAdminEmail}`);
            console.log(`   🔒 Password: ${superAdminPassword}`);
            console.log('   👑 Role: admin');
        } else {
            console.log('ℹ️  Super Admin User already exists');
        }
    } catch (error) {
        console.error('❌ Error with existing table:', error.message);
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

// Serve main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'sbv-professional-dashboard.html'));
});

// API Routes

// Get all users (Benutzer)
app.get('/api/benutzer', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM sbv_benutzer ORDER BY id');
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching benutzer:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users'
        });
    }
});

// Get all applications (Gesuche)
app.get('/api/gesuche', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM sbv_gesuche 
            ORDER BY id DESC
        `);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching gesuche:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch applications'
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
    console.log(`🚀 SBV Professional Server running on http://localhost:${PORT}`);
    console.log(`📊 API documentation available at http://localhost:${PORT}/api`);
    console.log(`💾 Database: PostgreSQL (${pool.options.host}:${pool.options.port})`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Shutting down server...');
    pool.end(() => {
        console.log('✅ Database connections closed.');
        process.exit(0);
    });
});
