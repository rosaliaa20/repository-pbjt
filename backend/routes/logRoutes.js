const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Sesuaikan path ini dengan koneksi database-mu

// ==========================================
// 1. MENGAMBIL LOG SISTEM UNTUK DASHBOARD
// ==========================================
router.get('/', (req, res) => {
  // Ambil 20 aktivitas terbaru
  const sql = "SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 20";
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ message: "Gagal mengambil log sistem." });
    }
    res.status(200).json(results);
  });
});

// ==========================================
// 2. MENAMBAH LOG BARU (Dipanggil oleh sistem)
// ==========================================
router.post('/', (req, res) => {
  const { type, user_name, description, ip_address } = req.body;
  
  const sql = "INSERT INTO system_logs (type, user_name, description, ip_address) VALUES (?, ?, ?, ?)";
  db.query(sql, [type, user_name, description, ip_address], (err, result) => {
    if (err) return res.status(500).json({ message: "Gagal menyimpan log." });
    res.status(201).json({ message: "Log berhasil direkam." });
  });
});

module.exports = router;