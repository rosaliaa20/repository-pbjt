import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiZoomIn, FiZoomOut, FiArrowLeft, FiLock, FiDownload, FiBookmark, FiShield, FiSearch } from 'react-icons/fi';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;

// --- KOMPONEN LAZY PAGE UNTUK MENGHEMAT MEMORI DI IOS ---
const LazyPage = ({ pageNumber, scale, pdfWidth }) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Jika halaman masuk ke dalam viewport (terlihat di layar) atau mendekatinya
        setIsVisible(entry.isIntersecting);
      },
      // rootMargin 800px berarti halaman mulai di-render 800px sebelum benar-benar muncul di layar
      { rootMargin: '800px 0px' } 
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Estimasi tinggi halaman (A4 ratio = 1.414) untuk mencegah loncatan scrollbar saat kanvas dihancurkan
  const estimatedHeight = pdfWidth ? pdfWidth * 1.414 : 800;

  return (
    <div 
      ref={containerRef} 
      id={`pdf-page-${pageNumber}`} 
      className="shadow-[0_2px_5px_rgba(0,0,0,0.3)] bg-white relative overflow-hidden flex justify-center items-center"
      style={{ minHeight: `${estimatedHeight}px`, width: pdfWidth ? `${pdfWidth}px` : '100%' }}
    >
      {isVisible ? (
        <Page 
          pageNumber={pageNumber} 
          scale={scale} 
          width={pdfWidth} 
          renderTextLayer={false} 
          renderAnnotationLayer={false} 
          loading={<div className="animate-pulse text-slate-400 font-mono text-sm py-20">Memuat Hal {pageNumber}...</div>}
        />
      ) : (
        <div className="text-slate-300 font-mono text-xs py-20">Menunggu Render Hal {pageNumber}</div>
      )}

      {/* WATERMARK */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <img src="/logo.png" alt="Logo PBT" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] md:w-[70%] max-w-[600px] h-auto object-contain grayscale opacity-[0.05]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 1500 1500" className="w-full h-full opacity-[0.16]" preserveAspectRatio="xMidYMid meet">
            <g transform="translate(750, 750) rotate(-45)">
              <text textAnchor="middle" y="-80" fontSize="110" className="font-black uppercase fill-slate-950" style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Politeknik Baja Tegal</text>
              <text textAnchor="middle" y="20" fontSize="65" className="font-bold uppercase fill-slate-900" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Repository Digital</text>
              <text textAnchor="middle" y="140" fontSize="90" className="font-extrabold uppercase fill-rose-900" style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.25em' }}>View Only</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};


const PdfViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?.id; 
  const isAdmin = user && user.role === 'admin';

  const [docDetail, setDocDetail] = useState(null); 
  const [numPages, setNumPages] = useState(null);
  const [jumpPage, setJumpPage] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isProtected, setIsProtected] = useState(false);
  
  const [scale, setScale] = useState(window.innerWidth < 768 ? 1 : 1.3); 
  const [pdfWidth, setPdfWidth] = useState(window.innerWidth < 768 ? window.innerWidth - 32 : null);

  useEffect(() => {
    const handleResize = () => {
      setPdfWidth(window.innerWidth < 768 ? window.innerWidth - 32 : null);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchDocDetail = async () => {
      try {
        const response = await axios.get(`/api/documents/${id}`);
        setDocDetail(response.data);
      } catch (error) {
        console.error("Gagal memuat detail dokumen:", error);
      }
    };
    fetchDocDetail();
    setPdfUrl(`/api/documents/preview/${id}`);

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

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const handleJumpToPage = (e) => {
    e.preventDefault();
    const pageTarget = parseInt(jumpPage);
    if (pageTarget >= 1 && pageTarget <= numPages) {
      const element = document.getElementById(`pdf-page-${pageTarget}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setJumpPage(''); 
  };

  return (
    <div className="fixed inset-0 z-[999] bg-[#323639] flex flex-col font-sans">
      <style>{`@media print { body { display: none !important; } }`}</style>

      {/* --- TOOLBAR ATAS --- */}
      <div className="h-14 bg-[#323639] text-white flex items-center justify-between px-4 md:px-6 border-b border-black/30 shadow-md shrink-0 z-50">
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

        {/* NAVIGASI HALAMAN */}
        <div className="flex items-center gap-2 md:gap-4 bg-black/20 px-3 py-1 rounded-lg shrink-0 border border-white/5">
          <form onSubmit={handleJumpToPage} className="flex items-center gap-2">
            <FiSearch className="text-white/50 hidden md:block" size={14} />
            <input 
              type="number" min="1" max={numPages || 1} value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              placeholder="Hal"
              className="w-10 md:w-12 bg-black/30 text-white text-xs md:text-sm font-mono text-center rounded border border-transparent focus:border-blue-500 focus:bg-black/50 focus:outline-none py-0.5 placeholder:text-white/30 transition-all"
            />
            <span className="text-xs md:text-sm font-mono font-medium text-white/50">/ {numPages || '-'}</span>
          </form>
          <div className="hidden md:block w-px h-5 bg-white/10 mx-1"></div>
          <button onClick={() => setScale(scale - 0.2)} disabled={scale <= 0.6} className="hidden md:block p-1.5 hover:bg-white/10 rounded-full disabled:opacity-30 transition"><FiZoomOut className="text-base" /></button>
          <span className="hidden md:block text-xs font-mono w-10 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(scale + 0.2)} disabled={scale >= 2.5} className="hidden md:block p-1.5 hover:bg-white/10 rounded-full disabled:opacity-30 transition"><FiZoomIn className="text-base" /></button>
        </div>

        {/* TOMBOL AKSI */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {user && (
            <button onClick={handleBookmark} className={`text-[10px] md:text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${isBookmarked ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>
              <FiBookmark className={isBookmarked ? "fill-current" : ""} /> <span className="hidden md:inline">{isBookmarked ? 'Tersimpan' : 'Simpan'}</span>
            </button>
          )}
          {isAdmin && (
            <button onClick={() => window.open(pdfUrl, '_blank')} className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] md:text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors">
              <FiDownload /> <span className="hidden md:inline">Unduh</span>
            </button>
          )}
        </div>
      </div>

      {/* --- AREA UTAMA VIEWER PDF --- */}
      <div className="relative flex-1 overflow-auto bg-[#525659] select-none scroll-smooth" onContextMenu={handleContextMenu}>
        <div className={`w-full min-h-full flex flex-col items-center py-6 gap-3 transition-all duration-200 ${isProtected ? 'blur-2xl opacity-10 pointer-events-none overflow-hidden' : ''}`}>
          
          {loading && (
            <div className="text-white mt-20 flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium animate-pulse">Merender Dokumen...</span>
            </div>
          )}
          
          <div className="relative w-fit mx-auto">
            {pdfUrl && (
              <Document
                file={pdfUrl} 
                onLoadSuccess={onDocumentLoadSuccess}
                loading=""
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <LazyPage 
                    key={`lazy-page-${index + 1}`}
                    pageNumber={index + 1}
                    scale={scale}
                    pdfWidth={pdfWidth}
                  />
                ))}
              </Document>
            )}
          </div>
        </div>

        {/* OVERLAY KEAMANAN */}
        {isProtected && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-3xl pointer-events-none">
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