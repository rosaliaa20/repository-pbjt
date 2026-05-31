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
    queueLimit: 0           // Tidak ada batas antrian request
});

// Verifikasi koneksi saat startup
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Koneksi Database Gagal:', err.message);
        // Jangan crash server, hanya log error-nya
    } else {
        console.log('✅ Berhasil terhubung ke database MySQL [e_repository_kampus]');
        connection.release(); // Segera kembalikan koneksi ke pool
    }
});

module.exports = pool;