const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// 🔥 IMPORT CONTROLLER YANG SUDAH KITA BUAT SEBELUMNYA 🔥
const docController = require('../controllers/docController'); 

// ==========================================
// 1. KONFIGURASI MULTER (PENYIMPANAN FILE)
// ==========================================

// A. Tentukan lokasi dan nama file disimpan (Harus ditulis DULUAN)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Simpan di folder uploads
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// B. Filter Format File (🔥 REVISI: Izinkan PDF dan Gambar 🔥)
const fileFilter = (req, file, cb) => {
  // Cek apakah file berupa PDF ATAU file gambar (jpeg, png, dsb)
  if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung! Hanya izinkan PDF atau Gambar.'), false);
  }
};

// C. Inisialisasi Multer (Harus ditaruh di BAWAH konfigurasi storage & fileFilter)
const upload = multer({ storage: storage, fileFilter: fileFilter });

// ==========================================
// DAFTAR RUTE (Menyambungkan Rute ke Controller)
// ==========================================

// 1. Ambil Semua Dokumen
router.get('/', docController.getAllDocs);

// 2. Upload Dokumen Baru (Pemicu Notif Upload)
router.post('/upload', upload.single('document_file'), docController.uploadDoc);

// 3. Preview PDF (Untuk View PDF di Browser)
router.get('/preview/:id', docController.previewDoc);

// 4. Download Dokumen (Watermark PDF-Lib)
router.get('/download/:id', docController.downloadDoc);

// 5. Ambil Detail 1 Dokumen
router.get('/:id', docController.getDocumentById);

// 6. Tambah Tayangan (View Counter)
router.post('/:id/view', docController.addView);

// 7. 🔥 MENGUBAH STATUS & TERIMA GAMBAR REVISI 🔥
// Sekarang rute status sudah dijaga oleh Multer agar bisa menerima gambar
router.put('/:id/status', upload.single('document_file'), docController.updateStatus);

// 8. Edit / Update Dokumen (Ganti file pakai 'document_file')
router.put('/:id', upload.single('document_file'), docController.updateDoc);

// 9. Hapus Dokumen Permanen (Pemicu Notif Hapus)
router.delete('/:id', docController.deleteDoc);

module.exports = router;