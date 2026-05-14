import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiUser, FiCalendar, FiBookOpen, 
  FiCreditCard, FiArrowLeft, FiCheckCircle, FiArrowRight, FiAlertCircle
} from 'react-icons/fi';
import axios from 'axios';
import { motion } from 'framer-motion';


const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    nim: '',
    tanggal_lahir: '',
    department: 'Teknik Informatika'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 🔥 TAMBAHKAN SATPAM FORMAT NIM DI SINI 🔥
    // Pola: 2 angka + titik + 1 angka + titik + 1 angka + titik + 4 angka
    const nimPattern = /^\d{2}\.\d\.\d\.\d{4}$/; 
    
    if (!nimPattern.test(formData.nim)) {
      return setError('Format NIM tidak valid! Gunakan titik sesuai format kampus (Contoh: 23.1.9.0042)');
    }

    try {
      setLoading(true);
      
      // Mengubah format YYYY-MM-DD menjadi YYYYMMDD untuk dijadikan password
      const formattedPassword = formData.tanggal_lahir.replace(/-/g, '');
      
      // Menyiapkan data yang sinkron dengan backend
      const dataToSubmit = {
        name: formData.name,
        nim: formData.nim, 
        tanggal_lahir: formData.tanggal_lahir,
        password: formattedPassword, // Tanggal lahir disulap jadi password
        department: formData.department
      };

      // Mengirimkan data asli ke endpoint backend
      const response = await axios.post('http://localhost:5000/api/auth/register', dataToSubmit);
      
      if (response.status === 201) {
        setLoading(false);
        setSuccess(true);
        // Jika sukses, arahkan ke halaman login setelah 4 detik
        setTimeout(() => navigate('/login'), 4000);
      }

    } catch (err) {
      // Menangkap pesan error jika NIM sudah terdaftar atau server bermasalah
      setError(err.response?.data?.message || 'Terjadi kesalahan saat mendaftar.');
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-0 flex items-center justify-center font-sans px-4 bg-slate-50 dark:bg-[#0F172A] overflow-hidden"
    >
      
      {/* BACKGROUND & ORNAMEN */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src="/wallpaper.png"
          alt="Background" 
          className="w-full h-full object-cover opacity-30 dark:opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/80 to-white/40 dark:from-slate-900/60 dark:via-slate-900/90 dark:to-slate-900/60"></div>
      </div>

      {/* CARD KONTAINER */}
      <div className="w-full max-w-[480px] relative z-10 flex flex-col items-center">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="w-full bg-white/70 dark:bg-slate-800/40 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-white/50 dark:border-slate-700/50 max-h-[90vh] overflow-y-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >

          {/* HEADER */}
          <div className="text-center mb-6">
            <div className="inline-block p-3 bg-white dark:bg-slate-700 rounded-2xl shadow mb-4">
              <img src="/logo.png" alt="Logo PBJT" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">Buat Akun Baru</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bergabung dengan <span className="text-blue-600 dark:text-yellow-400 font-bold">E-Repository PBJT</span>
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 flex items-center justify-center gap-2 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-bold text-center">
              <FiAlertCircle className="shrink-0 text-lg" /> {error}
            </div>
          )}

          {/* KONDISI SUKSES vs FORM */}
          {success ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="mb-2 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center"
            >
              <FiCheckCircle className="text-6xl text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Pendaftaran Terkirim!</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Akun Anda saat ini berstatus <b className="text-emerald-600 dark:text-emerald-400">Menunggu Persetujuan</b>. Anda dapat login setelah diverifikasi oleh Admin.
              </p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-6 animate-pulse">
                Mengalihkan ke halaman login...
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* NAMA LENGKAP */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-3">Nama Lengkap</label>
                <div className="relative mt-1">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Sesuai KTP / KTM" 
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-yellow-400 outline-none text-sm text-slate-800 dark:text-white transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* NIM */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-3">NIM</label>
                  <div className="relative mt-1">
                    <FiCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input type="text" name="nim" value={formData.nim} onChange={handleChange} required placeholder="Misal: 23.1.0042" 
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-yellow-400 outline-none text-sm text-slate-800 dark:text-white transition-colors" />
                  </div>
                </div>

                {/* TANGGAL LAHIR */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-3">Tanggal Lahir</label>
                  <div className="relative mt-1">
                    <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input type="date" name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleChange} required 
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-yellow-400 outline-none text-sm text-slate-800 dark:text-white transition-colors cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* INFO TAMBAHAN BAWAH INPUT */}
              <div className="flex justify-between px-3 -mt-2">
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500">*NIM akan menjadi Username</p>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500">*Tgl Lahir akan menjadi Password</p>
              </div>

              {/* PROGRAM STUDI */}
              <div className="pt-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-3">Program Studi</label>
                <div className="relative mt-1">
                  <FiBookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 z-10" />
                  <select name="department" value={formData.department} onChange={handleChange} 
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-yellow-400 outline-none text-sm font-bold text-slate-800 dark:text-white appearance-none cursor-pointer relative z-0">
                    <option value="Teknik Informatika">D3 Informatika</option>
                    <option value="Teknik Mesin">D3 Mesin</option>
                    <option value="Teknik Otomotif">D3 Otomotif</option>
                    <option value="Teknik Elektronika">D3 Elektronika</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 dark:bg-yellow-400 hover:opacity-90 text-white dark:text-slate-900 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all mt-6 shadow-lg shadow-black/10"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white dark:border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>{'Kirim Pendaftaran'} <FiArrowRight /></>
                )}
              </button>

            </form>
          )}

          {/* FOOTER */}
          <div className="mt-6 pt-5 border-t border-slate-200/50 dark:border-slate-700/50 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sudah punya akun / di-import Admin?{' '}
              <Link to="/login" className="text-blue-600 dark:text-yellow-400 font-bold hover:underline">
                Masuk di sini
              </Link>
            </p>
            <Link to="/" className="inline-flex items-center gap-2 mt-4 text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <FiArrowLeft /> Kembali ke Beranda
            </Link>
          </div>

        </motion.div>

        <p className="text-center mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest relative z-10">
          &copy; 2026 Politeknik Baja Tegal
        </p>

      </div>
    </motion.div>
  );
};

export default Register;