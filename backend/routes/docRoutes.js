const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const docController = require('../controllers/docController'); 
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

// 1. Konfigurasi Multer & Keamanan File Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
  }
});

const fileFilter = (req, file, cb) => {
  // Hanya izinkan file PDF untuk mencegah upload script berbahaya (XSS/RCE)
  if (file.mimetype === 'application/pdf' && path.extname(file.originalname).toLowerCase() === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung! Hanya diperbolehkan upload file PDF.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB
});

// 2. Daftar Rute (Gunakan Inline Handler untuk menangkap error)

// Rute GET / Public
router.get('/', docController.getAllDocs);
router.get('/:id', docController.getDocumentById);
router.get('/preview/:id', docController.previewDoc);
router.get('/preview/:id/:filename', docController.previewDoc);
router.get('/download/:id', docController.downloadDoc);
router.get('/download/original/:id', verifyToken, verifyAdmin, docController.downloadOriginalDoc); // VIP Route
router.post('/:id/view', docController.addView);
router.delete('/:id', verifyToken, verifyAdmin, docController.deleteDoc);

// Rute POST / PUT dengan Error Handling Langsung
router.post('/upload', verifyToken, (req, res) => {
  upload.single('document_file')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    docController.uploadDoc(req, res);
  });
});

router.put('/:id/status', verifyToken, verifyAdmin, (req, res) => {
  upload.single('document_file')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    docController.updateStatus(req, res);
  });
});

router.put('/:id', verifyToken, verifyAdmin, (req, res) => {
  upload.single('document_file')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    docController.updateDoc(req, res);
  });
});

module.exports = router;