import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiClock, FiCheckCircle, FiFileText, FiBookmark, 
  FiEye, FiAlertCircle, FiEdit2, FiInfo, FiX, FiCheck 
} from 'react-icons/fi';
import axios from 'axios';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [myDocs, setMyDocs] = useState([]);
  const [bookmarkedDocs, setBookmarkedDocs] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  const [activeTab, setActiveTab] = useState('upload');

  // STATE UNTUK MODAL REVIEW ALA DICODING
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    doc: null
  });

  const closeReviewModal = () => setReviewModal({ isOpen: false, doc: null });

  useEffect(() => {
    window.scrollTo(0, 0);
    const initialUser = JSON.parse(localStorage.getItem('user'));
    
    if (!initialUser) {
      navigate('/login');
      return;
    }

    const loadDashboardData = async () => {
      try {
        let activeUser = initialUser; 
        
        // 1. Sinkronisasi Profil dengan "Cache Buster"
        try {
          const userRes = await axios.get(`/api/auth/users/${initialUser.id}?t=${new Date().getTime()}`);
          const freshUser = userRes.data;
          activeUser = { ...initialUser, name: freshUser.name, role: freshUser.role, department: freshUser.department };
          
          if (JSON.stringify(initialUser) !== JSON.stringify(activeUser)) {
            localStorage.setItem('user', JSON.stringify(activeUser));
          }
        } catch (err) { console.error("Gagal sinkron profil:", err); }

        setUser(activeUser); // Update UI Profil secara live!

        // 2. Sinkronisasi Dokumen dengan "Cache Buster"
        const docRes = await axios.get(`/api/documents?t=${new Date().getTime()}`);
        const allDocs = docRes.data;
        
        const filteredUploads = allDocs.filter(doc => doc.document_author === activeUser.name);
        setMyDocs(filteredUploads);

        const savedBookmarkIds = JSON.parse(localStorage.getItem(`bookmarks_${activeUser.id}`)) || [];
        const filteredBookmarks = allDocs.filter(doc => savedBookmarkIds.includes(String(doc.id)));
        setBookmarkedDocs(filteredBookmarks);

      } catch (error) {
        console.error("Gagal memuat dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    // Jalankan saat tab pertama kali dimuat
    loadDashboardData();

    // 🔥 JURUS PAMUNGKAS: Jalankan ulang otomatis setiap kali tab di-klik/difokuskan! 🔥
    window.addEventListener('focus', loadDashboardData);

    // Bersihkan sensor saat user pindah rute
    return () => {
      window.removeEventListener('focus', loadDashboardData);
    };
  }, [navigate]);

  const formatCategory = (category) => {
    if (!category) return 'Tugas Akhir';
    const lowerCat = category.toLowerCase();
    if (lowerCat === 'magang') return 'Laporan Magang';
    if (lowerCat === 'pkl') return 'Laporan PKL';
    return category; 
  };

return (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans pb-20 relative transition-colors">
    
    {/* HEADER SECTION */}
    <section className="relative pt-[88px] md:pt-[96px] pb-16 px-4 overflow-hidden border-b border-slate-200 dark:border-slate-800">
      <img
        src="/wallpaper.png"
        alt="Wallpaper"
        className="absolute inset-0 w-full h-full object-cover opacity-10 z-0"
      />

      <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/70 backdrop-blur-sm z-10"></div>

      <div className="max-w-5xl mx-auto relative z-20">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
          {/* 🔥 Pastikan user ada sebelum di split 🔥 */}
          Halo, {user?.name ? user.name.split(' ')[0] : 'Pengguna'}!
        </h1>

        <p className="text-slate-600 dark:text-slate-400 font-medium">
          Kelola karya ilmiah Anda dan pantau status validasinya.
        </p>
      </div>
    </section>

      {/* KONTEN UTAMA */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-30">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-700">
          
          {/* TAB NAVIGASI */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'upload' 
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-yellow-400 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <FiClock className="text-lg" /> Riwayat Upload
              </button>
              <button
                onClick={() => setActiveTab('bookmark')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'bookmark' 
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <FiBookmark className="text-lg" /> Koleksi Tersimpan
              </button>
            </div>
          </div>

          {/* LOADING STATE */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500 font-medium">Memuat data Anda...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: RIWAYAT UPLOAD */}
              {activeTab === 'upload' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {myDocs.length === 0 ? (
                    <div className="py-16 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                      <FiFileText className="mx-auto text-5xl text-slate-300 dark:text-slate-600 mb-4" />
                      <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Belum ada dokumen</h3>
                      <p className="text-slate-500 text-sm mb-6">Anda belum pernah mengunggah karya ilmiah.</p>
                      <button onClick={() => navigate('/upload')} className="bg-blue-600 dark:bg-yellow-400 text-white dark:text-slate-900 px-6 py-2.5 rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-blue-500/20">
                        Mulai Unggah
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="pb-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Judul Dokumen</th>
                            <th className="pb-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest">Kategori</th>
                            <th className="pb-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                            <th className="pb-4 px-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {myDocs.map((doc, index) => {
                            const status = doc.status ? doc.status.toLowerCase() : 'pending';
                            const isPending = status === 'pending';
                            const isRevisi = status === 'revisi' || status === 'ditolak' || status === 'rejected';
                            const isTerbit = status === 'terbit' || status === 'approved';

                            return (
                              <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="py-5 px-4">
                                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">{doc.title}</p>
                                  <p className="text-xs text-slate-500 mt-1">{doc.year}</p>
                                </td>
                                <td className="py-5 px-4 text-sm font-bold text-slate-600 dark:text-slate-400">
                                  {formatCategory(doc.category)}
                                </td>
                                <td className="py-5 px-4 text-center">
                                  {isTerbit && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-200 dark:border-emerald-500/20">
                                      <FiCheckCircle size={12} /> Terbit
                                    </span>
                                  )}
                                  {isRevisi && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest border border-rose-200 dark:border-rose-500/20">
                                      <FiAlertCircle size={12} /> Revisi
                                    </span>
                                  )}
                                  {isPending && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-200 dark:border-amber-500/20">
                                      <FiClock size={12} /> Menunggu
                                    </span>
                                  )}
                                </td>
                                <td className="py-5 px-4 text-right">
                                  {isRevisi ? (
                                    <button 
                                      onClick={() => setReviewModal({ isOpen: true, doc: doc })}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 rounded-lg text-xs font-bold transition-all shadow-sm"
                                    >
                                      <FiInfo size={12} /> Detail Review
                                    </button>
                                  ) : isPending ? (
                                    <button 
                                      onClick={() => navigate(`/edit-upload/${doc.id}`)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800/50 rounded-lg text-xs font-bold transition-all shadow-sm"
                                    >
                                      <FiEdit2 size={12} /> Edit Draft
                                    </button>
                                  ) : (
                                    <span className="text-xs text-slate-400 dark:text-slate-600 italic">Selesai</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: KOLEKSI TERSIMPAN (BOOKMARKS) */}
              {activeTab === 'bookmark' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {bookmarkedDocs.length === 0 ? (
                    <div className="py-16 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                      <FiBookmark className="mx-auto text-5xl text-slate-300 dark:text-slate-600 mb-4" />
                      <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Koleksi Kosong</h3>
                      <p className="text-slate-500 text-sm mb-6">Anda belum menyimpan referensi apa pun.</p>
                      <button onClick={() => navigate('/documents')} className="bg-emerald-600 dark:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-emerald-500/20">
                        Eksplorasi Dokumen
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bookmarkedDocs.map((doc, index) => (
                        <div key={index} className="flex flex-col p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">
                              {formatCategory(doc.category)}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">
                              {doc.year}
                            </span>
                          </div>
                          
                          <h3 className="text-base font-bold text-slate-800 dark:text-white leading-snug mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                            {doc.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-5 line-clamp-1">
                            Oleh: {doc.document_author || 'Anonim'}
                          </p>
                          
                          <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <Link 
                              to={`/detail/${doc.id}`} 
                              className="text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              Lihat Detail
                            </Link>
                            <Link 
                              to={`/viewer/${doc.id}`} 
                              className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-slate-700 hover:text-emerald-700 dark:text-slate-200 dark:hover:text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                            >
                              <FiEye /> Baca Ulang
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* MODAL DETAIL REVIEW */}
      {reviewModal.isOpen && reviewModal.doc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#131C31] w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/60">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Hasil Review Dokumen</h2>
                <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-1">{reviewModal.doc.title}</p>
              </div>
              <button onClick={closeReviewModal} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 rounded-full transition-colors shrink-0">
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-transparent">
              
              <div className="mb-8 p-6 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-center text-sm font-bold text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-widest">Aktivitas Terbaru</h3>
                
                <div className="flex items-center justify-between relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-700 z-0 rounded-full"></div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-1 bg-emerald-500 z-0 rounded-full"></div>

                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
                      <FiCheck strokeWidth={3} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Upload</span>
                  </div>

                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
                      <FiCheck strokeWidth={3} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Direview</span>
                  </div>

                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30 ring-4 ring-white dark:ring-[#131C31]">
                      <FiX strokeWidth={3} />
                    </div>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Revisi</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200/60 dark:border-amber-500/20 rounded-2xl overflow-hidden">
                <div className="bg-amber-100/50 dark:bg-amber-500/10 px-5 py-3 border-b border-amber-200/60 dark:border-amber-500/20 flex items-center gap-2">
                  <FiAlertCircle className="text-amber-600 dark:text-amber-400" />
                  <span className="font-bold text-sm text-amber-800 dark:text-amber-300">Catatan Perbaikan dari Admin</span>
                </div>
                <div className="p-5">
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {reviewModal.doc.rejection_reason || "Tidak ada rincian catatan yang diberikan. Mohon periksa kembali format dokumen Anda secara umum."}
                  </p>

                  {reviewModal.doc.rejection_assets && (
                    <div className="mt-4 pt-4 border-t border-amber-200/50 dark:border-amber-500/20">
                      <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2">Dokumentasi Kesalahan:</p>
                      <a 
                        href={`/${reviewModal.doc.rejection_assets}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-all shadow-md shadow-indigo-500/20 group w-max"
                      >
                        <FiEye className="group-hover:scale-110 transition-transform" /> Lihat Detail Disini
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800/60 bg-white dark:bg-[#131C31] flex flex-col sm:flex-row justify-end gap-3">
              <button 
                onClick={closeReviewModal}
                className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors w-full sm:w-auto text-center"
              >
                Tutup Peringatan
              </button>
              <button 
                onClick={() => navigate(`/edit-upload/${reviewModal.doc.id}`)}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <FiEdit2 /> Perbaiki Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

  </div>
);
};

export default StudentDashboard;