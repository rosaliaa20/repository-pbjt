import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FiArrowLeft, FiFileText, FiEye, 
  FiInfo, FiUser, FiCalendar, FiFolder, FiCopy
} from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';

const DocumentDetail = () => {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const isViewCounted = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0); 

    const fetchDocumentDetail = async () => {
      try {
        const response = await axios.get(`/api/documents/${id}`);
        let currentDocData = response.data;

        const viewedDocs = JSON.parse(localStorage.getItem('viewed_docs')) || [];
        
        if (!viewedDocs.includes(id) && !isViewCounted.current) {
          isViewCounted.current = true; 
          
          viewedDocs.push(id);
          localStorage.setItem('viewed_docs', JSON.stringify(viewedDocs));

          await axios.post(`/api/documents/${id}/view`).catch(e => console.log("Abaikan error API jika ada", e));
          
          currentDocData.views = (currentDocData.views || 0) + 1;
        }

        setDoc(currentDocData);

      } catch (err) {
        console.error("Gagal mengambil detail:", err);
        setError('Dokumen tidak ditemukan atau terjadi kesalahan server.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentDetail();
  }, [id]);
  
  const handleCopyCitation = async () => {
    if (!doc) return;
    
    const toTitleCase = (str) => {
      if (!str) return '';
      return str.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
      );
    };
    
    const author = toTitleCase(doc.document_author || 'Anonim');
    const title = toTitleCase(doc.title || 'Tanpa Judul');
    const category = toTitleCase(doc.category || 'Karya Ilmiah');
    const year = doc.year || new Date().getFullYear();
    const currentUrl = window.location.href; 
    
    const plainText = `${author}. (${year}). ${title} [${category}, Politeknik Baja Tegal]. PBJT E-Repository. ${currentUrl}`;
    const htmlText = `${author}. (${year}). <i>${title}</i> [${category}, Politeknik Baja Tegal]. PBJT E-Repository. <a href="${currentUrl}">${currentUrl}</a>`;
    
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const clipboardItem = new ClipboardItem({
          'text/plain': new Blob([plainText], { type: 'text/plain' }),
          'text/html': new Blob([htmlText], { type: 'text/html' })
        });
        await navigator.clipboard.write([clipboardItem]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }
      
      Swal.fire({
        toast: true,
        position: 'bottom-center', 
        icon: 'success',
        title: 'Sitasi disalin',
        showConfirmButton: false,
        timer: 2000,
        width: 'auto',
        padding: '0.4em 1.2em',
        background: window.document.documentElement.classList.contains('dark') ? '#1E293B' : '#ffffff',
        color: window.document.documentElement.classList.contains('dark') ? '#ffffff' : '#0F172A',
        customClass: {
          popup: 'rounded-full shadow-lg border border-slate-200 dark:border-slate-700 mb-6',
          title: 'text-sm font-bold m-0 p-0',
        }
      });

    } catch (err) {
      console.error("Gagal menyalin sitasi:", err);
      await navigator.clipboard.writeText(plainText).catch(e => console.error(e));
      Swal.fire({
        toast: true, position: 'bottom-center', icon: 'error',
        title: 'Gagal menyalin', showConfirmButton: false, timer: 2000, width: 'auto', padding: '0.4em 1.2em',
        customClass: { popup: 'rounded-full shadow-lg mb-6', title: 'text-sm font-bold' }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B1121] transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-800 border-t-blue-600 dark:border-t-amber-400 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse">Memuat metadata dokumen...</p>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B1121] transition-colors duration-300">
        <FiInfo className="text-6xl text-rose-400 dark:text-rose-500 mb-4" />
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Dokumen Tidak Ditemukan</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
        <Link to="/documents" className="bg-blue-600 hover:bg-blue-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-900 px-6 py-2.5 rounded-xl font-bold transition-colors">Kembali ke Pencarian</Link>
      </div>
    );
  }

  const isPending = doc.status?.toLowerCase() === 'pending';

  return (
    <div className="min-h-screen pt-24 bg-slate-50 dark:bg-[#0B1121] font-sans pb-20 transition-colors duration-300">
      
      <div className="bg-white dark:bg-[#131C31] border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/documents" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-amber-400 font-bold transition-colors">
            <FiArrowLeft className="text-xl" /> Kembali ke Pencarian
          </Link>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 font-black text-[10px] uppercase tracking-widest rounded-md border ${
              isPending 
                ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20' 
                : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20'
            }`}>
              {doc.status || 'Terbit'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* KOLOM KIRI (UTAMA) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Header Dokumen */}
            <div className="bg-white dark:bg-[#131C31] p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-500/20">
                  {doc.category || 'Dokumen Akademik'}
                </span>
                <span className="text-slate-400 dark:text-slate-500 text-sm font-medium flex items-center gap-1">
                  <FiCalendar /> {doc.year || '-'}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white leading-tight mb-6 transition-colors">
                {doc.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 transition-colors">
                    <FiUser />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Penulis Utama</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {doc.document_author ? doc.document_author.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()) : 'Anonim'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 transition-colors">
                    <FiFolder />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Program Studi</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{doc.department || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Abstrak */}
            <div className="bg-white dark:bg-[#131C31] p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-300">
              <h2 className="text-xl font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <FiFileText className="text-blue-500 dark:text-amber-400" /> Abstrak / Ringkasan
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                {doc.abstract || doc.description ? (
                  <p>{doc.abstract || doc.description}</p>
                ) : (
                  <p className="italic text-slate-400 dark:text-slate-500">
                    Abstrak untuk dokumen ini belum tersedia di dalam sistem repository. Silakan unduh dokumen fisik (PDF) untuk membaca keseluruhan isi penelitian, latar belakang, metodologi, dan kesimpulan dari karya ilmiah ini.
                  </p>
                )}
              </div>
            </div>

            {/* Detail Tabel */}
            <div className="bg-white dark:bg-[#131C31] p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors duration-300">
              <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6">Informasi Detail</h2>
              <div className="overflow-hidden border border-slate-200 dark:border-slate-700/50 rounded-xl">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <th className="w-1/3 px-4 py-3 bg-slate-50 dark:bg-slate-800/30 font-bold text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-700/50">ID Repository</th>
                      <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-300">PBJT-REPO-{doc.id?.toString().padStart(4, '0')}</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <th className="w-1/3 px-4 py-3 bg-slate-50 dark:bg-slate-800/30 font-bold text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-700/50">Tipe Dokumen</th>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{doc.category || '-'}</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <th className="w-1/3 px-4 py-3 bg-slate-50 dark:bg-slate-800/30 font-bold text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-700/50">Tanggal Upload</th>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{doc.created_at ? new Date(doc.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* KOLOM KANAN (SIDEBAR - STICKY) */}
          <div className="lg:col-span-4">
            
            <div className="bg-white dark:bg-[#131C31] p-5 sm:p-6 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 sticky top-28 transition-colors duration-300">
              
              {/* Box Ilustrasi Dokumen */}
              <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl mb-6 flex flex-col items-center justify-center border border-slate-300 dark:border-slate-700 border-dashed relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-600/5 dark:bg-amber-400/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <FiFileText className="text-5xl sm:text-6xl text-slate-300 dark:text-slate-600 mb-2 group-hover:text-blue-400 dark:group-hover:text-amber-400 transition-colors" />
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Format PDF</span>
              </div>

              {/* Box Statistik View */}
              <div className="flex items-center justify-center text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 mb-6 px-2 bg-slate-50 dark:bg-slate-800/50 py-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50 transition-colors">
                <span className="flex items-center gap-2">
                  <FiEye className="text-lg text-blue-500 dark:text-amber-400" /> 
                  <span className="text-slate-700 dark:text-slate-300">{doc.views || 0}</span> Kali Dilihat
                </span>
              </div>

              {/* Tombol Baca Dokumen */}
              <div className="mb-6">
                <Link 
                  to={`/viewer/${doc.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 dark:shadow-amber-500/20 text-sm"
                >
                  <FiEye className="text-lg" /> Baca Dokumen Lengkap
                </Link>
              </div>

              {/* 🔥 REVISI: FITUR SITASI DIPINDAHKAN KE SINI 🔥 */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-col gap-3 mb-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Kutip Dokumen</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Format APA Style (Edisi ke-7)</p>
                  </div>
                  <button 
                    onClick={handleCopyCitation}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold transition-colors border border-indigo-100 dark:border-indigo-500/20"
                  >
                    <FiCopy size={15} /> Salin Sitasi
                  </button>
                </div>
                
                {/* Visual Preview Sitasi dalam Sidebar */}
                <div className="bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 shadow-inner">
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-serif text-justify">
                    {doc.document_author ? doc.document_author.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()) : 'Anonim'}. ({doc.year || new Date().getFullYear()}). <span className="italic">{doc.title ? doc.title.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()) : 'Tanpa Judul'}</span> [{doc.category ? doc.category.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()) : 'Karya Ilmiah'}, Politeknik Baja Tegal]. PBJT E-Repository. <a href={window.location.href} className="text-blue-500 hover:underline break-all">{window.location.href}</a>
                  </p>
                </div>
              </div>

              {/* Teks Hak Cipta */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[9px] text-center text-slate-400 dark:text-slate-500 leading-relaxed font-medium">
                  Penggunaan dokumen ini tunduk pada aturan hak cipta Politeknik Baja Tegal. Dilarang memperbanyak tanpa mencantumkan sumber sitasi yang valid.
                </p>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;