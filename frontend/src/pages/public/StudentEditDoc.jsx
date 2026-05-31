import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUploadCloud, FiFile, FiX, FiCheckCircle, FiUser, FiLink, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';

const StudentEditDoc = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '', 
    document_author: '', 
    year: '', 
    department: '',      
    category: '', 
    abstract: '', 
    keywords: '',
    external_url: '' 
  });

  // 🔥 FITUR LIMIT UKURAN FILE PER KATEGORI 🔥
  const categoryLimits = {
    'Tugas Akhir': 15,
    'Skripsi': 15,
    'Laporan Magang': 10,
    'Makalah': 5,
    'Artikel Ilmiah': 5,
    'Jurnal Akademik': 5,
    'default': 15
  };

  const validateFile = (file, category) => {
    const limitMB = categoryLimits[category] || categoryLimits['default'];
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > limitMB) {
      return `Ukuran file maksimal untuk kategori "${category || 'Dokumen'}" adalah ${limitMB}MB. (File Anda: ${sizeMB.toFixed(1)}MB)`;
    }
    return null;
  };

useEffect(() => {
    window.scrollTo(0, 0);
    
    // 🔥 1. AMBIL DATA AKUN TERBARU DARI LOKAL 🔥
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchDoc = async () => {
      try {
        const response = await axios.get(`/api/documents/${id}`);
        const doc = response.data;
        
        let extractedAbstract = doc.abstract || '';
        let extractedKeywords = '';
        if (extractedAbstract.includes('Kata Kunci: ')) {
          const parts = extractedAbstract.split('\n\nKata Kunci: ');
          extractedAbstract = parts[0];
          extractedKeywords = parts[1];
        }

        setFormData({
          title: doc.title || '',
          // 🔥 2. PAKSA GUNAKAN NAMA & PRODI DARI AKUN (Bukan dari dokumen lama) 🔥
          document_author: storedUser.name || doc.document_author || '',
          department: storedUser.department || doc.department || '',
          
          year: doc.year || '',
          category: doc.category || '',
          abstract: extractedAbstract,
          keywords: extractedKeywords,
          external_url: doc.external_url || doc.external_link || ''
        });
      } catch (error) {
        console.error('Gagal memuat data:', error);
        navigate('/dashboard-student');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchDoc();
  }, [id, navigate]);

  useEffect(() => {
    if (file && formData.category) {
      const sizeError = validateFile(file, formData.category);
      setError(sizeError || '');
    }
  }, [formData.category, file]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setError('Format file tidak didukung. Harap unggah PDF.');
      e.target.value = null;
      return;
    }

    const sizeError = validateFile(selectedFile, formData.category);
    if (sizeError) {
      setError(sizeError);
      e.target.value = null;
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (error) return; 

    setLoading(true);

    const finalAbstract = formData.keywords 
      ? `${formData.abstract}\n\nKata Kunci: ${formData.keywords}` 
      : formData.abstract;

    const updateData = new FormData();
    if (file) updateData.append('document_file', file); 
    
    updateData.append('title', formData.title);
    updateData.append('document_author', formData.document_author); 
    updateData.append('year', formData.year);
    updateData.append('department', formData.department); 
    updateData.append('category', formData.category);
    updateData.append('abstract', finalAbstract); 
    updateData.append('external_url', formData.external_url); 

    try {
      await axios.put(`/api/documents/${id}`, updateData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Biarkan loading sebentar untuk memutar animasi cantik
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        setTimeout(() => navigate('/dashboard-student'), 2000);
      }, 1000);

    } catch (err) {
      console.error('Gagal:', err);
      setError(err.response?.data?.message || 'Terjadi kesalahan server saat mengunggah dokumen.');
      setLoading(false);
    }
  };

  if (initialLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1121]">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-800 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 dark:border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] transition-colors duration-500 py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* HEADER SECTION */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Kirim Ulang Dokumen</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              Perbaiki data dokumen Anda dan unggah file revisi jika diperlukan.
            </p>
          </div>
          <button 
            type="button" 
            onClick={() => navigate('/dashboard-student')} 
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 dark:hover:text-yellow-400 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md w-fit"
          >
            <FiArrowLeft /> Batal & Kembali
          </button>
        </div>

        {/* NOTIFIKASI ERROR */}
        {error && (
          <div className="mb-6 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl flex items-start gap-3 font-medium animate-in fade-in slide-in-from-top-2">
            <FiAlertCircle className="text-xl shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* FORM UTAMA */}
        <div className="bg-white dark:bg-[#131C31] rounded-[2rem] shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <form onSubmit={handleSubmit} className="p-6 md:p-10 relative z-10">
            {/* AREA UPLOAD FILE */}
            <div className="mb-10">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Ganti File Dokumen (PDF) <span className="font-medium normal-case text-slate-400 ml-1">- Opsional</span></label>
              {!file ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-200 dark:border-slate-700 border-dashed rounded-2xl cursor-pointer bg-slate-50/50 dark:bg-[#0B1121]/50 hover:bg-blue-50/50 dark:hover:bg-slate-800/80 hover:border-blue-400 dark:hover:border-yellow-400/50 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <FiUploadCloud className="text-3xl text-slate-400 group-hover:text-blue-600 dark:group-hover:text-yellow-400 transition-colors" />
                    </div>
                    <p className="mb-1 text-sm text-slate-600 dark:text-slate-300 font-medium">
                      <span className="font-bold text-blue-600 dark:text-yellow-400">Klik di sini</span> jika ingin mengganti PDF lama.
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Biarkan kosong jika hanya revisi teks.</p>
                  </div>
                  <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="flex items-center justify-between p-4 bg-blue-50/80 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl shadow-sm transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center rounded-xl shadow-inner">
                      <FiFile className="text-2xl" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 dark:text-slate-200 truncate max-w-[200px] md:max-w-md">{file.name}</p>
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB - Akan menggantikan file lama</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setFile(null)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-xl transition-colors">
                    <FiX className="text-xl" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* KOLOM KIRI */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Judul Dokumen <span className="text-rose-500">*</span></label>
                  <input type="text" name="title" required value={formData.title} onChange={handleInputChange} placeholder="Contoh: Sistem Informasi Akademik..." 
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-yellow-400/10 focus:border-blue-500 dark:focus:border-yellow-400 outline-none text-sm font-bold text-slate-800 dark:text-white transition-all" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Nama Penulis</label>
                  <div className="relative">
                    <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" name="document_author" disabled value={formData.document_author} 
                      className="w-full pl-12 pr-5 py-3.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none text-sm font-bold text-slate-500 dark:text-slate-400 cursor-not-allowed italic" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Tahun Terbit <span className="text-rose-500">*</span></label>
                    <input type="number" name="year" required value={formData.year} onChange={handleInputChange} placeholder="2026" 
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-yellow-400/10 focus:border-blue-500 dark:focus:border-yellow-400 outline-none text-sm font-bold text-slate-800 dark:text-white transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Kategori <span className="text-rose-500">*</span></label>
                    <select name="category" required value={formData.category} onChange={handleInputChange} 
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-yellow-400/10 focus:border-blue-500 dark:focus:border-yellow-400 outline-none text-sm font-bold text-slate-800 dark:text-white cursor-pointer appearance-none transition-all">
                      <option value="" disabled className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Pilih...</option>
                      <option value="Tugas Akhir" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Tugas Akhir</option>
                      <option value="Laporan Magang" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Laporan Magang</option>
                      <option value="Makalah" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Makalah</option>
                      <option value="Artikel Ilmiah" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Artikel Ilmiah</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                    <FiLink className="text-sm" /> Tautan Eksternal <span className="font-medium normal-case text-slate-400">(Opsional)</span>
                  </label>
                  <input type="url" name="external_url" value={formData.external_url} onChange={handleInputChange} placeholder="https://jurnal.poltekbaja.ac.id/..." 
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-yellow-400/10 focus:border-blue-500 dark:focus:border-yellow-400 outline-none text-sm font-bold text-slate-800 dark:text-white transition-all" />
                </div>
              </div>

              {/* KOLOM KANAN */}
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Program Studi</label>
                  <input type="text" name="department" disabled value={formData.department || 'Prodi belum diatur'} 
                    className="w-full px-5 py-3.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl outline-none text-sm font-bold text-slate-500 dark:text-slate-400 cursor-not-allowed italic" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Abstrak / Deskripsi <span className="text-rose-500">*</span></label>
                  <textarea name="abstract" required value={formData.abstract} onChange={handleInputChange} rows="5" placeholder="Tuliskan ringkasan atau abstrak dokumen di sini..." 
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-yellow-400/10 focus:border-blue-500 dark:focus:border-yellow-400 outline-none text-sm font-bold text-slate-800 dark:text-white resize-none leading-relaxed transition-all"></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Kata Kunci (Keywords)</label>
                  <input type="text" name="keywords" value={formData.keywords} onChange={handleInputChange} placeholder="Pisahkan dengan koma (contoh: web, iot, mesin)" 
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-yellow-400/10 focus:border-blue-500 dark:focus:border-yellow-400 outline-none text-sm font-bold text-slate-800 dark:text-white transition-all" />
                </div>
              </div>
            </div>

            {/* BUTTON SUBMIT */}
            <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse md:flex-row justify-end gap-4">
              <button 
                type="button" 
                onClick={() => navigate('/dashboard-student')} 
                className="px-8 py-3.5 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors w-full md:w-auto text-center"
              >
                Batalkan
              </button>
              <button 
                type="submit" 
                disabled={loading || success} 
                className="bg-blue-600 hover:bg-blue-700 dark:bg-yellow-400 dark:hover:bg-yellow-500 text-white dark:text-slate-900 px-10 py-3.5 rounded-xl font-black shadow-lg shadow-blue-600/30 dark:shadow-yellow-400/20 transition-all flex items-center justify-center min-w-[220px] disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-1 w-full md:w-auto"
              >
                Kirim Revisi Dokumen
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* 🔥 POPUP LOADING & SUCCESS OVERLAY 🔥 */}
      {(loading || success) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#131C31] border border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-10 w-full max-w-sm shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300 relative overflow-hidden">
            
            {/* Dekorasi Cahaya di dalam Modal */}
            <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-50 ${success ? 'bg-emerald-400' : 'bg-blue-400 dark:bg-yellow-400'}`}></div>

            {loading && !success ? (
              <>
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 dark:border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-blue-600 dark:text-yellow-400">
                    <FiUploadCloud size={32} className="animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Mengirim Revisi...</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 px-2 leading-relaxed">
                  Mohon tunggu sebentar, dokumen sedang diperbarui ke server.
                </p>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <FiCheckCircle size={48} className="animate-in zoom-in duration-300 delay-150" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Berhasil Direvisi!</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 px-2 leading-relaxed">
                  Data berhasil diperbarui. Menunggu persetujuan ulang dari Admin.
                </p>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-full animate-pulse">
                  Mengalihkan halaman...
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentEditDoc;