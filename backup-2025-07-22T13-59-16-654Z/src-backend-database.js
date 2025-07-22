const mysql = require('mysql2/promise');

// Datenbank-Konfiguration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sbv_professional',
    charset: 'utf8mb4',
    timezone: '+00:00',
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000
};

// Connection Pool erstellen
const pool = mysql.createPool(dbConfig);

// Database utilities
class Database {
    static async query(sql, params = []) {
        try {
            const [rows] = await pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    static async getConnection() {
        return await pool.getConnection();
    }

    static async transaction(callback) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const result = await callback(connection);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async testConnection() {
        try {
            const connection = await pool.getConnection();
            console.log('✅ Database connection successful');
            connection.release();
            return true;
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            return false;
        }
    }
}

module.exports = Database;
