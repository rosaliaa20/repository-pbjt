const db = require('../config/db');
const bcrypt = require('bcryptjs');
const notifController = require('./notifController');
const xlsx = require('xlsx');

// ========================================================
// FUNGSI BANTUAN: Merekam Jejak Aktivitas ke system_logs
// ========================================================
const logSystemActivity = (type, userName, description, ipAddress) => {
    const sql = "INSERT INTO system_logs (type, user_name, description, ip_address) VALUES (?, ?, ?, ?)";
    db.query(sql, [type, userName, description, ipAddress], (err) => {
        if (err) console.error("❌ Gagal merekam log aktivitas:", err.message);
    });
};

// ========================================================
// 1. FUNGSI LOGIN (Dengan Pengecekan Approval)
// ========================================================
exports.login = (req, res) => {
    const { identifier, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown IP';

    if (!identifier || !password) {
        return res.status(400).json({ message: 'NIM dan Password wajib diisi!' });
    }

    const query = 'SELECT * FROM users WHERE username = ? OR nim = ?';
    
    db.query(query, [identifier, identifier], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Kesalahan Server Database.' });
        if (results.length === 0) return res.status(404).json({ message: 'NIM tidak terdaftar!' });

        const user = results[0];

        // 🔥 CEK STATUS APPROVAL MAHASISWA BARU 🔥
        if (user.approval_status === 'pending') {
            logSystemActivity('login_failed', identifier, 'Mencoba login tapi akun belum di-ACC', ipAddress);
            return res.status(403).json({ message: 'Akun Anda sedang menunggu persetujuan Admin Kampus. Silakan coba lagi nanti.' });
        }
        if (user.approval_status === 'rejected') {
            return res.status(403).json({ message: 'Maaf, pendaftaran akun Anda ditolak oleh Admin.' });
        }

        // Cek status blokir massal / individual
        if (user.is_locked === 1 || user.is_locked === true) {
            return res.status(403).json({ message: 'Akun Anda sedang dikunci. Silakan hubungi Administrator Kampus.' });
        }

        try {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ message: 'Password salah!' });

            logSystemActivity('login_success', user.full_name, 'Login Berhasil', ipAddress);

            res.status(200).json({
                message: 'Login Berhasil',
                user: { id: user.id, name: user.full_name, role: user.role }
            });
        } catch (error) {
            return res.status(500).json({ message: 'Terjadi kesalahan pada sistem keamanan.' });
        }
    });
};

// ========================================================
// 2. FUNGSI REGISTER MANDIRI (Status otomatis 'pending')
// ========================================================
exports.register = async (req, res) => {
    // 🔥 1. TAMBAHKAN tanggal_lahir DI SINI 🔥
    const { name, nim, tanggal_lahir, password, department } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown IP';

    try {
        const checkQuery = 'SELECT * FROM users WHERE username = ? OR nim = ?';
        db.query(checkQuery, [nim, nim], async (err, results) => {
            if (err) return res.status(500).json({ message: 'Kesalahan Server.' });
            if (results.length > 0) return res.status(400).json({ message: 'NIM sudah terdaftar di sistem!' });

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // 🔥 2. TAMBAHKAN KOLOM tanggal_lahir DI QUERY INSERT INI 🔥
            const insertQuery = 'INSERT INTO users (full_name, username, nim, tanggal_lahir, password, role, department, approval_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            
            // 🔥 3. MASUKKAN VARIABEL tanggal_lahir KE DALAM VALUES 🔥
            const values = [name, nim, nim, tanggal_lahir, hashedPassword, 'user', department || null, 'pending'];

            db.query(insertQuery, values, (insertErr) => {
                if (insertErr) {
                    console.error("Error insert:", insertErr);
                    return res.status(500).json({ message: 'Gagal menyimpan akun ke database.' });
                }

                notifController.createNotification("Pendaftar Baru", `Mahasiswa baru mendaftar mandiri: ${name} (${nim}). Menunggu persetujuan.`, "user");
                logSystemActivity('register', name, `Pendaftaran mandiri (Pending): ${nim}`, ipAddress);

                res.status(201).json({ message: 'Pendaftaran berhasil dikirim! Silakan tunggu persetujuan dari Admin.' });
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan sistem saat memproses pendaftaran.' });
    }
};

// ========================================================
// 3. MENGAMBIL SEMUA DATA PENGGUNA
// ========================================================
exports.getAllUsers = (req, res) => {
    // 🔥 TAMBAHKAN approval_status DI SINI 🔥
    const query = 'SELECT id, full_name AS name, username AS email, username AS nim_nidn, role, is_locked, approval_status, created_at FROM users ORDER BY id DESC';

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
        res.status(200).json(results);
    });
};

// ========================================================
// 🔥 3.5 MENGAMBIL 1 DATA PENGGUNA BERDASARKAN ID 🔥
// ========================================================
exports.getUserById = (req, res) => {
    const userId = req.params.id;
    // Ambil field yang relevan untuk form edit
    const sql = "SELECT id, full_name AS name, username AS email, role FROM users WHERE id = ?";
    
    db.query(sql, [userId], (err, result) => {
      if (err) {
        console.error("❌ Error Database (Get By ID):", err);
        return res.status(500).json({ message: "Terjadi kesalahan server saat mengambil data pengguna." });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "Pengguna tidak ditemukan." });
      }
      
      res.status(200).json(result[0]); 
    });
};

