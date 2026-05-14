import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiSearch, FiMonitor, FiSettings, FiTool, FiCpu, 
  FiFileText, FiArrowRight, FiBookOpen, FiLayers, 
  FiArchive, FiGrid, FiUserCheck
} from 'react-icons/fi';
import axios from 'axios';


const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentDocs, setRecentDocs] = useState([]);
  const [userData, setUserData] = useState(null);
  
  const [stats, setStats] = useState({
    total: 0, views: 0,
    prodi: { ti: 0, tm: 0, to: 0, te: 0 },
    kategori: { magang: 0, ta: 0, jurnal: 0, makalah: 0 } 
  });
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }

    const fetchPublicData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/documents');
        const allDocs = response.data || [];
        
        const docs = allDocs.filter(d => d.status && d.status.toLowerCase() === 'terbit');
        
        setRecentDocs(docs.slice(0, 4));
        const totalViews = docs.reduce((sum, doc) => sum + (doc.views || 0), 0);
        
        const ti = docs.filter(d => (d.department || '').toLowerCase().includes('informatika')).length;
        const tm = docs.filter(d => (d.department || '').toLowerCase().includes('mesin')).length;
        const to = docs.filter(d => (d.department || '').toLowerCase().includes('otomotif')).length;
        const te = docs.filter(d => (d.department || '').toLowerCase().includes('elektronika')).length;

        const magang = docs.filter(d => (d.category || '').toLowerCase().includes('magang')).length;
        const ta = docs.filter(d => (d.category || '').toLowerCase().includes('tugas akhir')).length;
        const jurnal = docs.filter(d => (d.category || '').toLowerCase().includes('jurnal')).length;
        const makalah = docs.filter(d => (d.category || '').toLowerCase().includes('makalah')).length;

        setStats({
          total: docs.length, views: totalViews,
          prodi: { ti, tm, to, te },
          kategori: { magang, ta, jurnal, makalah }
        });
      } catch (error) {
        console.error("Gagal mengambil data publik:", error);
      }
    };
    fetchPublicData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/documents?search=${searchQuery}`);
    }
  };

  const PillarCard = ({ title, desc, count, icon: Icon, filterKey, cardBg, iconWrapperClass, titleColor, borderClass, hoverShadow }) => (
    <Link to={`/documents?category=${filterKey}`} className={`p-6 md:p-8 rounded-[2.5rem] border-2 ${cardBg} backdrop-blur-md transition-all duration-500 group flex flex-col items-center text-center hover:-translate-y-2 ${borderClass} ${hoverShadow} relative overflow-hidden shadow-sm dark:shadow-none`}>
      <div className={`absolute -right-8 -bottom-8 text-black opacity-0 dark:opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500 z-0`}>
        <Icon className="text-[140px]" />
      </div>
      <div className={`w-16 h-16 rounded-[1.2rem] flex items-center justify-center text-3xl mb-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm ${iconWrapperClass} relative z-10`}>
        <Icon />
      </div>
      <h3 className={`text-xl font-bold mb-3 relative z-10 ${titleColor}`}>{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-8 leading-relaxed relative z-10 px-2">{desc}</p>
      <div className="mt-auto w-full pt-5 border-t border-black/5 dark:border-slate-700/50 flex justify-between items-center relative z-10">
        <span className={`text-sm font-bold ${titleColor}`}>{count} Koleksi</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 ${iconWrapperClass}`}>
          <FiArrowRight />
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-slate-900 transition-colors duration-300 font-sans relative">
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 pb-40 md:pt-32 md:pb-52 px-4 overflow-hidden border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <img 
          src="/wallpaper.png" 
          alt="Wallpaper" 
          className="absolute inset-0 w-full h-full object-cover z-0" 
        />
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/85 backdrop-blur-[2px] transition-colors duration-300 z-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0)_65%)] dark:hidden z-10 pointer-events-none"></div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#FAFAFA] dark:from-slate-900 to-transparent z-10 pointer-events-none transition-colors duration-300"></div>

        <div className="max-w-4xl mx-auto text-center relative z-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-md text-slate-800 dark:text-white border border-slate-200 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest mb-8 shadow-sm transition-colors">
            <FiGrid className="text-sm text-blue-600 dark:text-yellow-400" /> Ekosistem Perpustakaan Generasi Baru
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6 drop-shadow-sm transition-colors">
            Repository Digital <br className="hidden md:block" />
            <span className="text-blue-600 dark:text-yellow-400">Politeknik Baja Tegal</span>
          </h1>
          <p className="text-base md:text-xl text-slate-800 dark:text-slate-300 mb-12 max-w-3xl mx-auto font-bold leading-relaxed drop-shadow-sm transition-colors">
            Temukan koleksi karya ilmiah, jurnal, dan tugas akhir dalam satu suaka digital yang elegan dan mudah diakses.
          </p>
          
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group z-30 mb-4 md:mb-8">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-40">
              <FiSearch className="text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-yellow-500 text-lg transition-colors" />
            </div>
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Telusuri koleksi, penulis, atau kata kunci..." 
              className="w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 focus:border-blue-500 dark:focus:border-yellow-400 text-slate-900 dark:text-white pl-14 pr-20 py-4 rounded-full text-base shadow-xl outline-none font-bold transition-all placeholder:text-slate-500" 
            />
            {/* 🔥 MENGGUNAKAN PANAH (FiArrowRight) AGAR AMAN & MODERN 🔥 */}
            <button 
              type="submit" 
              className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-600 dark:bg-yellow-400 hover:bg-blue-700 dark:hover:bg-yellow-500 text-white dark:text-slate-900 rounded-full shadow-md transition-all flex items-center justify-center z-40 hover:scale-105"
              title="Mulai Penelusuran"
            >
              <FiArrowRight className="text-xl" />
            </button>
          </form>
        </div>
      </section>

      {/* --- KATEGORI --- */}
      <section className="py-12 bg-[#FAFAFA] dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative -mt-32 z-40">
            <PillarCard 
              title="Laporan Magang" filterKey="Magang" desc="Manajemen koleksi dan rekam jejak industri." count={stats.kategori.magang} icon={FiBookOpen} 
              cardBg="bg-emerald-50 dark:bg-slate-800/40" 
              iconWrapperClass="bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-md border border-white/20" 
              titleColor="text-emerald-700 dark:text-emerald-400" 
              borderClass="border-transparent hover:border-emerald-400 dark:border-emerald-500/40 dark:hover:border-emerald-400" 
              hoverShadow="hover:shadow-emerald-500/30" 
            />
            <PillarCard 
              title="Tugas Akhir" filterKey="Tugas Akhir" desc="Katalog karya penelitian inovatif mahasiswa." count={stats.kategori.ta} icon={FiLayers} 
              cardBg="bg-blue-50 dark:bg-slate-800/40" 
              iconWrapperClass="bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-md border border-white/20" 
              titleColor="text-blue-700 dark:text-blue-400" 
              borderClass="border-transparent hover:border-blue-400 dark:border-blue-500/40 dark:hover:border-blue-400" 
              hoverShadow="hover:shadow-blue-500/30" 
            />
            <PillarCard 
              title="Jurnal Akademik" filterKey="Jurnal" desc="Publikasi artikel ilmiah hasil riset." count={stats.kategori.jurnal} icon={FiArchive} 
              cardBg="bg-amber-50 dark:bg-slate-800/40" 
              iconWrapperClass="bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-md border border-white/20" 
              titleColor="text-amber-700 dark:text-amber-400" 
              borderClass="border-transparent hover:border-amber-400 dark:border-amber-500/40 dark:hover:border-amber-400" 
              hoverShadow="hover:shadow-amber-500/30" 
            />
            <PillarCard 
              title="Makalah" filterKey="Makalah" desc="Kumpulan referensi karya tulis ilmiah PBJT." count={stats.kategori.makalah} icon={FiFileText} 
              cardBg="bg-rose-50 dark:bg-slate-800/40" 
              iconWrapperClass="bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-md border border-white/20" 
              titleColor="text-rose-700 dark:text-rose-400" 
              borderClass="border-transparent hover:border-rose-400 dark:border-rose-500/40 dark:hover:border-rose-400" 
              hoverShadow="hover:shadow-rose-500/30" 
            />
          </div>
        </div>
      </section>

      {/* --- SOROTAN PRODI --- */}
      <section className="py-16 lg:py-20 bg-white dark:bg-slate-800 mt-8 rounded-[3rem] max-w-[95%] mx-auto transition-colors duration-300 relative z-20 shadow-sm border border-slate-100 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5">
              <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 leading-[1.1]">Sorotan Koleksi <br/><span className="text-blue-700 dark:text-yellow-400">Program Studi</span></h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 text-lg leading-relaxed">Jelajahi inovasi teknologi dan literatur akademik dari berbagai program studi spesialis di Politeknik Baja Tegal.</p>
              <div className="flex gap-10">
                <div><p className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">{stats.total}</p><p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">Total Koleksi</p></div>
                <div className="w-px h-16 bg-slate-200 dark:bg-slate-700"></div>
                <div><p className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">{stats.views}</p><p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">Total Tayangan</p></div>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { name: "D3 Teknik Informatika", exactName: "Teknik Informatika", code: "Informatika", count: stats.prodi.ti, icon: FiMonitor, gradient: "bg-gradient-to-b from-blue-500 to-blue-600 shadow-md shadow-blue-500/30 border border-white/20", hoverText: "group-hover:text-blue-500", hoverBorder: "hover:border-blue-400 dark:hover:border-blue-500" },
                  { name: "D3 Teknik Mesin", exactName: "Teknik Mesin", code: "Mesin", count: stats.prodi.tm, icon: FiSettings, gradient: "bg-gradient-to-b from-emerald-500 to-emerald-600 shadow-md shadow-emerald-500/30 border border-white/20", hoverText: "group-hover:text-emerald-500", hoverBorder: "hover:border-emerald-400 dark:hover:border-emerald-500" },
                  { name: "D3 Teknik Otomotif", exactName: "Teknik Otomotif", code: "Otomotif", count: stats.prodi.to, icon: FiTool, gradient: "bg-gradient-to-b from-rose-500 to-rose-600 shadow-md shadow-rose-500/30 border border-white/20", hoverText: "group-hover:text-rose-500", hoverBorder: "hover:border-rose-400 dark:hover:border-rose-500" },
                  { name: "D3 Teknik Elektronika", exactName: "Teknik Elektronika", code: "Elektronika", count: stats.prodi.te, icon: FiCpu, gradient: "bg-gradient-to-b from-amber-500 to-amber-600 shadow-md shadow-amber-500/30 border border-white/20", hoverText: "group-hover:text-amber-500", hoverBorder: "hover:border-amber-400 dark:hover:border-amber-500" }
                ].map((prodi, idx) => (
                  <Link key={idx} to={`/documents?prodi=${prodi.exactName}`} className={`flex flex-col p-6 bg-white dark:bg-[#1E293B] rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group border border-slate-100 dark:border-slate-700/50 ${prodi.hoverBorder}`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center text-white group-hover:scale-110 transition-transform ${prodi.gradient}`}>
                        <prodi.icon className="text-2xl" />
                      </div>
                      <span className="font-black text-slate-100 dark:text-white/20 text-4xl">{prodi.count}</span>
                    </div>
                    <div>
                      <h4 className={`font-bold text-slate-800 dark:text-white text-lg transition-colors ${prodi.hoverText}`}>{prodi.name}</h4>
                      <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mt-1">{prodi.code}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- BARU DITAMBAHKAN --- */}
      <section className="pt-12 pb-12 md:pt-16 md:pb-12 bg-[#FAFAFA] dark:bg-slate-900 transition-colors duration-300 relative z-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div><h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Baru Ditambahkan</h2><p className="text-slate-500 dark:text-slate-400 font-medium">Koleksi ilmiah terbaru yang sudah terbit.</p></div>
            <Link to="/documents" className="hidden md:flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-yellow-400 font-bold transition-colors">Lihat Semua <FiArrowRight /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentDocs.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 dark:text-slate-500 font-medium border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-white dark:bg-slate-800">Belum ada dokumen yang dipublikasikan.</div>
            ) : (
              recentDocs.map((doc, i) => (
                <Link key={i} to={`/detail/${doc.id}`} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group flex gap-5 items-start border border-slate-100 dark:border-slate-700">
                  <div className="w-14 h-14 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 dark:group-hover:bg-yellow-400 group-hover:text-white dark:group-hover:text-slate-900 transition-colors shrink-0"><FiFileText className="text-2xl" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2"><span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{doc.category}</span><span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span><span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{doc.year}</span></div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-snug mb-1 group-hover:text-blue-600 dark:group-hover:text-yellow-400 transition-colors line-clamp-2">{doc.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-1">{doc.document_author || 'Anonim'}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-16 md:py-20 bg-slate-900 relative overflow-hidden rounded-t-[3rem] mx-2 md:mx-4 z-20">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">{userData ? `Selamat Datang Kembali!` : 'Siap Memulai Perjalanan Anda?'}</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto font-medium">{userData ? 'Mari lanjutkan eksplorasi literatur dan temukan referensi terbaik hari ini.' : 'Bergabunglah dengan komunitas akademik kami dan dapatkan akses penuh ke literatur digital PBJT.'}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!userData ? (
              <><Link to="/login" className="w-full sm:w-auto bg-blue-600 dark:bg-yellow-400 hover:bg-blue-700 dark:hover:bg-yellow-500 text-white dark:text-slate-900 font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 shadow-lg"><FiUserCheck className="text-xl" /> Buat Akun / Masuk</Link>
              <Link to="/documents" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white backdrop-blur-md font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all">Jelajahi sebagai Tamu</Link></>
            ) : (
              <Link to="/documents" className="w-full sm:w-auto bg-blue-600 dark:bg-yellow-400 hover:bg-blue-700 dark:hover:bg-yellow-500 text-white dark:text-slate-900 font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-transform hover:-translate-y-1 shadow-lg"><FiGrid className="text-xl" /> Lanjutkan Eksplorasi</Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;