const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

exports.exportDatabase = (req, res) => {
    // Nama database kamu
    const dbName = 'e_repository_kampus'; 
    const date = new Date().toISOString().slice(0,10);
    const fileName = `Backup_${dbName}_${date}.sql`;
    
    // Pastikan folder uploads ada untuk menampung file sementara
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }
    
    const filePath = path.join(uploadDir, fileName);

    // 🔥 JALUR LARAGON KAMU 🔥
    // Kita gunakan tanda kutip ganda dan double backslash agar Windows tidak bingung
    const mysqldumpPath = '"C:\\laragon\\bin\\mysql\\mysql-8.0.30-winx64\\bin\\mysqldump.exe"';

    // Perintah eksekusi
    const command = `${mysqldumpPath} -u root ${dbName} > "${filePath}"`;

    console.log("Memulai backup dengan perintah:", command);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error("❌ Backup Laragon Gagal:", error.message);
            return res.status(500).json({ 
                message: "Gagal melakukan backup database.",
                error: error.message 
            });
        }
        
        // Kirim file ke browser
        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error("Gagal mengirim file:", err);
            }
            // Hapus file sementara setelah didownload
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });
    });

    
};

exports.restoreDatabase = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "File backup (.sql) tidak ditemukan." });
    }

    const dbName = 'e_repository_kampus';
    const filePath = req.file.path; // Path file yang baru saja di-upload oleh Multer

    // Jalur ke program mysql.exe di Laragon kamu (sama dengan mysqldump, tapi ini mysql.exe)
    const mysqlPath = '"C:\\laragon\\bin\\mysql\\mysql-8.0.30-winx64\\bin\\mysql.exe"';
    
    // Perintah eksekusi restore (perhatikan tanda kurung sudut < )
    const command = `${mysqlPath} -u root ${dbName} < "${filePath}"`;

    console.log("Memulai restore dengan perintah:", command);

    exec(command, (error, stdout, stderr) => {
        // Hapus file .sql sementara dari folder uploads agar tidak menumpuk
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        if (error) {
            console.error("❌ Restore Gagal:", error.message);
            return res.status(500).json({ message: "Gagal memulihkan database.", error: error.message });
        }
        
        res.json({ message: "Database berhasil dipulihkan ke versi cadangan!" });
    });
 };   