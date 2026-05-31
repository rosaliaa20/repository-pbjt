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

### Backend & Infrastructure
- Node.js & Express.js (Monolithic Architecture)
- MySQL 8.0 (Connection Pooling)
- JWT Authentication (Hardened Security)
- Bcrypt.js
- Multer & pdf-lib
- Nodemailer
- whatsapp-web.js (Robust Session Management)
- Docker & Docker Swarm
- GitHub Actions CI/CD
- Tailscale VPN (For Secure Proxmox Deployment)

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

## Local Development Setup (Manual)

### Backend Setup

Masuk ke folder backend:

```bash
cd backend
npm install
```

Buat file `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=e_repository_kampus
JWT_SECRET=your_super_secret_key_64_bytes
PUPPETEER_EXECUTABLE_PATH=
MYSQLDUMP_PATH=mysqldump
MYSQL_PATH=mysql
```

Jalankan backend:

```bash
npm run dev
```

### Frontend Setup

Masuk ke folder frontend:

```bash
cd frontend
npm install
npm run dev
```

---

## Production Deployment (Docker Swarm & CI/CD)

Aplikasi ini menggunakan arsitektur **Monolith via Docker**. _Frontend_ di-_build_ dan disajikan secara statis oleh server Express.js di _Backend_.

### Menjalankan via Docker Compose

```bash
docker compose up -d --build
```

### GitHub Actions CI/CD
Proyek ini sudah dilengkapi dengan _workflow_ GitHub Actions (`.github/workflows/e-repo.yml`) yang secara otomatis mem-build image Docker dan men-_deploy_ ke server VPS/Proxmox Anda setiap kali ada *push* ke *branch* `main`.

Secret yang dibutuhkan di GitHub:
- `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`
- `DEPLOY_PATH` (contoh: `/opt/e-repository-kampus`)
- `DB_PASS`, `JWT_SECRET`
- `APP_URL` (contoh: `https://repo.kampus.ac.id`)
- `TAILSCALE_AUTHKEY` (Opsional, untuk keamanan jaringan internal)

---

## Application Access (Development)

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |

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