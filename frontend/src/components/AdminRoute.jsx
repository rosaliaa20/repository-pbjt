import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  // Jika belum login, tendang ke halaman login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jika sudah login TAPI role-nya bukan admin (misal: mahasiswa), tendang ke beranda
  if (user.role !== 'admin') {
    alert("Akses Ditolak: Anda tidak memiliki izin untuk masuk ke Panel Admin.");
    return <Navigate to="/" replace />;
  }

  // Jika dia benar-benar Admin, izinkan masuk ke halaman yang dituju
  return <Outlet />;
};

export default AdminRoute;