import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiLock, FiArrowRight, FiInfo } from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/auth/login', {
        identifier,
        password,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      Swal.fire({
        icon: 'success',
        title: 'Selamat Datang!',
        text: `Halo, ${response.data.user.name}`,
        showConfirmButton: false,
        timer: 1500,
        background: document.documentElement.classList.contains('dark') ? '#1E293B' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#1E293B'
      });

      if (response.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: error.response?.data?.message || 'Terjadi kesalahan sistem',
        background: document.documentElement.classList.contains('dark') ? '#1E293B' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#1E293B'
      });
    }
  };

  // 🔥 FUNGSI LUPA SANDI (SOP KAMPUS) 🔥
  const handleForgotPassword = () => {
    Swal.fire({
      icon: 'info',
      title: 'Lupa Kata Sandi?',
      html: `
        <div class="text-sm">
          <p class="mb-3">Sistem kami menggunakan keamanan terpusat. Untuk mereset kata sandi Anda, silakan hubungi:</p>
          <ul class="text-left bg-slate-100 dark:bg-slate-800 p-4 rounded-xl font-medium list-disc pl-8 mb-4">
            <li>Administrator Perpustakaan</li>
            <li>Kepala Program Studi (Kaprodi)</li>
          </ul>
          <p class="text-xs text-rose-500 italic">Sandi akan direset ke bawaan (default) oleh Admin.</p>
        </div>
      `,
      confirmButtonText: 'Tutup',
      confirmButtonColor: '#3b82f6',
      background: document.documentElement.classList.contains('dark') ? '#1E293B' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#1E293B'
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-0 flex items-center justify-center font-sans px-4 bg-slate-50 dark:bg-[#0F172A] overflow-hidden"
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src="/wallpaper.png" alt="Background" 
          className="w-full h-full object-cover opacity-30 dark:opacity-20"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/80 to-white/40 dark:from-slate-900/60 dark:via-slate-900/90 dark:to-slate-900/60"></div>
      </div>

      <div className="absolute top-[-5%] left-[-5%] w-[300px] h-[300px] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[250px] h-[250px] bg-yellow-400/20 dark:bg-yellow-600/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 max-h-[90vh] overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="bg-white/70 dark:bg-slate-800/40 backdrop-blur-2xl p-6 md:p-7 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-white/50 dark:border-slate-700/50"
        >
          <div className="text-center mb-6">
            <div className="inline-block p-3 bg-white dark:bg-slate-700 rounded-2xl shadow mb-4">
              <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Selamat Datang</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Masuk ke <span className="text-blue-600 dark:text-yellow-400">E-Repository</span>
            </p>
          </div>

          <motion.form 
            onSubmit={handleLogin} initial="hidden" animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
            className="space-y-4"
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-3">NIM / Username</label>
              <div className="relative mt-1">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input 
                  type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Masukkan NIM atau Username" required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-yellow-400 outline-none text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                />
              </div>
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
              <div className="flex items-center justify-between ml-3 pr-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Kata Sandi</label>
                {/* 🔥 TOMBOL LUPA SANDI 🔥 */}
                <Link to="/forgot-password" className="text-xs font-bold text-amber-500 hover:underline">
                  Lupa Sandi?
                </Link>
              </div>
              <div className="relative mt-1">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input 
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-yellow-400 outline-none text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                />
              </div>
            </motion.div>

            <motion.button 
              whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }} type="submit"
              className="w-full bg-slate-900 dark:bg-yellow-400 hover:bg-blue-700 dark:hover:bg-yellow-500 text-white dark:text-slate-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all mt-4"
            >
              Masuk <FiArrowRight />
            </motion.button>
          </motion.form>

          <div className="mt-6 pt-5 border-t border-slate-200/50 dark:border-slate-700/50 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Belum punya akun? <Link to="/register" className="text-blue-600 dark:text-yellow-400 font-bold hover:underline">Daftar</Link>
            </p>
            <Link to="/" className="inline-flex items-center gap-2 mt-4 text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <FiInfo /> Jelajahi sebagai Tamu
            </Link>
          </div>
        </motion.div>

        <p className="text-center mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">&copy; 2026 Politeknik Baja Tegal</p>
      </div>
    </motion.div>
  );
};

export default Login;