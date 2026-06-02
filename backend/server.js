const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// ============================================================
// STARTUP VALIDATION: Gagal fast jika secret tidak dikonfigurasi
// ============================================================
if (!process.env.JWT_SECRET) {
    console.warn('⚠️  PERINGATAN: JWT_SECRET tidak ditemukan di .env! Menggunakan fallback — TIDAK AMAN untuk Production!');
}

// ============================================================
// IMPORT MODULES
// ============================================================
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const docRoutes = require('./routes/docRoutes');
const authRoutes = require('./routes/authRoutes');
const systemRoutes = require('./routes/systemRoutes');
const logRoutes = require('./routes/logRoutes');
const notifRoutes = require('./routes/notifRoutes');
const backupController = require('./controllers/backupController');
const { verifyToken, verifyAdmin } = require('./middlewares/auth');

// ============================================================
// INISIALISASI WA BOT (Isolated: tidak crash Express jika gagal)
// ============================================================
try {
    require('./utils/waBot');
} catch (err) {
    console.error('❌ Gagal memuat modul WA Bot:', err.message, '— Server tetap berjalan tanpa bot.');
}

const app = express();

// ============================================================
// MIDDLEWARE GLOBAL
// ============================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Akses publik ke folder uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================================
// ROUTES API
// ============================================================
app.use('/api/documents', docRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/notifications', notifRoutes);

// Rute Backup/Restore (dilindungi admin)
app.get('/api/backup', verifyToken, verifyAdmin, backupController.exportDatabase);
app.post('/api/restore', verifyToken, verifyAdmin, upload.single('database_file'), backupController.restoreDatabase);

// ============================================================
// STATIC FRONTEND (Monolith Production)
// ============================================================
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all: kembalikan React app untuk semua route non-API
app.use((req, res, next) => {
    // Hanya untuk non-API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Endpoint API tidak ditemukan.' } });
    }
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// ============================================================
// GLOBAL ERROR MIDDLEWARE: Tangkap semua error yang tidak ditangani
// ============================================================
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('❌ Unhandled API Error:', err.stack || err.message);
    res.status(err.status || 500).json({
        error: {
            code: err.code || 'INTERNAL_SERVER_ERROR',
            message: err.message || 'Terjadi kesalahan di server. Coba lagi nanti.'
        }
    });
});

// ============================================================
// JALANKAN SERVER
// ============================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server Backend berjalan di port ${PORT}`);
});

// ============================================================
// PROCESS SAFETY: Tangkap exception fatal agar ada trace log
// ============================================================
process.on('uncaughtException', (err) => {
    console.error('🔴 UNCAUGHT EXCEPTION — Server TIDAK crash:', err.stack || err.message);
});

process.on('unhandledRejection', (reason) => {
    console.error('🔴 UNHANDLED PROMISE REJECTION:', reason);
});