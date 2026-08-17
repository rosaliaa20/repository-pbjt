const mysql = require('mysql2');
require('dotenv').config();

// ============================================================
// CONNECTION POOL: Lebih stabil dari single connection.
// Pool secara otomatis me-manage koneksi yang drop/idle.
// ============================================================
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'e_repository_kampus',
    waitForConnections: true,
    connectionLimit: 10,    // Maksimal 10 koneksi bersamaan
    queueLimit: 0,          // Tidak ada batas antrian request
    enableKeepAlive: true,  // Mencegah error read ECONNRESET akibat Docker Swarm network timeout
    keepAliveInitialDelay: 0
});

// Verifikasi koneksi saat startup
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Koneksi Database Gagal:', err.message);
        // Jangan crash server, hanya log error-nya
    } else {
        console.log('✅ Berhasil terhubung ke database MySQL [e_repository_kampus]');
        
        // Auto-migration: Pastikan kolom uploader_id ada untuk keamanan IDOR
        connection.query("ALTER TABLE documents ADD COLUMN uploader_id INT NULL AFTER status", (err) => {
            if (err && err.code !== 'ER_DUP_FIELDNAME') {
                console.log('Info: Kolom uploader_id sudah ada atau gagal ditambahkan otomatis.');
            } else if (!err) {
                console.log('✅ Auto-migration: Kolom uploader_id berhasil ditambahkan.');
            }
        });

        connection.release(); // Segera kembalikan koneksi ke pool
    }
});

module.exports = pool;