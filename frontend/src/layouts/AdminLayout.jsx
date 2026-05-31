import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  FiGrid, FiFileText, FiUsers, FiLogOut, FiSearch, 
  FiBell, FiMoon, FiSun, FiCheck, FiUserPlus, FiInfo, FiUser, FiMenu, FiX, FiSettings
} from 'react-icons/fi';
import axios from "axios";
import toast from 'react-hot-toast'; 

const AdminLayout = () => {
  const navigate = useNavigate();
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  
  const lastNotifId = useRef(null);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [modal, setModal] = useState({
    isOpen: false, title: '', message: '', onConfirm: null
  });

  const closePopup = () => setModal({ ...modal, isOpen: false });

const fetchNotifications = async () => {
    try {
      const response = await axios.get("/api/notifications");
      const newNotifs = response.data;

      if (newNotifs.length > 0) {
        // Cari notif terbaru yang belum dibaca
        const latestUnread = newNotifs.find(n => !n.is_read);

        if (latestUnread && (lastNotifId.current === null || latestUnread.id > lastNotifId.current)) {
          
          let notifIcon = '🔔';
          let targetPath = '/admin/dashboard'; 
          let navState = {}; 

          if (latestUnread.type === 'user') {
            notifIcon = '👤';
            targetPath = '/admin/users'; 
            navState = { activeTab: 'pending' }; 
          } else if (latestUnread.type === 'doc') {
            notifIcon = '📄';
            targetPath = '/admin/documents'; 
          }

          const audio = new Audio('/notif.mp3');
          audio.play().catch(e => console.log("Suara diblokir browser", e));

          toast((t) => (
            <div onClick={() => { handleNotifClick(latestUnread); toast.dismiss(t.id); }} className="cursor-pointer">
              <p className="font-bold text-sm">{latestUnread.title}</p>
              <p className="text-xs opacity-90 mt-1">{latestUnread.description}</p>
            </div>
          ), { icon: notifIcon, duration: 6000 });
        }
        
        lastNotifId.current = newNotifs[0].id;
      }
      setNotifications(newNotifs);
    } catch (error) {
      console.error("Gagal memuat notifikasi:", error);
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 10000);
    return () => clearInterval(intervalId);
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    try {
      await axios.put("/api/notifications/read");
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
    } catch (error) {
      console.error("Gagal menandai dibaca:", error);
    }
  };

const handleNotifClick = async (notif) => {
    setShowNotif(false); 
    
    // 1. OPTIMISTIC UPDATE: Ubah data di layar secara instan! Titik biru langsung hilang.
    setNotifications(prevNotifs => 
      prevNotifs.map(n => n.id === notif.id ? { ...n, is_read: 1 } : n)
    );

    // 2. Beritahu database di latar belakang (tanpa perlu ditunggu)
    try {
      await axios.put(`/api/notifications/${notif.id}/read`);
      // Kita hapus fetchNotifications() di sini supaya tidak bentrok
    } catch (err) {
      console.error("Gagal update read status:", err);
    }

    // 3. Navigasi ke halaman yang sesuai
    if (notif.type === 'user') {
      navigate('/admin/users', { state: { activeTab: 'pending' } });
    } else if (notif.type === 'doc') {
      navigate('/admin/documents');
    } else {
      navigate('/admin/dashboard');
    }
  };

  const handleLogoutClick = () => {
    setShowProfileMenu(false);
    setIsSidebarOpen(false); 
    setModal({
      isOpen: true,
      title: 'Konfirmasi Keluar',
      message: 'Yakin ingin keluar dari sistem? Sesi Anda akan diakhiri dan Anda harus login kembali.',
      onConfirm: executeLogout
    });
  };

  const executeLogout = () => {
    closePopup();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const activeMenuClass = "relative flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-bold border border-amber-200/50 dark:border-amber-500/30 shadow-[0_0_15px_rgba(251,191,36,0.08)] transition-all duration-300 group";
  const inactiveMenuClass = "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200 font-medium transition-all duration-300 border border-transparent";

  const hasUnread = notifications.some(n => n.is_read === 0 || n.is_read === false);
  const handleMenuClick = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0B1121] text-slate-900 dark:text-white transition-colors duration-500 overflow-hidden font-sans relative">
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 z-30 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <aside className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:w-[240px] w-[260px] flex flex-col bg-white dark:bg-[#090E17] border-r border-slate-200/80 dark:border-slate-800/60 z-40 shadow-2xl lg:shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none shrink-0 transition-transform duration-300 ease-in-out`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 mr-3 p-1">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-[1rem] font-black text-slate-900 dark:text-white tracking-tight leading-none mb-0.5">REPOSITORY</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <p className="text-[8px] font-black text-amber-500 dark:text-amber-400 tracking-[0.25em] uppercase">PBJT</p>
              </div>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <FiX size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Menu Utama</p>
          
          <NavLink to="/admin/dashboard" onClick={handleMenuClick} className={({ isActive }) => isActive ? activeMenuClass : inactiveMenuClass}>
            <FiGrid className="text-lg shrink-0" />
            <span className="tracking-wide">Dashboard</span>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-400 rounded-r-full hidden [[aria-current='page']_&]:block"></div>
          </NavLink>

          <NavLink to="/admin/documents" onClick={handleMenuClick} className={({ isActive }) => isActive ? activeMenuClass : inactiveMenuClass}>
            <FiFileText className="text-lg shrink-0" />
            <span className="tracking-wide">Kelola Dokumen</span>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-400 rounded-r-full hidden [[aria-current='page']_&]:block"></div>
          </NavLink>

          <NavLink to="/admin/users" onClick={handleMenuClick} className={({ isActive }) => isActive ? activeMenuClass : inactiveMenuClass}>
            <FiUsers className="text-lg shrink-0" />
            <span className="tracking-wide">Manajemen Pengguna</span>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-400 rounded-r-full hidden [[aria-current='page']_&]:block"></div>
          </NavLink>

          <NavLink to="/admin/settings" onClick={handleMenuClick} className={({ isActive }) => isActive ? activeMenuClass : inactiveMenuClass}>
            <FiSettings className="text-lg shrink-0" />
            <span className="tracking-wide">Pengaturan Sistem</span>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-400 rounded-r-full hidden [[aria-current='page']_&]:block"></div>
          </NavLink>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative min-w-0">
        
        <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 bg-white/70 dark:bg-[#0B1121]/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/60 z-20 shrink-0 transition-colors duration-500">
          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <FiMenu size={24} />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">E-Repository Admin</h2>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] md:text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Politeknik Baja Tegal</div>
            </div>
            <div className="sm:hidden font-black text-slate-900 dark:text-white">Admin PBJT</div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative hidden xl:block mr-2">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input type="text" placeholder="Cari dokumen..." className="w-56 bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 focus:border-amber-400 outline-none rounded-full py-2 pl-9 pr-4 text-xs text-slate-800 dark:text-white transition-all shadow-inner" />
            </div>

            <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center text-slate-600 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm">
              {isDarkMode ? <FiSun className="text-sm md:text-base" /> : <FiMoon className="text-sm md:text-base" />}
            </button>

            {/* PANEL NOTIFIKASI */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotif(!showNotif)} className={`w-8 h-8 md:w-9 md:h-9 rounded-full border flex items-center justify-center transition-all relative ${showNotif ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-500/20 dark:border-indigo-500/50 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                <FiBell className="text-sm md:text-base" />
                {hasUnread && <span className="absolute top-1 right-1 md:top-2 md:right-2 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-slate-800 animate-pulse"></span>}
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-3 w-72 md:w-80 bg-white dark:bg-[#131C31] rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-slate-800 overflow-hidden z-50 transform origin-top-right transition-all">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-[#0B1121]/50">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">Notifikasi</h3>
                    {hasUnread && (
                      <button onClick={markAllAsRead} className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors flex items-center gap-1">
                        <FiCheck /> Tandai Dibaca
                      </button>
                    )}
                  </div>
                  <div className="max-h-[300px] md:max-h-[320px] overflow-y-auto scrollbar-hide divide-y divide-slate-100 dark:divide-slate-800/50">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs">Tidak ada notifikasi baru.</div>
                    ) : (
                      notifications.map(notif => (
                        // 🔥 REVISI: TAMBAHKAN ONCLICK DAN STYLING GROUP 🔥
                        <div 
                          key={notif.id} 
                          onClick={() => handleNotifClick(notif)}
                          className={`p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group ${!notif.is_read ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : ''}`}
                        >
                          <div className={`w-8 h-8 md:w-9 md:h-9 shrink-0 rounded-full flex items-center justify-center text-sm md:text-base shadow-sm ${notif.type === 'doc' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : notif.type === 'user' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                            {notif.type === 'doc' ? <FiFileText /> : notif.type === 'user' ? <FiUserPlus /> : <FiInfo />}
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className={`text-[11px] md:text-xs mb-0.5 truncate group-hover:text-amber-500 transition-colors ${!notif.is_read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-200'}`}>
                              {notif.title}
                            </p>
                            <p className="text-[10px] md:text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-1.5">{notif.description}</p>
                          </div>
                          {!notif.is_read && <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* DROPDOWN PROFIL ADMIN */}
            <div className="relative border-l border-slate-200 dark:border-slate-800 pl-2 md:pl-5 ml-1 md:ml-0" ref={profileRef}>
              <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 md:gap-3 group outline-none focus:outline-none">
                <div className="text-right hidden sm:block">
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">Administrator</p>
                  <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Sistem Admin</p>
                </div>
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-black text-xs shadow-md border-2 border-transparent group-hover:border-amber-400 transition-all">AD</div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-4 w-48 bg-white dark:bg-[#131C31] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="py-2">
                    <Link to="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-amber-500 transition-colors">
                      <FiUser size={16} /> Profil Saya
                    </Link>
                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                    <button onClick={handleLogoutClick} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors text-left">
                      <FiLogOut size={16} /> Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* KONTEN UTAMA */}
        <div className="flex-1 overflow-y-auto scroll-smooth relative bg-slate-50 dark:bg-[#0B1121] transition-colors duration-500 w-full overflow-x-hidden">
          <div className="max-w-[1600px] mx-auto w-full">
             <Outlet />
          </div>
        </div>

      </div>

      {/* KOMPONEN POPUP LOGOUT */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#131C31] border border-slate-200 dark:border-slate-700 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
              <FiLogOut size={32} className="ml-1" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{modal.title}</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 px-2 leading-relaxed">{modal.message}</p>
            <div className="flex w-full gap-3">
              <button onClick={closePopup} className="flex-1 py-3 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Batal</button>
              <button onClick={modal.onConfirm} className="flex-1 py-3 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-all">Keluar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminLayout;