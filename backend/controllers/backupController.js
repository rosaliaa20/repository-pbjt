const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// ============================================================
// CONSTANTS: Semua konfigurasi diambil dari environment variables.
// TIDAK ADA hardcoded paths atau credentials.
// ============================================================
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_NAME = process.env.DB_NAME || 'e_repository_kampus';

// Di Docker: mysqldump tersedia di PATH via image mysql.
// Di lokal (Laragon/XAMPP): override via env MYSQLDUMP_PATH.
const MYSQLDUMP_BIN = process.env.MYSQLDUMP_PATH || 'mysqldump';
const MYSQL_BIN = process.env.MYSQL_PATH || 'mysql';

/**
 * Mengekspor database sebagai file .sql (backup penuh).
 * Kompatibel dengan Docker (network-aware) dan lokal (via env override).
 */
exports.exportDatabase = (req, res) => {
    const date = new Date().toISOString().slice(0, 10);
    const fileName = `Backup_${DB_NAME}_${date}.sql`;

    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    const passArg = DB_PASS ? `-p${DB_PASS}` : '';

    // Perintah mysqldump yang kompatibel dengan Docker (menggunakan DB_HOST untuk koneksi jaringan)
    const command = `${MYSQLDUMP_BIN} -h ${DB_HOST} -u ${DB_USER} ${passArg} ${DB_NAME}`;

    console.log(`🗄️ Memulai backup database [${DB_NAME}] dari host [${DB_HOST}]...`);

    const child = exec(command, { maxBuffer: 50 * 1024 * 1024 }); // 50MB buffer
    const writeStream = fs.createWriteStream(filePath);

    child.stdout.pipe(writeStream);

    let stderrOutput = '';
    child.stderr.on('data', (data) => {
        stderrOutput += data;
    });

    child.on('close', (code) => {
        if (code !== 0) {
            console.error(`❌ Backup Gagal (exit code ${code}):`, stderrOutput);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            return res.status(500).json({
                error: {
                    code: 'BACKUP_FAILED',
                    message: 'Gagal melakukan backup database. Pastikan mysqldump tersedia dan kredensial DB benar.',
                }
            });
        }

        console.log(`✅ Backup database berhasil: ${fileName}`);
        res.download(filePath, `Backup_${DB_NAME}_${date}.sql`, (err) => {
            if (err) console.error('Gagal mengirim file backup:', err.message);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
    });
};

/**
 * Memulihkan database dari file .sql yang di-upload.
 * Kompatibel dengan Docker (network-aware) dan lokal (via env override).
 */
exports.restoreDatabase = (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            error: { code: 'NO_FILE', message: 'File backup (.sql) tidak ditemukan dalam request.' }
        });
    }

    const filePath = req.file.path;
    const passArg = DB_PASS ? `-p${DB_PASS}` : '';

    const command = `${MYSQL_BIN} -h ${DB_HOST} -u ${DB_USER} ${passArg} ${DB_NAME} < "${filePath}"`;

    console.log(`🔄 Memulai restore database [${DB_NAME}] dari host [${DB_HOST}]...`);

    exec(command, (error, stdout, stderr) => {
        // Selalu hapus file sementara setelah diproses
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        if (error) {
            console.error('❌ Restore Gagal:', error.message);
            return res.status(500).json({
                error: {
                    code: 'RESTORE_FAILED',
                    message: 'Gagal memulihkan database.',
                }
            });
        }

        console.log('✅ Database berhasil dipulihkan.');
        res.json({ message: 'Database berhasil dipulihkan ke versi cadangan!' });
    });
};