// ========================================================
// 4. MENGUNCI / MEMBUKA KUNCI AKUN INDIVIDUAL
// ========================================================
exports.toggleLockUser = (req, res) => {
    const userId = req.params.id;
    const { is_locked } = req.body;
    
    const query = 'UPDATE users SET is_locked = ? WHERE id = ?';
    
    db.query(query, [is_locked, userId], (err, result) => {
        if (err) {
            console.error('❌ Error update status lock:', err);
            return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
        }
        res.status(200).json({ message: 'Status keamanan akun berhasil diperbarui.' });
    });
};

// ========================================================
// 5. KUNCI / BUKA MASSAL BERDASARKAN ANGKATAN
// ========================================================
exports.massLockByAngkatan = (req, res) => {
    const { is_locked, angkatan } = req.body; 
    
    const angkatanPrefix = angkatan + '%'; 
    const sql = "UPDATE users SET is_locked = ? WHERE username LIKE ? AND role = 'user'";
    
    db.query(sql, [is_locked, angkatanPrefix], (err, result) => {
        if (err) {
            console.error("❌ Gagal update massal:", err);
            return res.status(500).json({ message: "Gagal memproses aksi massal." });
        }
        res.status(200).json({ 
            message: `Berhasil mengubah status ${result.affectedRows} akun mahasiswa angkatan 20${angkatan}.` 
        });
    });
};

// ========================================================
// 6. MENGHAPUS PENGGUNA
// ========================================================
exports.deleteUser = (req, res) => {
    const userId = req.params.id;
    const query = 'DELETE FROM users WHERE id = ?';

    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error('❌ Error hapus pengguna:', err);
            return res.status(500).json({ message: 'Gagal menghapus data dari server.' });
        }
        res.status(200).json({ message: 'Pengguna berhasil dihapus.' });
    });
};

// ========================================================
// 🔥 7. UPDATE PENGGUNA (RESET PASSWORD & PROFIL) 🔥
// ========================================================
exports.updateUser = async (req, res) => {
    const userId = req.params.id;
    const { password, username, email, role } = req.body; 

    // KASUS 1: Jika request berisi password (Reset Sandi)
    if (password) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const query = 'UPDATE users SET password = ? WHERE id = ?';
            
            db.query(query, [hashedPassword, userId], (err, result) => {
                if (err) {
                    console.error('❌ Error reset sandi:', err.message);
                    return res.status(500).json({ message: 'Kesalahan database saat mereset sandi.' });
                }
                return res.status(200).json({ message: 'Sandi pengguna berhasil direset!' });
            });
        } catch (error) {
            console.error('❌ Error Bcrypt saat reset:', error.message);
            return res.status(500).json({ message: 'Gagal memproses enkripsi sandi baru.' });
        }
    } 
    // KASUS 2: Jika request mengubah profil (Nama, Email, Role)
    else if (username || email || role) {
        // Kita petakan username ke full_name sesuai struktur database mu
        const query = 'UPDATE users SET full_name = ?, username = ?, role = ? WHERE id = ?';
        db.query(query, [username, email, role, userId], (err, result) => {
            if (err) {
                console.error('❌ Error update profil:', err.message);
                return res.status(500).json({ message: 'Gagal memperbarui profil pengguna.' });
            }
            return res.status(200).json({ message: 'Profil pengguna berhasil diperbarui!' });
        });
    } else {
        return res.status(400).json({ message: 'Data update tidak valid.' });
    }
};

