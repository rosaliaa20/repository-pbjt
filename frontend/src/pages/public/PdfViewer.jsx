import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiBookmark, FiShield, FiGlobe, FiRefreshCw } from 'react-icons/fi';
import axios from 'axios';

const PdfViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?.id; 
  const isAdmin = user && user.role === 'admin';

  const [docDetail, setDocDetail] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isProtected, setIsProtected] = useState(false);
  
  // URL untuk memanggil PDF publik secara langsung
  const fullPublicPdfUrl = `${window.location.origin}/api/documents/preview/${id}/document.pdf`;
  const [iframeKey, setIframeKey] = useState(0); // Untuk memaksa muat ulang iframe

  useEffect(() => {
    const fetchDocDetail = async () => {
      try {
        const response = await axios.get(`/api/documents/${id}`);
        setDocDetail(response.data);
      } catch (error) {
        console.error("Gagal memuat detail dokumen:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocDetail();

    if (userId) {
      const savedBookmarks = JSON.parse(localStorage.getItem(`bookmarks_${userId}`)) || [];
      setIsBookmarked(savedBookmarks.includes(id));
    }
  }, [id, userId]);

  const handleBookmark = () => {
    if (!userId) return;
    const savedBookmarks = JSON.parse(localStorage.getItem(`bookmarks_${userId}`)) || [];
    if (isBookmarked) {
      const updatedBookmarks = savedBookmarks.filter(docId => docId !== id);
      localStorage.setItem(`bookmarks_${userId}`, JSON.stringify(updatedBookmarks));
      setIsBookmarked(false);
    } else {
      savedBookmarks.push(id);
      localStorage.setItem(`bookmarks_${userId}`, JSON.stringify(savedBookmarks));
      setIsBookmarked(true);
    }
  };

  // Proteksi Keamanan
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && (e.key === 'c' || e.key === 'p' || e.key === 's')) {
        e.preventDefault();
        setIsProtected(true);
        setTimeout(() => setIsProtected(false), 2000);
      }
      if (e.key === 'PrintScreen') {
        setIsProtected(true);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('Hak Cipta Dilindungi - Politeknik Baja Tegal').catch(() => {});
        }
        setTimeout(() => setIsProtected(false), 3000); 
      }
    };
    const handleWindowBlur = () => setIsProtected(true);
    const handleWindowFocus = () => setIsProtected(false);
    
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  const handleContextMenu = (e) => e.preventDefault();

  return (
    <div className="fixed inset-0 z-[999] bg-[#1a1c1e] flex flex-col font-sans overflow-hidden">
      <style>{`@media print { body { display: none !important; } }`}</style>

      {/* --- TOOLBAR ATAS --- */}
      <div className="h-14 bg-[#2b2d31] text-white flex items-center justify-between px-4 md:px-6 border-b border-black/50 shadow-lg shrink-0 z-50">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <Link to={`/detail/${id}`} className="p-2 hover:bg-white/10 rounded-full transition shrink-0">
            <FiArrowLeft className="text-xl" />
          </Link>
          <div className="hidden md:block min-w-0">
            <h1 className="font-bold text-sm truncate max-w-[200px] lg:max-w-md">
              {docDetail?.title || "Membaca Dokumen..."}
            </h1>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <FiShield /> Proteksi Aktif
            </p>
          </div>
        </div>

        {/* INFO PENAMPIL */}
        <div className="flex items-center gap-2 md:gap-4 bg-black/20 px-3 py-1.5 rounded-lg shrink-0 border border-white/5">
           <span className="text-xs md:text-sm font-semibold text-white/80 flex items-center gap-2">
             <FiGlobe className="text-blue-400" /> Google Docs Engine
           </span>
        </div>

        {/* TOMBOL AKSI */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <button onClick={() => setIframeKey(k => k + 1)} className="hidden md:flex text-[10px] md:text-xs font-bold px-3 py-1.5 rounded items-center gap-1.5 transition-colors bg-white/5 text-white/80 hover:bg-white/20" title="Muat Ulang Dokumen">
            <FiRefreshCw /> <span className="hidden lg:inline">Muat Ulang</span>
          </button>
          
          <a href={`https://docs.google.com/gview?url=${encodeURIComponent(fullPublicPdfUrl)}`} target="_blank" rel="noreferrer" className="hidden md:flex text-[10px] md:text-xs font-bold px-3 py-1.5 rounded items-center gap-1.5 transition-colors bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 border border-blue-500/30">
            <FiGlobe /> <span className="hidden lg:inline">Layar Penuh Google</span>
          </a>

          {user && (
            <button onClick={handleBookmark} className={`text-[10px] md:text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${isBookmarked ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>
              <FiBookmark className={isBookmarked ? "fill-current" : ""} /> <span className="hidden md:inline">{isBookmarked ? 'Tersimpan' : 'Simpan'}</span>
            </button>
          )}
          {isAdmin && (
            <button onClick={() => window.open(`/api/documents/preview/${id}`, '_blank')} className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] md:text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors">
              <FiDownload /> <span className="hidden md:inline">Unduh</span>
            </button>
          )}
        </div>
      </div>

      {/* --- AREA UTAMA GOOGLE VIEWER --- */}
      <div className="relative flex-1 w-full h-full bg-[#1a1c1e] select-none" onContextMenu={handleContextMenu}>
        <div className={`w-full h-full flex flex-col transition-all duration-200 ${isProtected ? 'blur-2xl opacity-10 pointer-events-none overflow-hidden' : ''}`}>
          
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20 bg-[#1a1c1e]">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium text-white animate-pulse">Menyiapkan Dokumen...</span>
            </div>
          )}
          
          {/* Iframe 100% Layar Tanpa Batas */}
          <div className="relative w-full h-full flex flex-col">
             <iframe 
               key={iframeKey}
               src={`https://docs.google.com/gview?url=${encodeURIComponent(fullPublicPdfUrl)}&embedded=true`} 
               className="w-full h-full flex-1 border-0 bg-white"
               title="Google Docs Viewer"
             />
             
             {/* WATERMARK OVERLAY FOR GOOGLE VIEWER */}
             <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden mix-blend-multiply">
                <img src="/logo.png" alt="Logo PBT" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] md:w-[60%] max-w-[500px] h-auto object-contain grayscale opacity-[0.02]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 1500 1500" className="w-full h-full opacity-[0.10]" preserveAspectRatio="xMidYMid meet">
                    <g transform="translate(750, 750) rotate(-45)">
                      <text textAnchor="middle" y="-80" fontSize="110" className="font-black uppercase fill-slate-950" style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Politeknik Baja Tegal</text>
                      <text textAnchor="middle" y="20" fontSize="65" className="font-bold uppercase fill-slate-900" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Repository Digital</text>
                      <text textAnchor="middle" y="140" fontSize="90" className="font-extrabold uppercase fill-rose-900" style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.25em' }}>View Only</text>
                    </g>
                  </svg>
                </div>
             </div>
          </div>
        </div>

        {/* OVERLAY KEAMANAN */}
        {isProtected && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-3xl pointer-events-none">
            <div className="bg-rose-600/90 backdrop-blur-md text-white px-8 py-6 rounded-[2rem] shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200 border border-rose-500/50">
              <FiShield className="text-6xl mb-4 animate-bounce" />
              <h3 className="text-2xl font-black mb-2">Proteksi Aktif</h3>
              <p className="text-sm font-medium opacity-90 text-center">Layar disembunyikan untuk melindungi hak cipta.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;