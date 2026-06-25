Tentu saja **SANGAT BISA**! Justru aplikasi yang bagus adalah aplikasi yang bisa menyesuaikan dengan file *default* dari kampus, sehingga kamu tidak perlu repot *copy-paste* ke template baru setiap kali mau mengimpor data.

Tantangan terbesarnya dari file kampusmu adalah kolom **"Tempat, Tanggal Lahir"**. Isinya gabungan kota dan menggunakan nama bulan bahasa Indonesia (Contoh: `"Brebes, 2000 April 11"`). Bahkan di baris ke-30 ada data yang sangat berantakan: `"Tegal, 08-september-2005, 2005 September 09"`.

Tapi tenang, aku sudah membuatkan **"Sistem Pembaca Pintar" (Regex & Dictionary)** di dalam kode ini. Sistem akan otomatis mendeteksi angka tahun (`2000`), menerjemahkan nama bulan menjadi angka (`April` = `04`), dan mengambil tanggalnya (`11`), lalu menggabungkannya menjadi password **`20000411`** sesuai keinginanmu.

Silakan *copy* dan timpa fungsi `importUsersExcel` kamu dengan kode pamungkas ini:

```javascript
// ========================================================
// 9. IMPORT MAHASISWA DARI EXCEL (Format Asli Kampus PBJT)
// ========================================================
exports.importUsersExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'File Excel tidak ditemukan!' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0]; 
        
        // Melewati Kop Surat (mulai dari baris ke-22 sebagai header)
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { range: 21 });

        let successCount = 0;
        let failedList = []; 

        // Kamus penerjemah bulan Indonesia ke Angka
        const bulanMap = {
            'januari': '01', 'februari': '02', 'maret': '03', 'april': '04',
            'mei': '05', 'juni': '06', 'juli': '07', 'agustus': '08',
            'september': '09', 'oktober': '10', 'november': '11', 'desember': '12'
        };

        for (const row of data) {
            if (!row['Nama'] || !row['NIM']) {
                continue; // Abaikan baris kosong
            }

            const nama = String(row['Nama']).trim();
            const nimStr = String(row['NIM']).trim();
            const emailStr = row['Email'] ? String(row['Email']).trim() : null; 
            const noWaStr = row['Telepon'] ? String(row['Telepon']).trim() : null; 
            const prodi = row['Program Studi'] || 'Umum';
            
            // Default password adalah NIM (Sebagai jaring pengaman jika format tanggal sangat hancur)
            let passwordStr = nimStr; 
            let mysqlDate = null;     

            // LOGIKA PINTAR: Mengekstrak Tempat, Tanggal Lahir (Misal: "Brebes, 2000 April 11")
            if (row['Tempat, Tanggal Lahir']) {
                const rawTTL = String(row['Tempat, Tanggal Lahir']).toLowerCase();
                
                // Mencari pola: 4 angka (tahun) + spasi + kata (bulan) + angka (tanggal)
                const match = rawTTL.match(/(\d{4})\s+([a-z]+)\s+(\d{1,2})/);
                
                if (match) {
                    const yyyy = match[1];
                    const namaBulan = match[2];
                    const dd = match[3].padStart(2, '0'); // Tambahkan '0' di depan jika tanggal 1 digit
                    
                    const mm = bulanMap[namaBulan]; // Terjemahkan "april" jadi "04"
                    
                    if (mm) {
                        passwordStr = yyyy + mm + dd; // Hasil: 20000411 (Untuk Password)
                        mysqlDate = `${yyyy}-${mm}-${dd}`; // Hasil: 2000-04-11 (Untuk disimpan di DB)
                    }
                }
            }
            
            try {
                // Enkripsi password hasil racikan di atas
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(passwordStr, salt);

                const sql = `
                    INSERT IGNORE INTO users 
                    (full_name, username, nim, email, no_wa, password, tanggal_lahir, department, role, approval_status) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'user', 'approved')
                `;
                
                await new Promise((resolve, reject) => {
                    db.query(sql, [nama, nimStr, nimStr, emailStr, noWaStr, hashedPassword, mysqlDate, prodi], (err, result) => {
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

        // const ipAddress = req.ip || req.connection.remoteAddress;
        // logSystemActivity('import_excel', 'Administrator', `Mengimport ${successCount} mhs dari Excel Kampus`, ipAddress);

        return res.status(200).json({ 
            message: `Import selesai! Berhasil: ${successCount} akun, Gagal/Duplikat: ${failedList.length} baris.`,
            failedData: failedList 
        });

    } catch (error) {
        console.error('❌ Error Import Excel:', error.message);
        return res.status(500).json({ message: 'Terjadi kesalahan sistem saat membaca file Excel.' });
    }
};

```

**Kenapa kode ini sangat aman?**
Jika seandainya ada staf kampus yang mengetik tanggal lahir dengan format yang benar-benar tidak masuk akal di Excel, kode ini **tidak akan membuat servermu *error***. Sistem akan otomatis menjadikan **NIM** mahasiswa tersebut sebagai password *default*-nya, sehingga proses import tetap berjalan 100% sampai baris terakhir.

Kamu tinggal *push* ulang kodenya, dan langsung pakai file mentahan dari kampus tersebut! 😎🚀