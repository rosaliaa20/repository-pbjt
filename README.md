# 🎓 E-Repository Politeknik Baja Tegal (PBJT)

Sistem Informasi Repositori Institusi berbasis web yang dirancang untuk mengelola, menyimpan, dan mempublikasikan karya ilmiah serta dokumen akademik secara digital, terstruktur, dan aman.

Aplikasi ini dikembangkan untuk membantu proses digitalisasi dokumen kampus agar lebih modern, efisien, dan mudah diakses oleh civitas akademika Politeknik Baja Tegal.

---

## ✨ Fitur Utama

Aplikasi dirancang dengan antarmuka modern dan dilengkapi berbagai fitur pengelolaan, keamanan dokumen digital, hingga dukungan *Progressive Web App* (PWA).

### 📱 Progressive Web App (PWA) Ready
Aplikasi dapat diinstal langsung ke layar utama perangkat (Desktop/Mobile) layaknya aplikasi *native*. Dilengkapi dengan *Service Worker* untuk memberikan performa *loading* yang super cepat dan dukungan *caching* pintar.

### 💬 Notifikasi WhatsApp Otomatis (Bot)
Terintegrasi dengan bot WhatsApp untuk mengirimkan pembaruan status secara *real-time* dan personal kepada mahasiswa.
- Notifikasi saat karya ilmiah **Disetujui/Terbit**.
- Notifikasi saat karya ilmiah **Ditolak/Revisi**, lengkap dengan catatan perbaikan dari Admin.
- Teks pesan dinamis yang menyesuaikan dengan kategori dokumen (Tugas Akhir, Makalah, Jurnal, dll).

### 🛡️ Proteksi Dokumen Cerdas
Menggunakan sistem *viewer* dokumen khusus yang dilengkapi fitur:
- Anti Klik Kanan (Disable Right-Click)
- Anti Copy Text
- Watermark Otomatis pada PDF
*(Fitur ini diterapkan menggunakan library `pdf-lib` untuk membantu mengurangi risiko penyalahgunaan dan pencurian hak cipta dokumen akademik).*

### 📁 Validasi File Dinamis (Smart Validation)
Sistem unggah dokumen dilengkapi pembatasan ukuran file PDF secara dinamis dan otomatis berdasarkan kategori yang dipilih pengguna (contoh: Tugas Akhir maks 15MB, Makalah maks 5MB), mencegah *server overload*.

### 👥 Manajemen Pengguna & Auto-Sync Data
Sistem mendukung pengelolaan pengguna secara terstruktur oleh Admin, termasuk:
- Persetujuan (Approve) akun mahasiswa baru.
- Penguncian akses pengguna (*Lock/Unlock* akun).
- Hapus dan Edit Data Pengguna.
- **Aksi Massal:** Mengunci/membuka akses berdasarkan tahun angkatan, serta aksi massal menggunakan *checkbox*.
- **Auto-Sync Data:** Saat Admin mengubah profil pengguna (Nama, Prodi), riwayat kepenulisan dokumen pengguna tersebut akan otomatis disinkronkan.

### 📧 Sistem Pemulihan Akun (Auto-Email)
- Fitur **Lupa Password** mandiri bagi pengguna.
- Sistem akan mengirimkan link reset sandi aman berbasis token (*Expired* dalam 15 menit) langsung ke kotak masuk email pengguna.

### 📊 Import Data Excel (Integrasi Cepat)
Admin dapat melakukan pendaftaran mahasiswa secara massal menggunakan file Excel (`.xlsx`), sehingga proses sinkronisasi dengan data kampus (misal: GoFeeder) menjadi lebih praktis. Sistem dilengkapi:
- Validasi deteksi NIM duplikat.
- Otomatis menangkap data Nama, NIM, Email, Tanggal Lahir, dan Prodi.

### 🔔 Notifikasi Real-time
Aplikasi menyediakan sistem notifikasi popup (*toast notification*) interaktif menggunakan `react-hot-toast` untuk peringatan unggah berhasil, error sistem, dan aktivitas pengguna (seperti notifikasi khusus Admin saat mahasiswa mengirimkan revisi).

---

## 🛠️ Teknologi yang Digunakan

Aplikasi dibangun menggunakan teknologi modern berbasis JavaScript (MERN-like Stack) untuk mendukung performa, keamanan, dan pengalaman pengguna yang optimal.

### 🎨 Frontend
- **React.js (Vite):** Membangun UI berbasis komponen yang super cepat.
- **Vite PWA Plugin:** Mengubah website menjadi *Progressive Web App*.
- **Tailwind CSS:** Framework CSS *utility-first* untuk desain responsif, elegan, dan mendukung Dark/Light Mode.
- **Framer Motion:** Library animasi untuk menciptakan transisi halaman yang *smooth*.
- **React Hot Toast:** Sistem notifikasi popup modern.

### ⚙️ Backend
- **Node.js & Express.js:** Menangani server, REST API, *routing*, dan *middleware*.
- **MySQL:** Database relasional untuk menyimpan data terstruktur (users, documents, logs).
- **JSON Web Token (JWT):** Autentikasi keamanan sesi *login*.
- **Bcrypt.js:** Mengenkripsi (hashing) *password* pengguna di database.
- **Multer:** Menangani proses unggah (*upload*) file dokumen PDF.
- **pdf-lib:** Memanipulasi dokumen PDF untuk menyisipkan *watermark* otomatis.
- **Nodemailer:** Mengirimkan email otomatis menggunakan SMTP Gmail untuk pemulihan kata sandi.
- **whatsapp-web.js & qrcode-terminal:** Mengintegrasikan bot WhatsApp Web untuk pengiriman notifikasi pesan otomatis melalui terminal.

---

## 🚀 Cara Instalasi & Menjalankan Aplikasi

Ikuti langkah berikut untuk menjalankan aplikasi pada *localhost* (komputer lokal).

### 1️⃣ Prasyarat
Pastikan komputer Anda sudah terinstal:
- Node.js
- XAMPP (Apache & MySQL)
- Git

### 2️⃣ Setup Database
1. Buka XAMPP, jalankan modul **Apache** dan **MySQL**.
2. Buka `http://localhost/phpmyadmin`.
3. Buat database baru dengan nama: `e_repository_kampus`
4. Buat tabel-tabel yang dibutuhkan (`users`, `documents`, `system_logs`, dll) sesuai struktur *query* sistem, atau *import* file `.sql` jika tersedia. Pastikan tabel `users` memiliki kolom `email`, `no_wa`, `reset_token`, dan `reset_expires`.

### 3️⃣ Setup Backend
Buka terminal baru, arahkan ke folder `backend`, lalu jalankan:

```bash
cd backend
npm install

```

Buat file `.env` di dalam folder `backend` dan sesuaikan dengan konfigurasi ini:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=e_repository_kampus
JWT_SECRET=rahasia_super_aman_anda
PORT=5000

```

*(Catatan: Untuk fitur pengiriman email, pastikan Anda telah mengatur akun Gmail dan App Password di file `authController.js` atau menambahkannya ke `.env`).*

Jalankan server backend:

```bash
npm start
# atau
npx nodemon server.js

```

*(💡 **Catatan WhatsApp Bot:** Saat server berjalan, terminal akan menampilkan QR Code. Scan menggunakan WhatsApp (opsi Tautkan Perangkat) untuk mengaktifkan Bot Notifikasi).*

### 4️⃣ Setup Frontend (Mode Development)

Buka terminal baru, arahkan ke folder `frontend`, lalu jalankan:

```bash
cd frontend
npm install
npm run dev

```

### 5️⃣ Menjalankan Mode PWA (Production Ready)

Untuk menguji fitur *Progressive Web App* (seperti menginstal aplikasi ke Desktop/HP dan mencoba *Offline Cache*), Anda harus menjalankan versi *build*:

```bash
cd frontend
npm run build
npm run preview

```

Buka link *preview* yang diberikan (biasanya `http://localhost:4173`). Ikon "Install" akan muncul di sisi kanan *address bar* browser Anda.

---

## 🌐 Akses Aplikasi

* **Frontend (Aplikasi Web):** `http://localhost:5173`
* **Backend (API Server):** `http://localhost:5000`

---

## 📌 Struktur Role Pengguna

| Role | Hak Akses |
| --- | --- |
| **Admin** | Memiliki akses penuh (Manajemen pengguna, verifikasi akun, kelola dokumen, pantau sistem). |
| **Dosen** | Pratinjau dokumen *watermark*, unggah publikasi ilmiah/jurnal. |
| **Mahasiswa** | Unggah tugas akhir/laporan magang, ubah sandi mandiri, pantau status persetujuan, menerima notif WA. |

---

## 📄 Lisensi

Project ini dikembangkan secara eksklusif untuk kebutuhan akademik, penelitian, dan digitalisasi perpustakaan di lingkungan Politeknik Baja Tegal.

---

Developed with ❤️ by **Rosalia Indah Dwi P.**

```