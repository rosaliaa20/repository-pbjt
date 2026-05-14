const mysql = require('mysql2');
require('dotenv').config(); // Sangat penting agar bisa membaca file .env

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'e_repository_kampus' // Sesuai nama database di phpMyAdmin
});

db.connect((err) => {
    if (err) {
        console.error('❌ Koneksi Database Gagal:', err.message);
    } else {
        console.log('✅ Berhasil terhubung ke database MySQL [e_repository_kampus]');
    }
});

module.exports = db;