const db = require('../config/db');
const bcrypt = require('bcryptjs');
const notifController = require('./notifController');
const xlsx = require('xlsx');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); 

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

        // CEK STATUS APPROVAL MAHASISWA BARU
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
                user: { 
                    id: user.id, 
                    name: user.full_name, 
                    role: user.role, 
                    department: user.department
                }
            });
        } catch (error) {
            return res.status(500).json({ message: 'Terjadi kesalahan pada sistem keamanan.' });
        }
    });
};

// ========================================================
// 2. FUNGSI REGISTER MANDIRI (Dengan Email & WA)
// ========================================================
exports.register = async (req, res) => {
    // 🔥 PERBAIKAN: Menangkap no_wa dari request body 🔥
    const { name, nim, email, no_wa, tanggal_lahir, password, department } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown IP';

    if (!name || !nim || !email || !password || !tanggal_lahir) {
        return res.status(400).json({ message: 'Semua kolom wajib diisi!' });
    }

    try {
        const checkQuery = 'SELECT * FROM users WHERE username = ? OR nim = ? OR email = ?';
        db.query(checkQuery, [nim, nim, email], async (err, results) => {
            if (err) return res.status(500).json({ message: 'Kesalahan Server.' });
            if (results.length > 0) {
                const existingUser = results[0];
                if (existingUser.email === email) {
                    return res.status(400).json({ message: 'Email sudah terdaftar di sistem!' });
                }
                return res.status(400).json({ message: 'NIM sudah terdaftar di sistem!' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // 🔥 PERBAIKAN: Menambahkan no_wa ke dalam query INSERT 🔥
            const insertQuery = 'INSERT INTO users (full_name, username, nim, email, no_wa, tanggal_lahir, password, role, department, approval_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const finalNoWa = no_wa ? no_wa : null; // Jika WA dikosongkan, jadikan null
            const values = [name, nim, nim, email, finalNoWa, tanggal_lahir, hashedPassword, 'user', department || null, 'pending'];

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
    // 🔥 PERBAIKAN: Menambahkan pemanggilan kolom no_wa untuk tabel Admin 🔥
    const query = 'SELECT id, full_name AS name, email, no_wa, username, nim AS nim_nidn, role, is_locked, approval_status, created_at FROM users ORDER BY id DESC';

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
        res.status(200).json(results);
    });
};

// ========================================================
// 3.5 MENGAMBIL 1 DATA PENGGUNA BERDASARKAN ID
// ========================================================
exports.getUserById = (req, res) => {
    const userId = req.params.id;
    // 🔥 PERBAIKAN: Menambahkan pemanggilan kolom no_wa agar form edit otomatis terisi 🔥
    const sql = "SELECT id, full_name AS name, nim, username, email, no_wa, role, department FROM users WHERE id = ?";
    
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
    
    if (req.user && req.user.id === parseInt(userId)) {
        return res.status(403).json({ message: "Anda tidak dapat mengunci akun Anda sendiri!" });
    }
    
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
    
    if (req.user && req.user.id === parseInt(userId)) {
        return res.status(403).json({ message: "Sistem menolak! Anda tidak dapat menghapus akun Anda sendiri." });
    }

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
    
    // 🔥 PERBAIKAN: Menangkap variabel no_wa dari form frontend 🔥
    const { password, name, nim, email, no_wa, role, department } = req.body;

    // 1. Jika request berisi password (Reset Sandi dari Admin)
    if (password) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const query = 'UPDATE users SET password = ? WHERE id = ?';
            
            db.query(query, [hashedPassword, userId], (err, result) => {
                if (err) return res.status(500).json({ message: 'Kesalahan database saat mereset sandi.' });
                return res.status(200).json({ message: 'Sandi pengguna berhasil direset!' });
            });
        } catch (error) {
            return res.status(500).json({ message: 'Gagal memproses enkripsi sandi baru.' });
        }
    } 
    // 2. Jika Update Profil (Nama, Email, WA, Department, dll)
    else if (name) {
        // Langkah A: Ambil nama lama dari database untuk dicari di tabel documents
        db.query('SELECT full_name FROM users WHERE id = ?', [userId], (err, results) => {
            if (err || results.length === 0) return res.status(500).json({ message: 'User tidak ditemukan.' });
            
            const oldName = results[0].full_name; // Nama lama
            const finalEmail = email ? email : null;
            const finalNoWa = no_wa ? no_wa : null; // 🔥 Cegah string kosong merusak DB 🔥

            // Langkah B: Update di tabel users (Sekarang Memasukkan no_wa)
            const queryUser = 'UPDATE users SET full_name = ?, nim = ?, username = ?, email = ?, no_wa = ?, role = ?, department = ? WHERE id = ?';
            db.query(queryUser, [name, nim, nim, finalEmail, finalNoWa, role, department, userId], (err) => {
                if (err) {
                    console.error("Error Update User:", err);
                    return res.status(500).json({ message: 'Gagal update profil.' });
                }

                // Langkah C: SINKRONISASI - Update semua dokumen milik user ini
                const queryDoc = 'UPDATE documents SET document_author = ? WHERE document_author = ?';
                db.query(queryDoc, [name, oldName], (syncErr) => {
                    if (syncErr) console.error("Gagal sinkron nama di dokumen:", syncErr);
                    
                    return res.status(200).json({ message: 'Profil dan data dokumen berhasil diperbarui!' });
                });
            });
        });
    } else {
        return res.status(400).json({ message: 'Data yang dikirim kosong.' });
    }
};

// ========================================================
// 8. GANTI PASSWORD (OLEH USER SENDIRI DI PROFIL)
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
// 9. IMPORT MAHASISWA DARI EXCEL (Skenario GoFeeder + WA)
// ========================================================
exports.importUsersExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'File Excel tidak ditemukan!' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0]; 
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        let successCount = 0;
        let failedList = []; 

        for (const row of data) {
            // 🔥 PERBAIKAN: Tangkap juga kolom 'no_wa' dari baris Excel 🔥
            const { nama, nim, email, no_wa, tanggal_lahir, prodi } = row;

            if (!nama || !nim || !tanggal_lahir) {
                failedList.push(`Data Kosong: ${nama || 'Tanpa Nama'} - ${nim || 'Tanpa NIM'}`);
                continue;
            }

            const nimStr = String(nim).trim();
            const passwordStr = String(tanggal_lahir).replace(/[-/]/g, '');
            const emailStr = email ? String(email).trim() : null; 
            const noWaStr = no_wa ? String(no_wa).trim() : null; // 🔥 Ambil nomor WA jika ada 🔥
            
            try {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(passwordStr, salt);

                // 🔥 PERBAIKAN: Masukkan kolom no_wa ke dalam query INSERT 🔥
                const sql = `
                    INSERT IGNORE INTO users 
                    (full_name, username, nim, email, no_wa, password, tanggal_lahir, department, role, approval_status) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'user', 'approved')
                `;
                
                await new Promise((resolve, reject) => {
                    db.query(sql, [nama, nimStr, nimStr, emailStr, noWaStr, hashedPassword, tanggal_lahir, prodi], (err, result) => {
                        if (err) reject(err);
                        else if (result.affectedRows === 0) reject(new Error('Duplikat')); 
                        else resolve(result);
                    });
                });
                
                successCount++;
            } catch (e) {
                if (e.message === 'Duplikat') {
                    failedList.push(`NIM ${nimStr} (${nama}) - Sudah Terdaftar`);
                } else {
                    failedList.push(`NIM ${nimStr} (${nama}) - Gagal Sistem`);
                }
            }
        }

        const ipAddress = req.ip || req.connection.remoteAddress;
        logSystemActivity('import_excel', 'Administrator', `Mengimport ${successCount} mahasiswa baru via Excel`, ipAddress);

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
    const { ids } = req.body; 

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

// ========================================================
// 11. LUPA PASSWORD (KIRIM EMAIL)
// ========================================================
exports.forgotPassword = (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email wajib diisi!" });

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: "Kesalahan server" });
        if (results.length === 0) return res.status(404).json({ message: "Email tidak terdaftar di sistem." });

        const user = results[0];

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 15 * 60 * 1000); 

        db.query('UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?', 
        [resetToken, resetExpires, user.id], 
        (updateErr) => {
            if (updateErr) return res.status(500).json({ message: "Gagal memproses token." });

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'rosaliaindah236@gmail.com',
                    pass: 'aqii fgcq ykxq xytw' 
                }
            });

            const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

            const mailOptions = {
                from: '"E-Repository PBJT" <no-reply@poltekbaja.ac.id>',
                to: user.email,
                subject: 'Pemulihan Kata Sandi Akun Anda',
                html: `
                <div style="background-color: #f4f4f5; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                        
                        <div style="background-color: #0f172a; padding: 30px 20px; text-align: center; border-bottom: 4px solid #facc15;">
                            <img src="https://i.ibb.co/SDcz0WZK/poltek-baja-tegal-logo.png" alt="Logo" style="width: 55px; height: auto; margin-bottom: 12px; display: inline-block;" />
                            
                            <h2 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 1px;">E-Repository <span style="color: #facc15;">PBJT</span></h2>
                            <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 13px;">Politeknik Baja Tegal</p>
                        </div>

                        <div style="padding: 30px 30px 20px 30px; color: #334155;">
                            <h3 style="margin-top: 0; color: #1e293b;">Halo, ${user.full_name}</h3>
                            <p style="font-size: 14px; line-height: 1.6;">Permintaan untuk mengatur ulang kata sandi akun <strong>E-Repository</strong> Anda telah dibuat. Silakan klik tombol di bawah ini untuk melanjutkan proses:</p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 2px 4px rgba(37,99,235,0.3);">Atur Ulang Kata Sandi</a>
                            </div>

                            <p style="font-size: 13px; color: #64748b; line-height: 1.6; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                                Apabila tombol di atas tidak berfungsi, silakan salin (copy) dan tempel URL di bawah ini ke browser Anda:<br>
                                <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
                            </p>
                        </div>

                        <div style="background-color: #f8fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 10px 0; font-size: 12px; color: #dc2626; font-weight: bold;">
                                Jika Anda tidak meminta permintaan ini, abaikan email ini. Tautan hanya berlaku 15 menit.
                            </p>
                            <p style="margin: 0; font-size: 11px; color: #94a3b8; text-align: center; padding-top: 10px;">
                                &copy; 2026 Politeknik Baja Tegal.<br>Ini adalah email otomatis, mohon tidak membalas email ini.
                            </p>
                        </div>

                    </div>
                </div>
                `
            };

            transporter.sendMail(mailOptions, (mailErr) => {
                if (mailErr) {
                    console.error("Gagal kirim email:", mailErr);
                    return res.status(500).json({ message: "Gagal mengirim email." });
                }
                res.status(200).json({ message: "Link pemulihan telah dikirim ke email Anda!" });
            });
        });
    });
};

// ========================================================
// 12. RESET PASSWORD (SIMPAN SANDI BARU)
// ========================================================
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    const query = 'SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()';
    
    db.query(query, [token], async (err, results) => {
        if (err) return res.status(500).json({ message: "Kesalahan server" });
        if (results.length === 0) return res.status(400).json({ message: "Link pemulihan tidak valid atau sudah kadaluarsa!" });

        const user = results[0];

        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            const updateQuery = 'UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?';
            db.query(updateQuery, [hashedPassword, user.id], (updateErr) => {
                if (updateErr) return res.status(500).json({ message: "Gagal memperbarui sandi." });
                
                logSystemActivity('reset_password', user.full_name, 'Reset sandi berhasil via Email', req.ip || 'Unknown IP');
                res.status(200).json({ message: "Kata sandi berhasil direset! Silakan login." });
            });
        } catch (hashErr) {
            res.status(500).json({ message: "Terjadi kesalahan keamanan sistem." });
        }
    });
};