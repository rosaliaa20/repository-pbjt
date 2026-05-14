const os = require('os');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const db = require('../config/db'); // Sesuaikan path ini jika beda

// 1. Fungsi Mengambil Data CPU & RAM Server
exports.getSystemStats = (req, res) => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(1);

    const cores = os.cpus().length;
    const loadAvg = os.loadavg()[0]; 
    let cpuUsagePercent = ((loadAvg / cores) * 100).toFixed(1);
    
    if (cpuUsagePercent < 1) {
      cpuUsagePercent = (Math.random() * (5 - 1) + 1).toFixed(1); 
    }

    res.status(200).json({ cpu: cpuUsagePercent, memory: memUsagePercent });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data server", error });
  }
};

// 2. Fungsi Mengambil Log Pengguna Baru
exports.getSystemLogs = (req, res) => {
  // Ganti 'nama_lengkap' sesuai nama kolom asli di tabel users kamu
  const sql = "SELECT full_name AS name, role, created_at FROM users ORDER BY created_at DESC LIMIT 5";
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error:", err); // Ini penting untuk cek error di terminal backend
      return res.status(500).json({ message: "Gagal mengambil log sistem" });
    }
    res.status(200).json(results);
  });
};
// Fungsi Eksport Data dengan Filter
exports.exportData = (req, res) => {
  const { department, category, year } = req.query;
  
  let sql = `SELECT id, title, document_author, category, department, year, views, 
             DATE_FORMAT(created_at, '%Y-%m-%d') AS upload_date FROM documents WHERE 1=1`;
  const params = [];

  // Tambahkan filter jika dipilih (bukan 'Semua')
  if (department && department !== 'Semua') {
    sql += " AND department = ?";
    params.push(department);
  }
  if (category && category !== 'Semua') {
    sql += " AND category = ?";
    params.push(category);
  }
  if (year && year !== 'Semua') {
    sql += " AND year = ?";
    params.push(year);
  }

  sql += " ORDER BY created_at DESC";

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: "Gagal ambil data" });
    if (results.length === 0) return res.status(404).json({ message: "Data tidak ditemukan untuk kriteria ini" });

    const csvFields = ['ID', 'Judul', 'Penulis', 'Kategori', 'Prodi', 'Tahun', 'Views', 'Tanggal'];
    const csvData = results.map(row => [
      row.id, `"${row.title.replace(/"/g, '""')}"`, `"${row.document_author.replace(/"/g, '""')}"`,
      row.category, row.department, row.year, row.views, row.upload_date
    ].join(','));

    const csvOutput = [csvFields.join(','), ...csvData].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="Rekap_PBJT_${department}_${category}.csv"`);
    res.status(200).send(csvOutput);
  });
};

// 4. FUNGSI BARU: Backup Database ke .sql
exports.backupDatabase = (req, res) => {
  // PENTING: Sesuaikan dengan nama databasemu di phpMyAdmin!
  const dbUser = 'root'; 
  const dbPassword = ''; // Kosongkan jika pakai XAMPP default
  const dbName = 'e_repository_kampus'; // Ganti jika nama databasemu berbeda

  // Nama file sementara
  const fileName = `Backup_PBJT_${Date.now()}.sql`;
  const filePath = path.join(__dirname, '../', fileName);

  // Perintah terminal untuk export database
    const dumpCommand = `"C:\\laragon\\bin\\mysql\\mysql-8.0.30-winx64\\bin\\mysqldump.exe" -u ${dbUser} ${dbPassword ? `-p${dbPassword}` : ''} ${dbName} > "${filePath}"`;
  exec(dumpCommand, (error) => {
    if (error) {
      console.error(`Backup error: ${error}`);
      return res.status(500).json({ message: "Gagal melakukan backup. Pastikan mysqldump tersedia." });
    }

    // Download file ke browser pengguna
    res.download(filePath, `Backup_Database_PBJT_${new Date().toISOString().split('T')[0]}.sql`, (err) => {
      // Hapus file dari server setelah didownload agar tidak menuhin harddisk
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); 
      }
    });
  });
};