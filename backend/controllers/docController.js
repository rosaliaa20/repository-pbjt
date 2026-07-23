const db = require("../config/db");
const path = require("path");
const fs = require("fs");
const { PDFDocument, rgb, degrees } = require("pdf-lib");
const notifController = require('./notifController');
const { sendWAMessage } = require('../utils/waBot'); // Pastikan path ini sesuai dengan lokasi file bot WA kamu

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
        
        // Inject file_size by reading physical file
        const docsWithSize = results.map(doc => {
            let fileSize = 0;
            if (doc.file_path) {
                try {
                    const fullPath = path.join(__dirname, "../", doc.file_path);
                    if (fs.existsSync(fullPath)) {
                        const stats = fs.statSync(fullPath);
                        fileSize = stats.size; // in bytes
                    }
                } catch (e) {
                    // Ignore errors if file is locked or missing
                }
            }
            return { ...doc, file_size: fileSize };
        });

        res.json(docsWithSize);
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

// 3. Preview PDF (Tanpa Watermark Bakaran - Disediakan Murni untuk Native Viewer + SVG Overlay)
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


// 4. Download Dokumen dengan Watermark Raksasa Dibakar
exports.downloadDoc = (req, res) => {
    db.query("SELECT * FROM documents WHERE id = ?", [req.params.id], async (err, results) => {
        if (err || results.length === 0) return res.status(404).send("Dokumen tidak ditemukan.");

        const doc = results[0];
        const filePath = path.join(__dirname, "../", doc.file_path);

        if (!fs.existsSync(filePath)) return res.status(404).send("File fisik tidak ditemukan.");

        try {
            const existingPdfBytes = fs.readFileSync(filePath);
            const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
            const pages = pdfDoc.getPages();

            const LINE_1 = "POLITEKNIK BAJA TEGAL";
            const LINE_2 = "REPOSITORY DIGITAL";
            const LINE_3 = "VIEW ONLY";

            pages.forEach((page) => {
                const { width, height } = page.getSize();
                const cx = width / 2;
                const cy = height / 2;

                // Baris 1 — Nama Institusi (Raksasa)
                page.drawText(LINE_1, {
                    x: cx - 270,
                    y: cy + 90,
                    size: 48,
                    color: rgb(0.55, 0.55, 0.55),
                    opacity: 0.18,
                    rotate: degrees(-40),
                });

                // Baris 2 — Label Repository (Sedang)
                page.drawText(LINE_2, {
                    x: cx - 210,
                    y: cy - 15,
                    size: 36,
                    color: rgb(0.55, 0.55, 0.55),
                    opacity: 0.18,
                    rotate: degrees(-40),
                });

                // Baris 3 — View Only (Besar, merah samar)
                page.drawText(LINE_3, {
                    x: cx - 140,
                    y: cy - 100,
                    size: 54,
                    color: rgb(0.65, 0.10, 0.15),
                    opacity: 0.18,
                    rotate: degrees(-40),
                });
            });

            const pdfBytes = await pdfDoc.save();
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename="${doc.title}.pdf"`);
            res.send(Buffer.from(pdfBytes));
        } catch (error) {
            console.error("❌ Gagal membakar watermark unduhan:", error.message);
            // Fallback: biarkan terunduh mentah jika gagal (misal file terkunci)
            res.download(filePath);
        }
    });
};

// 4b. Download Dokumen Murni (Khusus Admin - VIP)
exports.downloadOriginalDoc = (req, res) => {
    db.query("SELECT * FROM documents WHERE id = ?", [req.params.id], (err, results) => {
        if (err || results.length === 0) return res.status(404).send("Dokumen tidak ditemukan.");

        const doc = results[0];
        const filePath = path.join(__dirname, "../", doc.file_path);

        if (!fs.existsSync(filePath)) return res.status(404).send("File fisik tidak ditemukan.");

        // Langsung kirim file asli tanpa proses PDF-lib
        res.download(filePath, `${doc.title}.pdf`);
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

// 6. Hapus Dokumen (Database + File Fisik)
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

            // 3. Hapus file fisik secara SYNCHRONOUS
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

// 7. Update Dokumen (Edit / Revisi Mahasiswa & Admin)
exports.updateDoc = (req, res) => {
    const docId = req.params.id;

    // VALIDASI KEPEMILIKAN DOKUMEN (Mencegah IDOR)
    db.query("SELECT * FROM documents WHERE id = ?", [docId], (err, results) => {
        if (err) return res.status(500).json({ message: "Kesalahan Database saat memverifikasi kepemilikan." });
        if (results.length === 0) return res.status(404).json({ message: "Dokumen tidak ditemukan." });

        const existingDoc = results[0];

        // Otorisasi: Harus Admin ATAU Pemilik Asli Dokumen (Dengan normalisasi case & whitespace)
        const currentUserName = String(req.user.name || '').trim().toLowerCase();
        const docAuthorName = String(existingDoc.document_author || '').trim().toLowerCase();

        if (req.user.role !== 'admin' && currentUserName !== docAuthorName) {
            return res.status(403).json({ message: "Akses ditolak. Anda hanya dapat mengedit dokumen milik Anda sendiri." });
        }
        
        const title = req.body.title || existingDoc.title;
        const document_author = req.body.document_author || existingDoc.document_author;
        const year = req.body.year || existingDoc.year;
        const category = req.body.category || existingDoc.category;
        const department = req.body.department || existingDoc.department;
        const abstract = req.body.abstract || existingDoc.abstract;
        const external_url = req.body.external_url || req.body.external_link || existingDoc.external_url;

        // Logika Status: 
        // Jika Mahasiswa revisi -> otomatis turun jadi 'Pending' agar Admin bisa meninjau ulang.
        // Jika Admin revisi -> pertahankan status lama (atau ambil dari request).
        const status = req.user.role === 'admin' ? (req.body.status || existingDoc.status) : 'Pending';

        if (req.file) {
            const newPath = `uploads/${req.file.filename}`;
            
            // Hapus file fisik lama jika ada
            if (existingDoc.file_path) {
                const oldFile = path.join(__dirname, "../", existingDoc.file_path);
                try { if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile); } catch (e) { console.error("Abaikan: File lama tidak ada"); }
            }
            
            const sql = `UPDATE documents SET title=?, document_author=?, year=?, category=?, department=?, abstract=?, file_path=?, external_url=?, status=? WHERE id=?`;
            
            db.query(sql, [title, document_author, year, category, department, abstract, newPath, external_url, status, docId], (updErr) => {
                if (updErr) return res.status(500).json({ message: "Gagal update database." });
                
                notifController.createNotification("Revisi Dokumen", `${req.user.name} baru saja mengirimkan revisi file untuk: "${title}"`, "doc");
                res.json({ message: "Dokumen & File berhasil diperbarui!" });
            });
        } else {
            const sql = `UPDATE documents SET title=?, document_author=?, year=?, category=?, department=?, abstract=?, external_url=?, status=? WHERE id=?`;
            
            db.query(sql, [title, document_author, year, category, department, abstract, external_url, status, docId], (updErr) => {
                if (updErr) return res.status(500).json({ message: "Gagal update database." });
                
                notifController.createNotification("Revisi Dokumen", `${req.user.name} baru saja mengirimkan revisi teks untuk: "${title}"`, "doc");
                res.json({ message: "Data berhasil diperbarui!" });
            });
        }
    });
};

// 8. Tambah View
exports.addView = (req, res) => {
    db.query("UPDATE documents SET views = COALESCE(views, 0) + 1 WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "Gagal update view" });
        res.status(200).json({ message: "View bertambah" });
    });
};

// 9. Update Status & Kirim WA (Dinamis Sesuai Kategori Dokumen)
exports.updateStatus = (req, res) => {
    const docId = req.params.id;
    const { status, rejection_reason } = req.body;
    
    // Jika ada file gambar yang diunggah oleh Admin
    const rejection_assets = req.file ? `uploads/${req.file.filename}` : null;

    const query = "UPDATE documents SET status = ?, rejection_reason = ?, rejection_assets = ? WHERE id = ?";
    const values = [status, rejection_reason || null, rejection_assets, docId];

    db.query(query, values, (err) => {
        if (err) return res.status(500).json({ message: "Gagal update status" });

        const queryWA = `
            SELECT d.title, d.document_author, d.category, u.no_wa 
            FROM documents d 
            JOIN users u ON REPLACE(LOWER(TRIM(d.document_author)), ' ', '') = REPLACE(LOWER(TRIM(u.full_name)), ' ', '')
            WHERE d.id = ?
        `;
        
        db.query(queryWA, [docId], (errUser, results) => {
            console.log(`[WA DEBUG] Mencari target WA untuk docId ${docId}...`);
            if (errUser) {
                console.error("[WA DEBUG] Error Query DB:", errUser);
            } else if (results.length > 0) {
                const { title, document_author, category, no_wa } = results[0];
                console.log(`[WA DEBUG] Ditemukan Penulis: ${document_author}, No WA: ${no_wa || 'KOSONG'}`);

                if (no_wa) { 
                    let pesanWA = '';
                    const protocol = req.get('host').includes('localhost') ? 'http' : 'https';
                    const appUrl = process.env.APP_URL || `${protocol}://${req.get('host')}`;
                    const loginLink = `${appUrl}/login`; 

                    const jenisDokumen = category || 'dokumen';

                    if (status === 'Terbit' || status === 'Disetujui') {
                        pesanWA = `Halo *${document_author}*, 👋\n\nKami ingin menginformasikan bahwa *${jenisDokumen}* Anda yang berjudul:\n_"${title}"_\n\nTelah selesai ditinjau dan saat ini berstatus *✅ DISETUJUI / TERBIT* di E-Repository PBJT. 🎉\n\nTerima kasih banyak atas kontribusi Anda!\nAnda dapat meninjau dokumen tersebut melalui tautan berikut:\n🔗 ${loginLink}\n\n_(Pesan ini dikirim secara otomatis oleh sistem, mohon untuk tidak membalas)_`;
                    } else if (status === 'Ditolak' || status === 'Revisi') {
                        pesanWA = `Halo *${document_author}*, 👋\n\nKami ingin menyampaikan pembaruan terkait *${jenisDokumen}* Anda yang berjudul:\n_"${title}"_\n\nSaat ini dokumen Anda berstatus: *⚠️ ${status.toUpperCase()}*.\n\n*📝 Catatan dari Admin:*\n_${rejection_reason || 'Tidak ada catatan tambahan'}_\n\nMohon kesediaannya untuk melakukan penyesuaian sesuai catatan di atas. Anda dapat mengunggah ulang dokumen revisi dengan masuk ke akun E-Repository melalui tautan berikut:\n🔗 ${loginLink}\n\nTerima kasih dan selamat melanjutkan revisi! 💪\n\n_(Pesan ini dikirim secara otomatis oleh sistem, mohon untuk tidak membalas)_`;
                    }

                    if (pesanWA !== '') {
                        console.log(`[WA DEBUG] Meneruskan pesan ke antrean waBot.js...`);
                        sendWAMessage(no_wa, pesanWA);
                    }
                } else {
                    console.log(`[WA DEBUG] Nomor WA untuk ${document_author} tidak terdaftar di database!`);
                }
            } else {
                console.log(`[WA DEBUG] SQL JOIN Gagal! Tidak dapat menemukan user dengan full_name yang persis sama dengan document_author di tabel documents untuk docId ${docId}`);
            }
        });

        res.status(200).json({ message: `Status menjadi ${status}`, file: rejection_assets });
    });
};