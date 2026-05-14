import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiSearch, FiFileText, FiBookOpen, FiArrowRight, FiInfo, FiFilter } from 'react-icons/fi';
import axios from 'axios';


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
        const response = await axios.get('http://localhost:5000/api/documents');
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-slate-900 transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 border-t-slate-900 dark:border-t-yellow-400 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse">Memuat koleksi digital...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 font-sans pb-24 transition-colors duration-300 relative">
      
      {/* HEADER PENCARIAN (DYNAMIC THEME) */}
      <section className="relative pt-24 pb-32 md:pt-32 md:pb-40 px-4 overflow-hidden border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        
        {/* GAMBAR WALLPAPER */}
        <img 
          src="/wallpaper.png" 
          alt="Wallpaper" 
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        
        {/* OVERLAY DINAMIS */}
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/85 backdrop-blur-[2px] transition-colors duration-300 z-10"></div>
        
        {/* 🔥 CAHAYA MEMUSAT (RADIAL GLOW) KHUSUS MODE TERANG 🔥 */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0)_65%)] dark:hidden z-10 pointer-events-none"></div>
        
        {/* GRADIEN BAWAH */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#F8FAFC] dark:from-slate-900 to-transparent z-10 pointer-events-none transition-colors duration-300"></div>

        {/* KONTEN HEADER */}
        <div className="max-w-4xl mx-auto relative z-20 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight transition-colors duration-300">
            Koleksi Dokumen
          </h1>
          <p className="text-slate-800 dark:text-slate-300 text-sm md:text-lg max-w-2xl mx-auto mb-10 transition-colors duration-300 leading-relaxed font-bold">
            Telusuri dan temukan berbagai referensi akademik Politeknik Baja Tegal yang telah resmi dipublikasikan.
          </p>

          {/* 🔥 FORM PENCARIAN (MODERN CIRCULAR BUTTON) 🔥 */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto group z-30">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-40">
              <FiSearch className="text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-yellow-500 text-lg transition-colors" />
            </div>
            
            <input 
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Ketik kata kunci, judul, penulis, atau kategori..." 
              // pr-20 agar teks tidak menabrak tombol bulat
              className="w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 focus:border-blue-500 dark:focus:border-yellow-400 text-slate-900 dark:text-white pl-14 pr-20 py-4 rounded-full text-base shadow-xl outline-none transition-all placeholder:text-slate-500 font-bold relative z-30"
            />
            
            {/* Tombol Bulat Panah Kanan */}
            <button 
              type="submit"
              className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-600 dark:bg-yellow-400 hover:bg-blue-700 dark:hover:bg-yellow-500 text-white dark:text-slate-900 rounded-full shadow-md transition-all flex items-center justify-center z-40 hover:scale-105"
              title="Cari"
            >
              <FiArrowRight className="text-xl" />
            </button>
          </form>
        </div>
      </section>

      {/* AREA UTAMA */}
      <div className="max-w-5xl mx-auto px-4 -mt-12 relative z-30">
        
        {/* BARIS FILTER (SLEEK & RAMPING) */}
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md py-3 px-5 rounded-[1.25rem] shadow-md border border-slate-200/80 dark:border-slate-700 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-300">
          
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 w-full md:w-auto">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-400 dark:text-slate-500">
              <FiFilter />
            </div>
            <span>Menampilkan <span className="font-black text-slate-900 dark:text-white">{filteredDocs.length}</span> hasil terbit</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
            <select 
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold py-2 px-4 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-yellow-400 cursor-pointer transition-colors"
            >
              <option value="" className="bg-white dark:bg-slate-800">Semua Prodi</option>
              <option value="Teknik Informatika" className="bg-white dark:bg-slate-800">Teknik Informatika</option>
              <option value="Teknik Mesin" className="bg-white dark:bg-slate-800">Teknik Mesin</option>
              <option value="Teknik Otomotif" className="bg-white dark:bg-slate-800">Teknik Otomotif</option>
              <option value="Teknik Elektronika" className="bg-white dark:bg-slate-800">Teknik Elektronika</option>
            </select>

            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold py-2 px-4 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-yellow-400 cursor-pointer transition-colors"
            >
              <option value="" className="bg-white dark:bg-slate-800">Semua Kategori</option>
              <option value="Magang" className="bg-white dark:bg-slate-800">Laporan Magang</option>
              <option value="Jurnal" className="bg-white dark:bg-slate-800">Jurnal Akademik</option>
              <option value="Tugas Akhir" className="bg-white dark:bg-slate-800">Tugas Akhir</option>
              <option value="Makalah" className="bg-white dark:bg-slate-800">Makalah</option>
            </select>

            {(searchInput || selectedDept || selectedCategory) && (
              <button 
                onClick={clearAllFilters}
                className="text-xs font-bold text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-500/30"
              >
                Hapus Filter
              </button>
            )}
          </div>
        </div>

        {/* DAFTAR DOKUMEN */}
        <div className="space-y-4">
          {filteredDocs.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center transition-colors">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-500 mb-4">
                <FiInfo className="text-4xl" />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">Dokumen Tidak Ditemukan</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">Tidak ada koleksi terbit yang cocok dengan filter Anda.</p>
              <button onClick={clearAllFilters} className="mt-6 bg-slate-900 dark:bg-slate-700 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-colors text-sm">
                Tampilkan Semua
              </button>
            </div>
          ) : (
            filteredDocs.map((doc, i) => (
              <Link key={i} to={`/detail/${doc.id}`} className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-lg border border-slate-100 dark:border-slate-700 hover:border-blue-100 dark:hover:border-slate-500 hover:-translate-y-1 transition-all group flex flex-col md:flex-row gap-6 md:items-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600/50 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-400 group-hover:bg-slate-900 dark:group-hover:bg-yellow-400 group-hover:text-yellow-400 dark:group-hover:text-slate-900 transition-colors shrink-0">
                  <FiFileText className="text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-800 dark:text-white text-lg md:text-xl mb-2 group-hover:text-blue-600 dark:group-hover:text-yellow-400 transition-colors line-clamp-2">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-3 line-clamp-2">
                    Ditulis oleh <b className="text-slate-700 dark:text-slate-200">{doc.document_author || 'Anonim'}</b>.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"><FiBookOpen /> {doc.category || 'Dokumen'}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                    <span>{doc.department || 'PBJT'}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                    <span>Tahun {doc.year || '-'}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                    <span>{doc.views || 0} Tayangan</span>
                  </div>
                </div>
                <div className="hidden md:flex shrink-0 w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-700 items-center justify-center text-slate-400 group-hover:bg-blue-600 dark:group-hover:bg-yellow-400 group-hover:text-white dark:group-hover:text-slate-900 transition-colors">
                  <FiArrowRight />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;