// ========================================================
// 8. GANTI PASSWORD (OLEH USER SENDIRI)
// ========================================================
exports.changePassword = async (req, res) => {
    const userId = req.params.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Sandi lama dan sandi baru wajib diisi!' });
    }

    try {
        const checkQuery = 'SELECT * FROM users WHERE id = ?';
        db.query(checkQuery, [userId], async (err, results) => {
            if (err) {
                console.error('❌ Error Database:', err.message);
                return res.status(500).json({ message: 'Kesalahan server saat mencari data pengguna.' });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
            }

            const user = results[0];

            const isMatch = await bcrypt.compare(oldPassword, user.password);
            
            if (!isMatch) {
                return res.status(401).json({ message: 'Sandi lama yang Anda masukkan salah!' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);

            const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
            db.query(updateQuery, [hashedNewPassword, userId], (updateErr) => {
                if (updateErr) {
                    console.error('❌ Error Update Sandi:', updateErr.message);
                    return res.status(500).json({ message: 'Gagal memperbarui kata sandi.' });
                }

                logSystemActivity('change_password', user.full_name, 'Pengguna mengubah kata sandinya sendiri', req.ip || 'Unknown IP');

                return res.status(200).json({ message: 'Kata sandi berhasil diperbarui!' });
            });
        });
    } catch (error) {
        console.error('❌ Error Bcrypt (Change Password):', error.message);
        return res.status(500).json({ message: 'Terjadi kesalahan sistem keamanan.' });
    }
};

// ========================================================
// 9. IMPORT MAHASISWA DARI EXCEL (Skenario GoFeeder)
// ========================================================
exports.importUsersExcel = async (req, res) => {
    try {
        // Cek apakah ada file yang diunggah
        if (!req.file) {
            return res.status(400).json({ message: 'File Excel tidak ditemukan!' });
        }

        // Membaca file Excel dari buffer memory (tanpa menyimpannya ke folder)
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0]; // Ambil sheet pertama
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        let successCount = 0;
        let failedList = []; // 🔥 MENGGANTI errorCount DENGAN ARRAY DAFTAR GAGAL 🔥

        // Looping setiap baris data di Excel
        for (const row of data) {
            // Ambil data dari baris Excel
            const { nama, nim, tanggal_lahir, prodi } = row;

            if (!nama || !nim || !tanggal_lahir) {
                failedList.push(`Data Kosong: ${nama || 'Tanpa Nama'} - ${nim || 'Tanpa NIM'}`);
                continue;
            }

            // 🔥 TAMBAHAN KECIL: Paksa NIM jadi Teks (String) biar titiknya tidak hilang 🔥
            const nimStr = String(nim).trim();
            const passwordStr = String(tanggal_lahir).replace(/[-/]/g, '');
            
            try {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(passwordStr, salt);

                const sql = `
                    INSERT IGNORE INTO users 
                    (full_name, username, nim, password, tanggal_lahir, department, role, approval_status) 
                    VALUES (?, ?, ?, ?, ?, ?, 'user', 'approved')
                `;
                
                await new Promise((resolve, reject) => {
                    // Pakai nimStr yang sudah aman
                    db.query(sql, [nama, nimStr, nimStr, hashedPassword, tanggal_lahir, prodi], (err, result) => {
                        // ... (lanjutannya sama seperti sebelumnya)
                        if (err) reject(err);
                        // affectedRows = 0 berarti duplikat (NIM sudah ada)
                        else if (result.affectedRows === 0) reject(new Error('Duplikat')); 
                        else resolve(result);
                    });
                });
                
                successCount++;
            } catch (e) {
                // Dorong data yang gagal ke dalam array
                if (e.message === 'Duplikat') {
                    failedList.push(`NIM ${nimStr} (${nama}) - Sudah Terdaftar`);
                } else {
                    failedList.push(`NIM ${nimStr} (${nama}) - Gagal Sistem`);
                }
            }
        }

        // Catat aktivitas admin
        const ipAddress = req.ip || req.connection.remoteAddress;
        logSystemActivity('import_excel', 'Administrator', `Mengimport ${successCount} mahasiswa baru via Excel`, ipAddress);

        // 🔥 KIRIM RESPON KE REACT BESERTA DAFTAR GAGAL 🔥
        return res.status(200).json({ 
            message: `Import selesai! Berhasil: ${successCount} akun, Gagal/Duplikat: ${failedList.length} baris.`,
            failedData: failedList 
        });

    } catch (error) {
        console.error('❌ Error Import Excel:', error.message);
        return res.status(500).json({ message: 'Terjadi kesalahan sistem saat membaca file Excel.' });
    }
};

// ========================================================
// 10. APPROVAL MASSAL MAHASISWA
// ========================================================
exports.approveUsers = (req, res) => {
    const { ids } = req.body; // Menerima array ID, misal: [4, 5, 6]

    if (!ids || ids.length === 0) {
        return res.status(400).json({ message: "Tidak ada pengguna yang dipilih." });
    }

    const sql = "UPDATE users SET approval_status = 'approved' WHERE id IN (?)";
    db.query(sql, [ids], (err, result) => {
        if (err) {
            console.error("❌ Gagal menyetujui pengguna:", err);
            return res.status(500).json({ message: "Gagal memproses persetujuan." });
        }
        res.status(200).json({ message: `${result.affectedRows} mahasiswa berhasil disetujui dan kini bisa login!` });
    });
};