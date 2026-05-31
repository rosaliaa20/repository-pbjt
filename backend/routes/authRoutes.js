const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer'); // 🔥 WAJIB ADA UNTUK MENANGKAP FILE EXCEL
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

// Setup multer khusus untuk membaca file Excel ke dalam memory (buffer)
const uploadMemory = multer({ storage: multer.memoryStorage() });

router.post('/login', authController.login);
router.post('/register', authController.register);

// ========================================================
// === STATIC ROUTES (Tanpa Parameter :id) ===
// WAJIB ditaruh di atas agar "import", "approve", "mass-lock" tidak dianggap sebagai :id
// ========================================================
router.get('/users', verifyToken, verifyAdmin, authController.getAllUsers);

router.put('/users/mass-lock', verifyToken, verifyAdmin, authController.massLockByAngkatan);
router.put('/users/approve', verifyToken, verifyAdmin, authController.approveUsers);

// Rute Import Excel (Menggunakan uploadMemory)
router.post('/users/import', verifyToken, verifyAdmin, uploadMemory.single('excel_file'), authController.importUsersExcel);

// ========================================================
// === DYNAMIC ROUTES (Pakai Parameter :id) ===
// ========================================================
router.get('/users/:id', verifyToken, authController.getUserById);
router.put('/users/:id/toggle-lock', verifyToken, verifyAdmin, authController.toggleLockUser);
router.put('/users/:id', verifyToken, verifyAdmin, authController.updateUser);
router.delete('/users/:id', verifyToken, verifyAdmin, authController.deleteUser);

// Ganti Sandi oleh User (Butuh Sandi Lama)
router.put('/change-password/:id', verifyToken, authController.changePassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;