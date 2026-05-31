import { Navigate, Outlet } from 'react-router-dom';

/**
 * AdminRoute: Pelindung halaman admin.
 * Memverifikasi keberadaan KEDUA token JWT DAN data user dengan role admin.
 * Jika token tidak ada, pengguna sudah pasti bukan sesi yang valid.
 */
const AdminRoute = () => {
  const token = localStorage.getItem('token');
  const userRaw = localStorage.getItem('user');

  // Cek 1: Tidak ada token sama sekali → paksa login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Cek 2: Data user tidak valid atau tidak ada → paksa login
  let user = null;
  try {
    user = JSON.parse(userRaw);
  } catch (_) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Cek 3: User ada tapi bukan admin → kembalikan ke beranda
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Semua cek lolos → izinkan akses
  return <Outlet />;
};

export default AdminRoute;