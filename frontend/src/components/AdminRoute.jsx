import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

/**
 * AdminRoute: Pelindung halaman admin (Server-Side Verified).
 * Memverifikasi token JWT secara langsung ke Backend untuk mencegah pemalsuan localStorage.
 */
const AdminRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading
  const token = localStorage.getItem('token');

  useEffect(() => {
    const verifyAdminRole = async () => {
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await axios.get('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Pengecekan ganda: Token valid && Role adalah admin
        if (response.data.valid && response.data.user.role === 'admin') {
          setIsAuthenticated(true);
        } else {
          toast.error('Akses ditolak! Halaman khusus Admin.');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Sesi tidak valid:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      }
    };

    verifyAdminRole();
  }, [token]);

  // Tampilkan loading state saat masih memverifikasi ke server
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 font-semibold text-slate-600 animate-pulse">Memverifikasi Otoritas Keamanan...</span>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRoute;