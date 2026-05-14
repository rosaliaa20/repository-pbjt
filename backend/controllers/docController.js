const db = require("../config/db");
const path = require("path");
const fs = require("fs");
const { PDFDocument, rgb, degrees } = require("pdf-lib");
const notifController = require('./notifController');

// 1. Ambil SEMUA dokumen (Dengan Filter Tanggal & Urutan Terbaru)
exports.getAllDocs = (req, res) => {
    const { startDate, endDate } = req.query; 
    let sql = "SELECT * FROM documents";
    let params = [];

    if (startDate && endDate) {
        sql += " WHERE DATE(created_at) >= ? AND DATE(created_at) <= ?";
        params.push(startDate, endDate);
    }

    sql += " ORDER BY id DESC";

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("❌ Error getAllDocs:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
};

// 2. Ambil detail 1 dokumen berdasarkan ID
exports.getDocumentById = (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM documents WHERE id = ?";

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("❌ Database error detail:", err);
            return res.status(500).json({ message: "Gagal mengambil data." });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "Dokumen tidak ditemukan." });
        }
        res.status(200).json(results[0]);
    });
};

// 3. Preview PDF (Untuk Viewer)
exports.previewDoc = (req, res) => {
    db.query("SELECT file_path FROM documents WHERE id = ?", [req.params.id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).send("File tidak ditemukan di database.");
        }

        const filePath = path.join(__dirname, "../", results[0].file_path);

        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.status(404).send("File fisik PDF tidak ditemukan di server.");
        }
    });
};

