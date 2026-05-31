import { useState, useEffect } from 'react';
import { 
  FiUser, FiLock, FiShield, FiCheckCircle, 
  FiSave, FiAlertCircle, FiEye, FiEyeOff, FiMail, FiPhone
} from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [fullUserData, setFullUserData] = useState(null); 
  
  // State untuk form ganti password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // State untuk form kontak (Email & WA)
  const [email, setEmail] = useState('');
  const [noWa, setNoWa] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      axios.get(`/api/auth/users/${parsedUser.id}`)
        .then(res => {
          setEmail(res.data.email || '');
          setNoWa(res.data.no_wa || '');
          setFullUserData(res.data);
        })
        .catch(err => console.error("Gagal mengambil data profil:", err));
    }
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      return Swal.fire({
        icon: 'error', title: 'Sandi Tidak Cocok',
        text: 'Konfirmasi sandi baru tidak sama dengan sandi baru.',
        background: document.documentElement.classList.contains('dark') ? '#1E293B' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#1E293B'
      });
    }

    if (newPassword.length < 6) {
      return Swal.fire({
        icon: 'warning', title: 'Terlalu Pendek',
        text: 'Sandi baru minimal harus 6 karakter.',
        background: document.documentElement.classList.contains('dark') ? '#1E293B' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#1E293B'
      });
    }

    setIsLoading(true);

    try {
      await axios.put(`/api/auth/change-password/${user.id}`, {
        oldPassword, newPassword
      });

      Swal.fire({
        icon: 'success', title: 'Berhasil!',
        text: 'Kata sandi Anda berhasil diperbarui.',
        background: document.documentElement.classList.contains('dark') ? '#1E293B' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#1E293B'
      });

      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      setShowOldPassword(false); setShowNewPassword(false); setShowConfirmPassword(false);
      
    } catch (error) {
      Swal.fire({
        icon: 'error', title: 'Gagal',
        text: error.response?.data?.message || 'Pastikan sandi lama Anda benar.',
        background: document.documentElement.classList.contains('dark') ? '#1E293B' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#1E293B'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    if (!fullUserData) return;

    setIsEmailLoading(true);
    try {
      await axios.put(`/api/auth/users/${user.id}`, {
        name: fullUserData.name,
        nim: fullUserData.nim || fullUserData.username,
        role: fullUserData.role,
        department: fullUserData.department,
        email: email,
        no_wa: noWa // Mengirim data WA ke backend
      });

      Swal.fire({
        icon: 'success', title: 'Berhasil!',
        text: 'Informasi kontak Anda berhasil diperbarui.',
        background: document.documentElement.classList.contains('dark') ? '#1E293B' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#1E293B'
      });
      
      setFullUserData({ ...fullUserData, email: email, no_wa: noWa });

    } catch (error) {
      Swal.fire({
        icon: 'error', title: 'Gagal',
        text: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data kontak.',
        background: document.documentElement.classList.contains('dark') ? '#1E293B' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#1E293B'
      });
    } finally {
      setIsEmailLoading(false);
    }
  };

  if (!user) return <div className="p-8 pt-32 text-center text-slate-500 font-bold animate-pulse">Memuat data profil...</div>;

  return (
    <div className="p-4 pt-24 md:p-6 md:pt-28 max-w-5xl mx-auto">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
        
        {/* KARTU INFORMASI PROFIL (KIRI) */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#131C31] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center sticky top-28">
            
            <div className="w-full border-b border-slate-100 dark:border-slate-800 pb-3 mb-5 flex items-center justify-center gap-2">
              <FiUser className="text-indigo-500" size={18} />
              <h1 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Profil Saya</h1>
            </div>

            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-500/30 mb-3 border-4 border-white dark:border-[#131C31]">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            
            <h2 className="text-base font-bold text-slate-900 dark:text-white text-center leading-tight">{user.name}</h2>
            
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 mb-3">
              {fullUserData ? (fullUserData.nim || fullUserData.username) : '-'}
            </p>

            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-5 ${
              user.role === 'admin' ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' :
              user.role === 'dosen' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' :
              'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
            }`}>
              {user.role}
            </span>

            <div className="w-full text-left space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                <FiShield className="text-indigo-500 shrink-0" size={15} />
                <span className="truncate font-medium">Akses: {user.role === 'admin' ? 'Penuh' : 'Terbatas'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                <FiCheckCircle className="text-emerald-500 shrink-0" size={15} />
                <span className="truncate font-medium">Status: Aktif</span>
              </div>
            </div>

          </div>
        </div>

        {/* KOLOM KANAN (FORM GANTI SANDI & EMAIL) */}
        <div className="lg:col-span-2 flex flex-col gap-5 md:gap-6">
          
          {/* KARTU 1: FORM GANTI PASSWORD */}
          <div className="bg-white dark:bg-[#131C31] p-5 md:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            
            <div className="w-full border-b border-slate-100 dark:border-slate-800 pb-3 mb-5 flex items-center justify-start gap-2">
              <FiLock className="text-emerald-500" size={18} />
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Keamanan & Sandi</h3>
            </div>

            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3 rounded-lg flex items-start gap-3 mb-6">
              <FiAlertCircle className="text-amber-600 dark:text-amber-400 text-lg shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300">Tindakan Diperlukan!</h4>
                <p className="text-[11px] text-amber-700 dark:text-amber-400/80 mt-0.5 leading-relaxed">
                  Jika akun Anda menggunakan sandi bawaan (<b>pbjt123</b>), Anda <b>wajib</b> menggantinya di sini.
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Sandi Saat Ini</label>
                <div className="relative mt-1.5">
                  <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input 
                    type={showOldPassword ? "text" : "password"} 
                    value={oldPassword} 
                    onChange={(e) => setOldPassword(e.target.value)} required
                    placeholder="Masukkan sandi saat ini"
                    className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-lg focus:border-indigo-500 outline-none dark:text-white transition-all text-sm font-medium [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors focus:outline-none"
                  >
                    {showOldPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Sandi Baru</label>
                  <div className="relative mt-1.5">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} required
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-lg focus:border-emerald-500 outline-none dark:text-white transition-all text-sm font-medium [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors focus:outline-none"
                    >
                      {showNewPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Ulangi Sandi Baru</label>
                  <div className="relative mt-1.5">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} required
                      placeholder="Ketik ulang sandi baru"
                      className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-lg focus:border-emerald-500 outline-none dark:text-white transition-all text-sm font-medium [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors focus:outline-none"
                    >
                      {showConfirmPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white px-6 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-500/20"
                >
                  {isLoading ? 'Menyimpan...' : <><FiSave size={14}/> Simpan Perubahan</>}
                </button>
              </div>

            </form>

          </div>

          {/* KARTU 2: FORM INFORMASI KONTAK (EMAIL & WA) */}
          <div className="bg-white dark:bg-[#131C31] p-5 md:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            
            <div className="w-full border-b border-slate-100 dark:border-slate-800 pb-3 mb-5 flex items-center justify-start gap-2">
              <FiMail className="text-blue-500" size={18} />
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Informasi Kontak</h3>
            </div>

            <form onSubmit={handleUpdateContact} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kolom Email */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Email Pemulihan</label>
                  <div className="relative mt-1.5">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} required
                      placeholder="nama@email.com"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-lg focus:border-blue-500 outline-none dark:text-white transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                {/* Kolom WA */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Nomor WhatsApp</label>
                  <div className="relative mt-1.5">
                    <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input 
                      type="text" 
                      value={noWa} 
                      onChange={(e) => setNoWa(e.target.value)} 
                      placeholder="Contoh: 08123456789"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-lg focus:border-green-500 outline-none dark:text-white transition-all text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 ml-1">
                Pastikan email aktif untuk pemulihan sandi. Nomor WhatsApp digunakan untuk menerima notifikasi status dokumen (Opsional).
              </p>

              <div className="pt-3 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isEmailLoading || !fullUserData}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white px-6 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20"
                >
                  {isEmailLoading ? 'Menyimpan...' : <><FiSave size={14}/> Perbarui Kontak</>}
                </button>
              </div>
            </form>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;