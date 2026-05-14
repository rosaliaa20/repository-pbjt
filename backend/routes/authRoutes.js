const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer'); // 🔥 WAJIB ADA UNTUK MENANGKAP FILE EXCEL

// Setup multer khusus untuk membaca file Excel ke dalam memory (buffer)
const uploadMemory = multer({ storage: multer.memoryStorage() });

router.post('/login', authController.login);
router.post('/register', authController.register);

// ========================================================
// === STATIC ROUTES (Tanpa Parameter :id) ===
// WAJIB ditaruh di atas agar "import", "approve", "mass-lock" tidak dianggap sebagai :id
// ========================================================
router.get('/users', authController.getAllUsers);

router.put('/users/mass-lock', authController.massLockByAngkatan);
router.put('/users/approve', authController.approveUsers);

// Rute Import Excel (Menggunakan uploadMemory)
router.post('/users/import', uploadMemory.single('excel_file'), authController.importUsersExcel);

// ========================================================
// === DYNAMIC ROUTES (Pakai Parameter :id) ===
// ========================================================
router.get('/users/:id', authController.getUserById);
router.put('/users/:id/toggle-lock', authController.toggleLockUser);
router.put('/users/:id', authController.updateUser);
router.delete('/users/:id', authController.deleteUser);

// Ganti Sandi oleh User (Butuh Sandi Lama)
router.put('/change-password/:id', authController.changePassword);

module.exports = router;