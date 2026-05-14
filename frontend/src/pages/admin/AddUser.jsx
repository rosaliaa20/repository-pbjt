import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUserPlus, FiSave, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiUser } from 'react-icons/fi';
import axios from 'axios';

const AddUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // State untuk data form
  const [formData, setFormData] = useState({
    name: '',
    email: '', 
    password: '',
    role: 'dosen' 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', formData);
      
      setStatus({ type: 'success', message: 'Akun berhasil dibuat dan siap digunakan!' });
      
      // Kosongkan form setelah sukses
      setFormData({ name: '', email: '', password: '', role: 'dosen' });
      
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Terjadi kesalahan saat membuat akun.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      
      {/* Header Halaman */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/users" className="p-2 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors">
          <FiArrowLeft className="text-xl text-slate-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <FiUserPlus className="text-blue-600" /> Tambah Pengguna Baru
          </h1>
          <p className="text-slate-500 text-sm mt-1">Buat akun untuk Dosen, Admin, atau Mahasiswa.</p>
        </div>
      </div>

      {/* Pesan Notifikasi (Sukses / Error) */}
      {status.message && (
        <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 font-medium text-sm ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {status.type === 'success' ? <FiCheckCircle className="text-lg shrink-0 mt-0.5" /> : <FiAlertCircle className="text-lg shrink-0 mt-0.5" />}
          <p>{status.message}</p>
        </div>
      )}

      {/* Form Input */}
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Input Nama */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Nama Lengkap</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Contoh: Budi Santoso, S.T., M.Kom."
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 px-4 py-3 rounded-xl transition-all outline-none"
            />
          </div>

          {/* Input Email / NIDN */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Email / NIDN / NIM</label>
            <input 
              type="text" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Gunakan NIDN untuk dosen"
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 px-4 py-3 rounded-xl transition-all outline-none"
            />
          </div>

          {/* Input Password */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Minimal 6 karakter"
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 px-4 py-3 rounded-xl transition-all outline-none"
            />
          </div>

          {/* Pemilihan Hak Akses (Role) */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Hak Akses (Role)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiUser className="text-slate-400" />
              </div>
              <select 
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 pl-11 pr-4 py-3 rounded-xl transition-all outline-none font-medium text-slate-700 cursor-pointer appearance-none"
              >
                {/* EMOJI DIHAPUS, LEBIH FORMAL */}
                <option value="dosen">Dosen </option>
                <option value="admin">Admin </option>
                <option value="user">Mahasiswa </option>
              </select>
            </div>
          </div>

        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Menyimpan...
              </span>
            ) : (
              <>
                <FiSave className="text-lg" /> Simpan Pengguna Baru
              </>
            )}
          </button>
          <Link to="/admin/users" className="px-6 py-3.5 text-slate-500 hover:text-slate-800 font-bold transition-colors">
            Batal
          </Link>
        </div>

      </form>
    </div>
  );
};

export default AddUser;