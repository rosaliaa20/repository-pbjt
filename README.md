# 🎓 E-Repository Politeknik Baja Tegal (PBJT)

Sistem Informasi Repositori Institusi berbasis web yang dirancang untuk mengelola, menyimpan, dan mempublikasikan karya ilmiah serta dokumen akademik secara digital, terstruktur, dan aman.

Aplikasi ini dikembangkan untuk membantu proses digitalisasi dokumen kampus agar lebih modern, efisien, dan mudah diakses oleh civitas akademika.

---

# ✨ Fitur Utama

Aplikasi dirancang dengan antarmuka modern dan dilengkapi berbagai fitur pengelolaan serta keamanan dokumen digital.

---

## 🛡️ Proteksi Dokumen Cerdas

Menggunakan sistem viewer dokumen khusus yang dilengkapi fitur:

- Anti Klik Kanan
- Anti Copy
- Watermark Otomatis pada PDF

Fitur ini diterapkan menggunakan library `pdf-lib` untuk membantu mengurangi risiko penyalahgunaan dan pencurian hak cipta dokumen akademik.

---

## 👥 Manajemen Pengguna Kompleks

Sistem mendukung pengelolaan pengguna secara terstruktur, termasuk:

- Persetujuan akun mahasiswa baru
- Penguncian akses pengguna
- Penghapusan akun
- Aksi massal menggunakan checkbox

Fitur ini membantu admin mengelola data pengguna dengan lebih cepat dan efisien.

---

## 📊 Import Data Excel

Admin dapat melakukan pendaftaran mahasiswa secara massal menggunakan file Excel (`.xlsx`) sehingga proses input data menjadi lebih praktis.

Sistem juga dilengkapi validasi otomatis untuk mendeteksi:

- NIM duplikat
- Data pengguna ganda
- Kesalahan format data

---

## 🔔 Notifikasi Real-time

Aplikasi menyediakan sistem notifikasi popup (*toast notification*) yang interaktif dan responsif.

Notifikasi digunakan untuk:
- Informasi upload berhasil
- Peringatan kesalahan sistem
- Persetujuan dokumen
- Aktivitas pengguna terbaru

Sistem juga mendukung audio alert untuk membantu admin memantau aktivitas penting secara real-time.

---

## 🔐 Role-Based Access Control (RBAC)

Sistem hak akses dirancang berdasarkan peran pengguna untuk menjaga keamanan dan pengelolaan sistem yang lebih terstruktur.

### 👨‍💼 Admin
Memiliki akses penuh terhadap sistem, termasuk:

- Manajemen pengguna
- Verifikasi akun
- Persetujuan dokumen
- Pengelolaan repository
- Monitoring aktivitas sistem

### 👨‍🏫 Dosen
Dapat melakukan:

- Pratinjau dokumen ber-watermark
- Upload jurnal akademik
- Upload hasil penelitian
- Melihat riwayat dokumen

### 👨‍🎓 Mahasiswa
Dapat melakukan:

- Upload tugas akhir
- Upload laporan magang
- Melihat riwayat dokumen
- Memantau status persetujuan dokumen

---

# 🛠️ Teknologi yang Digunakan

Aplikasi dibangun menggunakan teknologi modern berbasis JavaScript untuk mendukung performa, keamanan, dan pengalaman pengguna yang optimal.

---

## 🎨 Frontend

### React.js (Vite)
Digunakan untuk membangun antarmuka pengguna (*User Interface*) berbasis komponen agar aplikasi lebih interaktif, cepat, dan mudah dikembangkan.

Vite digunakan sebagai build tool modern dengan performa development yang ringan dan cepat.

---

### Tailwind CSS
Framework CSS utility-first yang digunakan untuk mempercepat proses desain antarmuka responsif dengan tampilan modern, clean, dan mendukung Dark/Light Mode.

---

### Framer Motion
Library animasi React yang digunakan untuk menciptakan animasi dan transisi halaman yang halus sehingga meningkatkan pengalaman pengguna (*User Experience*).

---

### React Hot Toast
Digunakan untuk menampilkan notifikasi popup interaktif secara real-time seperti notifikasi login, upload dokumen, maupun peringatan sistem.

---

## ⚙️ Backend

### Node.js
Runtime JavaScript berbasis server yang digunakan untuk menjalankan logika backend dan menangani request dari client secara efisien.

---

### Express.js
Framework backend pada Node.js yang digunakan untuk membangun REST API, routing, middleware, autentikasi, dan komunikasi dengan database.

---

### MySQL
Database relasional yang digunakan untuk menyimpan data pengguna, dokumen, notifikasi, dan data sistem lainnya secara terstruktur.

---

### JSON Web Token (JWT)
Digunakan sebagai sistem autentikasi berbasis token untuk menjaga keamanan sesi login pengguna.

---

### Bcrypt
Digunakan untuk mengenkripsi password pengguna sebelum disimpan ke database agar keamanan akun lebih terjamin.

---

### Multer
Middleware Node.js yang digunakan untuk menangani proses upload file dokumen seperti PDF tugas akhir, laporan magang, dan jurnal akademik.

---

### pdf-lib
Library pemrosesan PDF yang digunakan untuk menambahkan watermark otomatis pada dokumen sebagai bentuk perlindungan hak cipta digital.

---

# 🚀 Cara Instalasi & Menjalankan Aplikasi

Ikuti langkah berikut untuk menjalankan aplikasi pada localhost.

---

## 1️⃣ Prasyarat

Pastikan sudah menginstal:

- Node.js
- XAMPP / MySQL Server
- Git (Opsional)

---

## 2️⃣ Setup Database

1. Buka phpMyAdmin atau tools database MySQL lainnya.
2. Buat database baru, misalnya:

```sql
e_repository_db
```

3. Buat tabel yang dibutuhkan seperti:

- users
- documents
- notifications

sesuai struktur query pada backend.

---

## 3️⃣ Setup Backend

Buka terminal lalu jalankan:

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
npm install
```

Buat file `.env` pada folder backend:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=e_repository_db
JWT_SECRET=your_secret_key
PORT=5000
```

Jalankan server backend:

```bash
npx nodemon server.js
```

---

## 4️⃣ Setup Frontend

Buka terminal baru lalu jalankan:

```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies
npm install

# Jalankan frontend
npm run dev
```

---

# 🌐 Akses Aplikasi

Frontend dapat diakses melalui browser pada:

```bash
http://localhost:5173
```

Backend berjalan pada:

```bash
http://localhost:5000
```

---

# 📌 Struktur Role Pengguna

| Role | Hak Akses |
|------|------------|
| Admin | Mengelola seluruh sistem repository |
| Dosen | Pratinjau dokumen dan unggah publikasi ilmiah |
| Mahasiswa | Unggah karya tugas akhir/laporan magang dan pantau riwayat dokumen. |

---

# 📄 Lisensi

Project ini dikembangkan untuk kebutuhan akademik dan penelitian di lingkungan Politeknik Baja Tegal.

---

# ❤️ Developer

Developed with ❤️ by **Rosalia Indah Dwi P.**
