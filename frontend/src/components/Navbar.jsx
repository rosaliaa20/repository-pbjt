import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiMenu, FiX, FiHome, FiSearch, FiLogIn, 
  FiUser, FiLogOut, FiMoon, FiSun, FiUploadCloud, FiExternalLink 
} from 'react-icons/fi';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  
  // 🔥 STATE BARU UNTUK DROPDOWN PROFIL 🔥
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser));
    }

    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Tutup dropdown jika klik di luar area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setIsOpen(false);
    setShowProfileMenu(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Beranda', path: '/', icon: FiHome, external: false },
    { name: 'Koleksi Dokumen', path: '/documents', icon: FiSearch, external: false },
  ];

  if (isLoggedIn) {
    navLinks.push({ name: 'Unggah Karya', path: '/upload', icon: FiUploadCloud, external: false });
  }

  const externalLink = { name: 'Situs Utama PBJT', path: 'https://pbjt.ac.id/', icon: FiExternalLink, external: true };

  return (
    <nav className="fixed w-full z-50 transition-all duration-300 bg-white/70 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 md:h-20">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-transparent dark:bg-white p-1 rounded-lg transition-transform group-hover:scale-105">
                <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-slate-800 dark:text-white font-black text-[11px] tracking-wider leading-tight uppercase">
                  Politeknik Baja Tegal <br/>
                  <span className="text-blue-600 dark:text-yellow-400 font-bold">Repository</span>
                </h1>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-bold transition-all ${
                  location.pathname === link.path
                    ? 'text-blue-600 dark:text-yellow-400 bg-blue-50/50 dark:bg-slate-800/50'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <link.icon size={15} />
                {link.name}
              </Link>
            ))}

            <a 
              href={externalLink.path} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              <externalLink.icon size={15} />
              {externalLink.name}
            </a>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-3"></div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-400 dark:text-yellow-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              {isDarkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {/* Auth Section - DROPDOWN PROFIL */}
            {isLoggedIn ? (
              <div className="relative ml-2" ref={profileRef}>
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-[13px] font-bold transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[11px] shadow-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span>{user?.name?.split(' ')[0]}</span>
                </button>
                
                {/* Isi Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#131C31] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-2">
                      <Link 
                        to={user?.role === 'admin' ? '/admin' : '/dashboard-student'} 
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-blue-600 dark:hover:text-yellow-400 transition-colors"
                      >
                        <FiHome size={16} /> 
                        {/* 🔥 Logika Perubahan Teks Dinamis 🔥 */}
                        {user?.role === 'admin' ? 'Panel Admin' : 'Dashboard & Riwayat'}
                      </Link>
                      <Link 
                        to="/profile" 
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-blue-600 dark:hover:text-yellow-400 transition-colors"
                      >
                        <FiUser size={16} /> Pengaturan Akun
                      </Link>
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors text-left"
                      >
                        <FiLogOut size={16} /> Keluar Sistem
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/login"
                className="ml-2 px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-[13px] font-bold hover:opacity-90 transition-all"
              >
                Masuk
              </Link>
            )}
          </div>

          {/* Mobile Button */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 dark:text-white">
              {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-[#0B1121] border-t border-slate-200 dark:border-slate-800 p-4 shadow-xl">
          <div className="space-y-1 mb-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${
                  location.pathname === link.path 
                    ? 'text-blue-600 dark:text-yellow-400 bg-blue-50/50 dark:bg-slate-800/50' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <link.icon size={18} /> {link.name}
              </Link>
            ))}
            <a 
              href={externalLink.path}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <externalLink.icon size={18} /> {externalLink.name}
            </a>
          </div>

          <div className="h-px bg-slate-200 dark:bg-slate-800 my-4"></div>

          {/* Mobile Auth & Theme Section */}
          <div className="space-y-2">
            <button 
              onClick={toggleTheme} 
              className="w-full flex items-center gap-3 p-3 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              {isDarkMode ? <><FiSun size={18}/> Mode Terang</> : <><FiMoon size={18}/> Mode Gelap</>}
            </button>

            {isLoggedIn ? (
              <>
                <Link 
                  to={user?.role === 'admin' ? '/admin' : '/dashboard-student'} 
                  onClick={() => setIsOpen(false)} 
                  className="flex items-center gap-3 p-3 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  <FiHome size={18} className="text-blue-600 dark:text-yellow-400" /> 
                  {/* 🔥 Logika Perubahan Teks Dinamis 🔥 */}
                  {user?.role === 'admin' ? 'Panel Admin' : 'Dashboard & Riwayat'}
                </Link>
                <Link 
                  to="/profile" 
                  onClick={() => setIsOpen(false)} 
                  className="flex items-center gap-3 p-3 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  <FiUser size={18} className="text-blue-600 dark:text-yellow-400" /> 
                  Pengaturan Akun
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-rose-500 font-bold hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                >
                  <FiLogOut size={18} /> Keluar Sistem
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)} 
                className="flex items-center justify-center gap-2 mt-2 p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-all shadow-md"
              >
                <FiLogIn size={18} /> Masuk / Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;