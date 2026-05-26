const db = require('../config/db');

// 1. Mengambil Notifikasi Terbaru (Maksimal 20)
exports.getNotifications = (req, res) => {
    const query = 'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Gagal mengambil notifikasi' });
        res.status(200).json(results);
    });
};

// 2. Tandai Semua Notifikasi Sudah Dibaca
exports.markAllAsRead = (req, res) => {
    const query = 'UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE';
    db.query(query, (err, result) => {
        if (err) return res.status(500).json({ message: 'Gagal memperbarui notifikasi' });
        res.status(200).json({ message: 'Semua notifikasi telah dibaca' });
    });
};

// 3. FUNGSI BANTUAN (Bisa dipanggil oleh controller lain saat ada event baru)
exports.createNotification = (title, description, type) => {
    const sql = "INSERT INTO notifications (title, description, type) VALUES (?, ?, ?)";
    db.query(sql, [title, description, type], (err) => {
        if (err) console.error("Gagal membuat notifikasi:", err.message);
    });
};

// 4. Tandai SATU Notifikasi Sudah Dibaca (Berdasarkan ID)
exports.markSingleAsRead = (req, res) => {
    const { id } = req.params;
    const query = 'UPDATE notifications SET is_read = TRUE WHERE id = ?';
    
    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Gagal memperbarui notifikasi' });
        res.status(200).json({ message: 'Notifikasi berhasil dibaca' });
    });
};