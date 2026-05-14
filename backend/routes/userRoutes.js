// Route untuk Mengunci / Membuka Kunci Akun
router.put('/:id/toggle-lock', (req, res) => {
  const { is_locked } = req.body;
  const sql = "UPDATE users SET is_locked = ? WHERE id = ?";
  
  db.query(sql, [is_locked, req.params.id], (err, result) => {
    if (err) {
      console.error("Gagal update status lock:", err);
      return res.status(500).json({ message: "Gagal memperbarui status keamanan akun." });
    }
    res.status(200).json({ message: "Status akun berhasil diperbarui." });
  });
});