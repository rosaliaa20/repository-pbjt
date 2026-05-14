import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiShield, FiSave, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '', // atau name (tergantung backend kamu)
    email: '',
    role: 'student'
  });

  // Ambil data user lama saat halaman dibuka
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/auth/users/${id}`);
        const user = response.data;
        setFormData({
          username: user.name || user.username || '',
          email: user.email || '',
          role: user.role || 'student'
        });
      } catch (error) {
        console.error('Gagal memuat data user:', error);
        alert('Data pengguna tidak ditemukan!');
        navigate('/admin/users');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchUser();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/auth/users/${id}`, formData);
      setSuccess(true);
      setTimeout(() => navigate('/admin/users'), 2000);
    } catch (error) {
      console.error('Gagal update user:', error);
      alert('Gagal menyimpan perubahan pengguna.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return (
    <div className="p-10 text-center font-bold text-slate-500 dark:text-slate-400 animate-pulse">
      Memuat Data Pengguna...
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto font-sans pb-24 transition-colors duration-300">
      
      {/* HEADER SECTION */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Edit Profil Pengguna</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Perbarui informasi dasar akun pengguna ini.</p>
        </div>
        <button onClick={() => navigate('/admin/users')} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-100 dark:bg-slate-800 rounded-lg">
          <FiArrowLeft size={20} />
        </button>
      </div>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="mb-6 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl flex items-center gap-3 font-medium animate-pulse transition-colors">
          <FiCheckCircle className="text-xl" /> Perubahan pengguna berhasil disimpan! Mengalihkan...
        </div>
      )}

      {/* FORM CONTAINER */}
      <div className="bg-white dark:bg-[#131C31] rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          
          {/* USERNAME / NAMA */}
          <div>
            <label className="block text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Nama Lengkap</label>
            <div className="relative group">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input type="text" name="username" required value={formData.username} onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 outline-none text-sm font-medium text-slate-900 dark:text-white transition-colors" 
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Alamat Email</label>
            <div className="relative group">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input type="email" name="email" required value={formData.email} onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 outline-none text-sm font-medium text-slate-900 dark:text-white transition-colors" 
              />
            </div>
          </div>

          {/* ROLE */}
          <div>
            <label className="block text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Hak Akses (Role)</label>
            <div className="relative group">
              <FiShield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <select name="role" value={formData.role} onChange={handleInputChange}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 outline-none text-sm font-bold text-slate-900 dark:text-white transition-colors appearance-none cursor-pointer"
              >
                <option value="student">Mahasiswa</option>
                <option value="dosen">Dosen</option>
                <option value="admin">Admin Perpustakaan</option>
              </select>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-900 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-600/30 dark:shadow-none transition-all flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white dark:border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <><FiSave /> Simpan Perubahan Pengguna</>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditUser;