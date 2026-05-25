# E-Repository Politeknik Baja Tegal (PBJT)

Sistem repositori institusi berbasis web untuk mengelola, menyimpan, dan mempublikasikan dokumen akademik secara digital.

Aplikasi dikembangkan untuk mendukung digitalisasi dokumen kampus dengan sistem pengelolaan yang terstruktur, aman, dan mudah diakses oleh civitas akademika Politeknik Baja Tegal.

---

## Features

### Progressive Web App (PWA)
Aplikasi mendukung instalasi ke perangkat desktop maupun mobile melalui teknologi Progressive Web App (PWA) dan Service Worker.

### WhatsApp Notification
Integrasi bot WhatsApp untuk mengirim notifikasi status dokumen secara otomatis kepada mahasiswa, seperti:
- Dokumen disetujui
- Dokumen revisi/ditolak
- Informasi pembaruan status unggahan

### Document Protection
Sistem viewer dokumen dilengkapi:
- Disable right-click
- Disable text copy
- Watermark otomatis pada PDF menggunakan `pdf-lib`

### Smart File Validation
Validasi ukuran file PDF dilakukan secara dinamis berdasarkan kategori dokumen untuk membantu mengontrol penggunaan server.

### User Management
Fitur manajemen pengguna meliputi:
- Approve akun mahasiswa
- Lock/Unlock akun
- Edit dan hapus pengguna
- Bulk action berdasarkan angkatan
- Sinkronisasi otomatis data penulis dokumen

### Account Recovery
Fitur reset password menggunakan email berbasis token dengan batas waktu akses.

### Excel Import
Admin dapat melakukan import data mahasiswa menggunakan file `.xlsx` dengan validasi data dan deteksi NIM duplikat.

### Realtime Notification
Sistem notifikasi menggunakan `react-hot-toast` untuk aktivitas pengguna dan proses administrasi.

---

## Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- Framer Motion
- React Hot Toast
- Vite PWA Plugin

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- Bcrypt.js
- Multer
- pdf-lib
- Nodemailer
- whatsapp-web.js

---

## Installation

### Requirements
Pastikan sudah terinstal:
- Node.js
- XAMPP / MySQL
- Git

---

## Database Setup

1. Jalankan Apache dan MySQL melalui XAMPP.
2. Buka:

```txt
http://localhost/phpmyadmin
```

3. Buat database:

```txt
e_repository_kampus
```

4. Import file `.sql` atau buat tabel yang diperlukan.

---

## Backend Setup

Masuk ke folder backend:

```bash
cd backend
npm install
```

Buat file `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=e_repository_kampus
JWT_SECRET=your_secret_key
PORT=5000
```

Jalankan backend:

```bash
npm start
```

atau

```bash
npx nodemon server.js
```

---

## Frontend Setup

Masuk ke folder frontend:

```bash
cd frontend
npm install
npm run dev
```

---

## PWA Build

Untuk menjalankan versi production/PWA:

```bash
npm run build
npm run preview
```

---

## Application Access

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |

---

## User Roles

| Role | Access |
|---|---|
| Admin | Manajemen pengguna dan dokumen |
| Dosen | Upload publikasi dan preview dokumen |
| Mahasiswa | Upload dokumen dan monitoring status |

---

## License

Project ini dikembangkan untuk kebutuhan akademik dan digitalisasi dokumen di lingkungan Politeknik Baja Tegal.

---

Author: Rosalia Indah Dwi P.