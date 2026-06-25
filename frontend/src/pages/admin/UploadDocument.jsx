import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUploadCloud, FiFile, FiX, FiCheckCircle, FiUser, FiLink, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';

const UploadDocument = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // 🔥 KONFIGURASI LIMIT SIZE PER KATEGORI (Dalam MB) 🔥
  const categoryLimits = {
    'Tugas Akhir': 15,
    'Skripsi': 15,
    'Laporan Magang': 10,
    'Makalah': 5,
    'Artikel Ilmiah': 5,
    'Jurnal Akademik': 5,
    'Hasil Penelitian': 10,
    'Buku Ajar': 15,
    'Modul Ajar': 5,
    'default': 15
  };

  const [formData, setFormData] = useState({
    title: '',
    document_author: '',
    year: new Date().getFullYear().toString(),
    category: '',
    department: '',
    abstract: '',
    keywords: '',
    external_link: '',
  });

  const returnPath = user?.role === 'admin' ? '/admin/documents' : '/dashboard-student';

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.role !== 'admin') {
        setFormData(prev => ({ ...prev, document_author: parsedUser.name }));
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Validasi Ukuran File (Bisa dipanggil kapanpun)
  const validateFile = (file, category) => {
    const limitMB = categoryLimits[category] || categoryLimits['default'];
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > limitMB) {
      return `Ukuran file maksimal untuk kategori "${category || 'Dokumen'}" adalah ${limitMB}MB. (File Anda: ${sizeMB.toFixed(1)}MB)`;
    }
    return null;
  };

  // 🔥 Watch Perubahan Kategori (Jika user ganti kategori setelah pilih file)
  useEffect(() => {
    if (file && formData.category) {
      const sizeError = validateFile(file, formData.category);
      setError(sizeError || '');
    }
  }, [formData.category, file]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
    if (!file) return setError('File PDF wajib diunggah!');
    if (error) return; // Mencegah submit jika ada error ukuran

    setLoading(true);

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('document_author', formData.document_author || user?.name || 'Anonim');
    submitData.append('year', formData.year);
    submitData.append('category', formData.category);
    submitData.append('department', formData.department);
    submitData.append('abstract', formData.keywords ? `${formData.abstract}\n\nKata Kunci: ${formData.keywords}` : formData.abstract);
    submitData.append('external_link', formData.external_link);
    submitData.append('document_file', file);

    try {
      await axios.post('/api/documents/upload', submitData);
      
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate(returnPath), 2000);
    } catch (err) {
      setError('Gagal mengunggah dokumen: ' + (err.response?.data?.message || 'Server Error'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] py-20 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto font-sans pb-24">
        
        {/* HEADER SECTION */}
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Unggah Karya Ilmiah</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Tambahkan dokumen baru ke Repository Digital PBJT dengan detail lengkap.</p>
          </div>
          <button onClick={() => navigate(returnPath)} className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg md:bg-transparent md:px-0 md:py-0 flex items-center gap-2">
            <FiArrowLeft /> Batal & Kembali
          </button>
        </div>

        {/* ERROR BOX */}
        {error && (
          <div className="mb-6 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 text-rose-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-pulse">
            <FiAlertCircle className="text-xl shrink-0" /> {error}
          </div>
        )}

        {/* SUCCESS MESSAGE */}
        {success && (
          <div className="mb-6 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl flex items-center gap-3 font-medium animate-pulse transition-colors">
            <FiCheckCircle className="text-xl shrink-0" /> Dokumen berhasil diunggah! Mengalihkan...
          </div>
        )}

        {/* FORM CONTAINER (Struktur 2-Kolom Persis EditDoc.jsx) */}
        <div className="bg-white dark:bg-[#131C31] rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
          <form onSubmit={handleSubmit} className="p-5 md:p-8 relative">
            
            {/* UPLOAD FILE SECTION */}
            <div className="mb-8 md:mb-10">
              <label className="block text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                File Dokumen (PDF) <span className="text-rose-500">*</span>
              </label>
              {!file ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 dark:border-slate-700 border-dashed rounded-2xl cursor-pointer bg-slate-50 dark:bg-[#0B1121] hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:border-amber-300 dark:hover:border-amber-500/50 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                    <FiUploadCloud className="text-3xl text-slate-400 dark:text-slate-500 group-hover:text-amber-500 mb-2 transition-colors shrink-0" />
                    <p className="mb-1 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium px-4">Klik atau seret file PDF ke sini untuk mengunggah.</p>
                    <p className="text-[10px] md:text-xs text-blue-600 dark:text-blue-400 font-bold group-hover:underline mt-1">Pilih File PDF</p>
                  </div>
                  <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
                </label>
              ) : (
                <div className="flex items-center justify-between p-3 md:p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-amber-500 text-white flex items-center justify-center rounded-lg shrink-0">
                      <FiFile className="text-xl" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
                      <p className="text-[10px] md:text-xs text-amber-600 dark:text-amber-400 font-bold">File siap diunggah</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setFile(null)} className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors shrink-0">
                    <FiX className="text-xl" />
                  </button>
                </div>
              )}
            </div>

            {/* MAIN COLUMNS */}
            <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8">
              
              {/* LEFT COLUMN */}
              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Judul Dokumen</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleChange} placeholder="Judul Dokumen"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 outline-none text-sm font-medium text-slate-900 dark:text-white transition-colors" 
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Nama Penulis</label>
                  <input type="text" name="document_author" required value={formData.document_author} onChange={handleChange} placeholder="Nama Lengkap Penulis" disabled={user?.role !== 'admin'}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 outline-none text-sm font-medium text-slate-900 dark:text-white transition-colors" 
                  />
                </div>
                
                <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-4">
                  <div>
                    <label className="block text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Tahun Terbit</label>
                    <input type="number" name="year" required value={formData.year} onChange={handleChange} 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 outline-none text-sm font-medium text-slate-900 dark:text-white transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Kategori</label>
                    <select name="category" required value={formData.category} onChange={handleChange} 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 outline-none text-sm font-medium text-slate-900 dark:text-white transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-white dark:bg-[#0B1121]">Pilih Kategori</option>
                      <option value="Tugas Akhir" className="bg-white dark:bg-[#0B1121]">Tugas Akhir</option>
                      <option value="Laporan Magang" className="bg-white dark:bg-[#0B1121]">Laporan Magang</option>
                      <option value="Makalah" className="bg-white dark:bg-[#0B1121]">Makalah</option>
                      <option value="Artikel Ilmiah" className="bg-white dark:bg-[#0B1121]">Artikel Ilmiah</option>
                      <option value="Jurnal Akademik" className="bg-white dark:bg-[#0B1121]">Jurnal Akademik</option>
                      <option value="Penelitian" className="bg-white dark:bg-[#0B1121]">Hasil Penelitian</option>
                      <option value="Buku Ajar" className="bg-white dark:bg-[#0B1121]">Buku Ajar</option>
                      <option value="Modul Ajar" className="bg-white dark:bg-[#0B1121]">Modul Ajar</option>
                    </select>
                  </div>
                </div>

                {/* Tautan Publikasi Eksternal */}
                <div>
                  <label className="flex items-center gap-2 text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    <FiLink className="text-sm" /> Tautan Publikasi Eksternal (Opsional)
                  </label>
                  <input type="url" name="external_link" value={formData.external_link} onChange={handleChange} placeholder="https://jurnal.poltekbaja.ac.id/..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 outline-none text-sm font-medium text-slate-900 dark:text-white transition-colors" 
                  />
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Program Studi</label>
                  <select name="department" required value={formData.department} onChange={handleChange} 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 outline-none text-sm font-medium text-slate-900 dark:text-white transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-white dark:bg-[#0B1121]">-- Pilih Program Studi / Bagian --</option>
                    <option value="D3 Teknik Informatika" className="bg-white dark:bg-[#0B1121]">D3 Teknik Informatika</option>
                    <option value="D3 Teknik Mesin" className="bg-white dark:bg-[#0B1121]">D3 Teknik Mesin</option>
                    <option value="D3 Teknik Otomotif" className="bg-white dark:bg-[#0B1121]">D3 Teknik Otomotif</option>
                    <option value="D3 Teknik Elektronika" className="bg-white dark:bg-[#0B1121]">D3 Teknik Elektronika</option>
                    <option value="Mata Kuliah Umum (MKDU)" className="bg-white dark:bg-[#0B1121]">Mata Kuliah Umum (MKDU)</option>
                    <option value="Lintas Program Studi" className="bg-white dark:bg-[#0B1121]">Lintas Program Studi</option>
                    <option value="Pusat / LPPM" className="bg-white dark:bg-[#0B1121]">Pusat / LPPM</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Abstrak Dokumen</label>
                  <textarea name="abstract" required value={formData.abstract} onChange={handleChange} rows="6" placeholder="Tuliskan ringkasan singkat atau latar belakang dokumen ini..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 outline-none text-sm font-medium text-slate-900 dark:text-white resize-none transition-colors"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Kata Kunci</label>
                  <input type="text" name="keywords" value={formData.keywords} onChange={handleChange} placeholder="Contoh: Teknologi, Sistem, Web"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 outline-none text-sm font-medium text-slate-900 dark:text-white transition-colors" 
                  />
                </div>
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="mt-8 md:mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse md:flex-row justify-end gap-3 md:gap-4 transition-colors">
              <button type="button" onClick={() => navigate(returnPath)} className="px-6 py-3.5 md:py-3 font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 md:bg-transparent md:dark:bg-transparent rounded-xl transition-colors w-full md:w-auto text-sm md:text-base text-center shrink-0">
                Batal
              </button>
              <button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 md:py-3 rounded-xl font-bold shadow-lg shadow-amber-500/30 dark:shadow-none transition-all flex items-center justify-center w-full md:w-auto text-sm md:text-base shrink-0">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : 'Unggah Dokumen'}
              </button>
            </div>
            
          </form>
        </div>
      </div>

      {/* POPUP LOADING/SUCCESS */}
      {(loading || success) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-[#131C31] p-10 rounded-[2.5rem] flex flex-col items-center">
            {loading ? <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div> : <FiCheckCircle className="text-6xl text-emerald-500" />}
            <h3 className="mt-4 font-black">{loading ? 'Mengirim Data...' : 'Berhasil!'}</h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadDocument;