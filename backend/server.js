const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
require('./utils/waBot');

const multer = require('multer'); // <-- TAMBAHKAN INI
const upload = multer({ dest: 'uploads/' }); // <-- TAMBAHKAN INI
// === IMPORT ROUTES & CONTROLLERS ===
const docRoutes = require('./routes/docRoutes');
const authRoutes = require('./routes/authRoutes'); 
const systemRoutes = require('./routes/systemRoutes');
const logRoutes = require('./routes/logRoutes');
const notifController = require('./controllers/notifController');
const notifRoutes = require('./routes/notifRoutes');

// 🔥 INI YANG KURANG TADI: Import Backup Controller 🔥
const backupController = require('./controllers/backupController');

const app = express();

// === MIDDLEWARE ===
app.use(cors());
app.use(express.json());

// Izinkan akses publik ke folder uploads (cukup ditulis 1 kali saja)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === DAFTARKAN ROUTES ===
app.use('/api/documents', docRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/system', systemRoutes);

// Rute API Notifikasi
app.get('/api/notifications', notifController.getNotifications);
app.put('/api/notifications/read', notifController.markAllAsRead);
app.use('/api/notifications', notifRoutes);

// Rute Backup Database
app.get('/api/backup', backupController.exportDatabase);
app.post('/api/restore', upload.single('database_file'), backupController.restoreDatabase);

// === JALANKAN SERVER ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server Backend berjalan di port ${PORT}`);
});