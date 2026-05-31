import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  FiSearch, FiFileText, FiBookOpen, FiArrowRight, FiInfo, FiFilter,
  FiLayers, FiArchive, FiAward, FiBook, FiClipboard, FiEdit, FiEye
} from 'react-icons/fi';
import axios from 'axios';
import { motion } from 'framer-motion';

const Documents = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialQuery = searchParams.get('search') || '';
  const initialProdi = searchParams.get('prodi') || '';
  const initialCategory = searchParams.get('category') || '';

  const [allDocs, setAllDocs] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [selectedDept, setSelectedDept] = useState(initialProdi);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchDocuments = async () => {
      try {
        const response = await axios.get('/api/documents');
        const docs = response.data || [];
        
        // FILTER: Hanya ambil dokumen yang statusnya 'Terbit'
        const publishedDocs = docs.filter(d => d.status && d.status.toLowerCase() === 'terbit');
        
        setAllDocs(publishedDocs);
      } catch (error) {
        console.error("Gagal mengambil data dokumen:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  useEffect(() => {
    let result = allDocs;

    if (searchInput) {
      const lowerQuery = searchInput.toLowerCase();
      result = result.filter(doc => 
        (doc.title && doc.title.toLowerCase().includes(lowerQuery)) ||
        (doc.category && doc.category.toLowerCase().includes(lowerQuery)) ||
        (doc.department && doc.department.toLowerCase().includes(lowerQuery)) ||
        (doc.document_author && doc.document_author.toLowerCase().includes(lowerQuery))
      );
    }

    if (selectedDept) {
      result = result.filter(doc => 
        doc.department && doc.department.toLowerCase().includes(selectedDept.toLowerCase())
      );
    }

    if (selectedCategory) {
      result = result.filter(doc => 
        doc.category && doc.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    setFilteredDocs(result);
  }, [allDocs, searchInput, selectedDept, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput) {
      setSearchParams({ search: searchInput });
    } else {
      setSearchParams({});
    }
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSelectedDept('');
    setSelectedCategory('');
    setSearchParams({});
  };

  // 🔥 FUNGSI BANTUAN UNTUK MEMBUAT "COVER VIRTUAL" BERDASARKAN KATEGORI 🔥
  const getCategoryStyle = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('tugas akhir')) return { icon: FiLayers, bg: 'from-blue-500 to-indigo-600', text: 'text-blue-600 dark:text-blue-400' };
    if (cat.includes('magang')) return { icon: FiBookOpen, bg: 'from-emerald-400 to-teal-500', text: 'text-emerald-600 dark:text-emerald-400' };
    if (cat.includes('makalah')) return { icon: FiFileText, bg: 'from-rose-400 to-pink-600', text: 'text-rose-600 dark:text-rose-400' };
    if (cat.includes('artikel')) return { icon: FiEdit, bg: 'from-indigo-400 to-purple-500', text: 'text-indigo-600 dark:text-indigo-400' };
    if (cat.includes('jurnal')) return { icon: FiArchive, bg: 'from-amber-400 to-orange-500', text: 'text-amber-600 dark:text-amber-400' };
    if (cat.includes('penelitian')) return { icon: FiAward, bg: 'from-purple-500 to-fuchsia-600', text: 'text-purple-600 dark:text-purple-400' };
    if (cat.includes('buku')) return { icon: FiBook, bg: 'from-teal-400 to-emerald-600', text: 'text-teal-600 dark:text-teal-400' };
    if (cat.includes('modul')) return { icon: FiClipboard, bg: 'from-orange-400 to-red-500', text: 'text-orange-600 dark:text-orange-400' };
    return { icon: FiFileText, bg: 'from-slate-400 to-slate-600', text: 'text-slate-600 dark:text-slate-400' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-slate-900 transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-slate-900 dark:border-t-yellow-400 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse">Memuat etalase koleksi digital...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 font-sans pb-24 transition-colors duration-300 relative">
      
      {/* HEADER PENCARIAN (DYNAMIC THEME) */}
      <section className="relative pt-24 pb-32 md:pt-32 md:pb-40 px-4 overflow-hidden border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <img src="/wallpaper.png" alt="Wallpaper" className="absolute inset-0 w-full h-full object-cover z-0" />
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/85 backdrop-blur-[2px] transition-colors duration-300 z-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0)_65%)] dark:hidden z-10 pointer-events-none"></div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#F8FAFC] dark:from-slate-900 to-transparent z-10 pointer-events-none transition-colors duration-300"></div>

        <div className="max-w-4xl mx-auto relative z-20 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight transition-colors duration-300">
            Koleksi Dokumen
          </h1>
          <p className="text-slate-800 dark:text-slate-300 text-sm md:text-lg max-w-2xl mx-auto mb-10 transition-colors duration-300 leading-relaxed font-bold">
            Telusuri dan temukan referensi akademik Politeknik Baja Tegal yang telah resmi dipublikasikan.
          </p>

          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto group z-30">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-40">
              <FiSearch className="text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-yellow-500 text-lg transition-colors" />
            </div>
            <input 
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari judul, penulis, atau kata kunci..." 
              className="w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 focus:border-blue-500 dark:focus:border-yellow-400 text-slate-900 dark:text-white pl-14 pr-20 py-4 rounded-full text-base shadow-xl outline-none transition-all placeholder:text-slate-500 font-bold relative z-30"
            />
            <button 
              type="submit"
              className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-600 dark:bg-yellow-400 hover:bg-blue-700 dark:hover:bg-yellow-500 text-white dark:text-slate-900 rounded-full shadow-md transition-all flex items-center justify-center z-40 hover:scale-105"
            >
              <FiArrowRight className="text-xl" />
            </button>
          </form>
        </div>
      </section>

      {/* AREA UTAMA */}
      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-30">
        
        {/* BARIS FILTER */}
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md py-3 px-5 rounded-[1.25rem] shadow-md border border-slate-200/80 dark:border-slate-700 mb-10 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-300">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 w-full md:w-auto">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 dark:text-slate-500">
              <FiFilter />
            </div>
            <span>Menampilkan <span className="font-black text-slate-900 dark:text-white">{filteredDocs.length}</span> koleksi</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
            <select 
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold py-2.5 px-4 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-yellow-400 cursor-pointer transition-colors"
            >
              <option value="" className="bg-white dark:bg-slate-800">Semua Program Studi</option>
              <option value="Teknik Informatika" className="bg-white dark:bg-slate-800">Teknik Informatika</option>
              <option value="Teknik Mesin" className="bg-white dark:bg-slate-800">Teknik Mesin</option>
              <option value="Teknik Otomotif" className="bg-white dark:bg-slate-800">Teknik Otomotif</option>
              <option value="Teknik Elektronika" className="bg-white dark:bg-slate-800">Teknik Elektronika</option>
            </select>

            {/* 🔥 FILTER KATEGORI YANG SUDAH DIPERBARUI 🔥 */}
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold py-2.5 px-4 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-yellow-400 cursor-pointer transition-colors"
            >
              <option value="" className="bg-white dark:bg-slate-800">Semua Kategori</option>
              <option value="Tugas Akhir" className="bg-white dark:bg-slate-800">Tugas Akhir</option>
              <option value="Magang" className="bg-white dark:bg-slate-800">Laporan Magang</option>
              <option value="Makalah" className="bg-white dark:bg-slate-800">Makalah</option>
              <option value="Artikel" className="bg-white dark:bg-slate-800">Artikel Ilmiah</option>
              <option value="Jurnal" className="bg-white dark:bg-slate-800">Jurnal Akademik</option>
              <option value="Penelitian" className="bg-white dark:bg-slate-800">Hasil Penelitian</option>
              <option value="Buku Ajar" className="bg-white dark:bg-slate-800">Buku Ajar</option>
              <option value="Modul Ajar" className="bg-white dark:bg-slate-800">Modul Ajar</option>
            </select>

            {(searchInput || selectedDept || selectedCategory) && (
              <button 
                onClick={clearAllFilters}
                className="text-xs font-bold text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 px-4 py-2.5 rounded-xl transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-500/30"
              >
                Hapus Filter
              </button>
            )}
          </div>
        </div>

        {/* 🔥 TAMPILAN GRID CARDS ALA UNPAD 🔥 */}
        {filteredDocs.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-16 text-center rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center transition-colors">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-500 mb-6">
              <FiInfo className="text-5xl" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Koleksi Tidak Ditemukan</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">Coba gunakan kata kunci lain atau hapus filter untuk melihat seluruh katalog kami.</p>
            <button onClick={clearAllFilters} className="mt-8 bg-slate-900 dark:bg-yellow-400 text-white dark:text-slate-900 font-bold px-8 py-3 rounded-xl hover:scale-105 transition-all shadow-lg">
              Tampilkan Semua
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredDocs.map((doc, i) => {
              const style = getCategoryStyle(doc.category);
              const CoverIcon = style.icon;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  key={i}
                >
                  <Link 
                    to={`/detail/${doc.id}`} 
                    className="flex flex-col h-full bg-white dark:bg-[#1E293B] rounded-[2rem] p-4 shadow-sm hover:shadow-2xl hover:-translate-y-2 border border-slate-100 dark:border-slate-700/50 transition-all duration-300 group overflow-hidden"
                  >
                    {/* COVER VIRTUAL */}
                    <div className={`w-full aspect-[4/3] rounded-[1.5rem] bg-gradient-to-br ${style.bg} flex items-center justify-center mb-5 relative overflow-hidden shadow-inner`}>
                      <CoverIcon className="text-white/30 text-[80px] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      <span className="absolute bottom-3 left-3 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/30">
                        {doc.category || 'Dokumen'}
                      </span>
                    </div>

                    {/* DETAIL DOKUMEN */}
                    <div className="px-2 flex-1 flex flex-col">
                      <h3 className="font-black text-slate-800 dark:text-white text-lg leading-snug mb-2 group-hover:text-blue-600 dark:group-hover:text-yellow-400 transition-colors line-clamp-2">
                        {doc.title}
                      </h3>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-1 mb-4">
                        {doc.document_author || 'Penulis Anonim'}
                      </p>
                      
                      <div className="mt-auto border-t border-slate-100 dark:border-slate-700 pt-4 flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500">
                        <span className="truncate max-w-[60%]">{doc.department?.replace('Teknik ', 'T. ')}</span>
                        <div className="flex items-center gap-3">
                          <span>{doc.year || '-'}</span>
                          <span className="flex items-center gap-1"><FiEye /> {doc.views || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default Documents;