// 4. Download Dokumen dengan Watermark
exports.downloadDoc = (req, res) => {
    db.query("SELECT * FROM documents WHERE id = ?", [req.params.id], async (err, results) => {
        if (err || results.length === 0) return res.status(404).send("Dokumen tidak ditemukan.");

        const doc = results[0];
        const filePath = path.join(__dirname, "../", doc.file_path);

        if (!fs.existsSync(filePath)) return res.status(404).send("File fisik tidak ditemukan.");

        try {
            const existingPdfBytes = fs.readFileSync(filePath);
            const pdfDoc = await PDFDocument.load(existingPdfBytes);
            const pages = pdfDoc.getPages();

            pages.forEach((page) => {
                const { width, height } = page.getSize();
                page.drawText("REPOSITORY DIGITAL - POLITEKNIK BAJA TEGAL", {
                    x: width / 2 - 200,
                    y: height / 2,
                    size: 20,
                    color: rgb(0.8, 0.8, 0.8),
                    opacity: 0.4,
                    rotate: degrees(-45),
                });
            });

            const pdfBytes = await pdfDoc.save();
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename="${doc.title}.pdf"`);
            res.send(Buffer.from(pdfBytes));
        } catch (error) {
            res.status(500).send("Gagal memproses watermark.");
        }
    });
};

// 5. Upload Dokumen Baru (Sinkron Database)
exports.uploadDoc = (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "File PDF wajib diunggah!" });

        const { title, document_author, year, department, category, abstract, external_link, status } = req.body;

        const finalTitle = title || "Tanpa Judul";
        const finalAuthor = document_author || "Anonim";
        const filePath = `uploads/${req.file.filename}`;
        // 🔥 TAMBAHKAN BARIS INI UNTUK MELACAK FILE 🔥
        console.log("📁 File baru sukses tersimpan di:", req.file.path);

        const query = `INSERT INTO documents (title, document_author, abstract, category, department, year, file_path, external_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [finalTitle, finalAuthor, abstract || "", category || "Umum", department || "Umum", year || new Date().getFullYear(), filePath, external_link || null, status || 'Pending'];

        db.query(query, values, (err, result) => {
            if (err) return res.status(500).json({ message: err.message });

            notifController.createNotification("Dokumen Baru", `${finalAuthor} mengunggah: "${finalTitle}"`, "doc");
            res.status(201).json({ message: "Berhasil diunggah!", documentId: result.insertId });
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 6. Hapus Dokumen (Database + File Fisik) 🔥 REVISI 🔥
exports.deleteDoc = (req, res) => {
    const docId = req.params.id;

    // 1. Ambil data file_path dulu sebelum dihapus
    db.query("SELECT title, file_path FROM documents WHERE id = ?", [docId], (err, results) => {
        if (err) return res.status(500).json({ message: "Database Error" });
        if (results.length === 0) return res.status(404).json({ message: "Dokumen tidak ditemukan." });

        const docTitle = results[0].title;
        // Amankan jalurnya menggunakan path.resolve untuk akurasi tingkat tinggi
        const filePath = path.resolve(__dirname, "../", results[0].file_path);

        // 2. Hapus data di database
        db.query("DELETE FROM documents WHERE id = ?", [docId], (deleteErr) => {
            if (deleteErr) return res.status(500).json({ message: "Gagal menghapus data di database." });

            // 3. Hapus file fisik secara SYNCHRONOUS (Lebih Agresif & Pasti)
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`✅ File fisik terhapus tanpa sisa: ${filePath}`);
                } else {
                    console.log(`⚠️ Peringatan: File fisik tidak ditemukan di ${filePath}, tapi data database berhasil dihapus.`);
                }
            } catch (unlinkErr) {
                console.error("❌ Gagal menghapus file fisik karena file sedang dikunci sistem:", unlinkErr);
            }

            notifController.createNotification("Dokumen Dihapus", `"${docTitle}" dihapus permanen.`, "alert");
            res.json({ message: "Dokumen dan file fisik berhasil dihapus!" });
        });
    });
};

// 7. Update Dokumen (Edit)
exports.updateDoc = (req, res) => {
    const docId = req.params.id;
    const { title, document_author, year, category, department, abstract, external_url } = req.body;

    if (req.file) {
        const newPath = `uploads/${req.file.filename}`;
        
        db.query("SELECT file_path FROM documents WHERE id = ?", [docId], (err, results) => {
            if (!err && results.length > 0) {
                const oldFile = path.join(__dirname, "../", results[0].file_path);
                if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
            }
            
            // 🔥 TAMBAHAN: status='Pending' 🔥
            const sql = `UPDATE documents SET title=?, document_author=?, year=?, category=?, department=?, abstract=?, file_path=?, external_url=?, status='Pending' WHERE id=?`;
            
            db.query(sql, [title, document_author, year, category, department, abstract, newPath, external_url, docId], (updErr) => {
                if (updErr) return res.status(500).json({ message: "Gagal update database." });
                res.json({ message: "Dokumen & File berhasil diperbarui!" });
            });
        });
    } else {
        // 🔥 TAMBAHAN: status='Pending' 🔥
        const sql = `UPDATE documents SET title=?, document_author=?, year=?, category=?, department=?, abstract=?, external_url=?, status='Pending' WHERE id=?`;
        
        db.query(sql, [title, document_author, year, category, department, abstract, external_url, docId], (updErr) => {
            if (updErr) return res.status(500).json({ message: "Gagal update database." });
            res.json({ message: "Data berhasil diperbarui!" });
        });
    }
};

// 8. Tambah View
exports.addView = (req, res) => {
    db.query("UPDATE documents SET views = COALESCE(views, 0) + 1 WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "Gagal update view" });
        res.status(200).json({ message: "View bertambah" });
    });
};

// 9. Update Status & Simpan Bukti Gambar Dokumentasi
exports.updateStatus = (req, res) => {
    const docId = req.params.id;
    const { status, rejection_reason } = req.body;
    
    // 🔥 Jika ada file gambar yang diunggah oleh Admin
    const rejection_assets = req.file ? `uploads/${req.file.filename}` : null;

    const query = "UPDATE documents SET status = ?, rejection_reason = ?, rejection_assets = ? WHERE id = ?";
    const values = [status, rejection_reason || null, rejection_assets, docId];

    db.query(query, values, (err) => {
        if (err) return res.status(500).json({ message: "Gagal update status" });
        res.status(200).json({ message: `Status menjadi ${status}`, file: rejection_assets });
    });
};