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
      await axios.post('/api/documents/upload', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate(returnPath), 2000);
    } catch (err) {
      setError('Gagal mengunggah dokumen: ' + (err.response?.data?.message || 'Server Error'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1121] py-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8 flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Unggah Karya Ilmiah</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Tambahkan dokumen baru ke Repository Digital PBJT.</p>
          </div>
          <button onClick={() => navigate(returnPath)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
            <FiArrowLeft /> Batal
          </button>
        </div>

        {/* ERROR BOX */}
        {error && (
          <div className="mb-6 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 text-rose-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold">
            <FiAlertCircle /> {error}
          </div>
        )}

        {/* FORM */}
        <div className="bg-white dark:bg-[#131C31] rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="file" className="hidden" id="fileInput" accept="application/pdf" onChange={handleFileChange} />
            <div className="mb-10">
              <label onClick={() => document.getElementById('fileInput').click()} className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-pointer bg-slate-50 dark:bg-[#0B1121] hover:border-blue-400 transition-all">
                {!file ? <><FiUploadCloud className="text-3xl text-slate-400 mb-2" /> Klik untuk unggah PDF</> : <div className="text-center"><FiFile className="text-3xl text-amber-500 mx-auto" /><p className="text-sm font-bold">{file.name}</p></div>}
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Judul Dokumen" className="w-full px-5 py-3 rounded-xl border bg-slate-50 dark:bg-[#0B1121] dark:border-slate-700 dark:text-white" />
              <input type="text" name="document_author" value={formData.document_author} onChange={handleChange} required disabled={user?.role !== 'admin'} className="w-full px-5 py-3 rounded-xl border bg-slate-50 dark:bg-[#0B1121] dark:border-slate-700 dark:text-white" />
              <input type="number" name="year" value={formData.year} onChange={handleChange} required className="w-full px-5 py-3 rounded-xl border bg-slate-50 dark:bg-[#0B1121] dark:border-slate-700 dark:text-white" />
              <select name="category" value={formData.category} onChange={handleChange} required className="w-full px-5 py-3 rounded-xl border bg-slate-50 dark:bg-[#0B1121] dark:border-slate-700 dark:text-white">
                <option value="">-- Pilih Kategori --</option>
                {Object.keys(categoryLimits).filter(k => k !== 'default').map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            
            <textarea name="abstract" value={formData.abstract} onChange={handleChange} rows="4" placeholder="Abstrak..." className="w-full px-5 py-3 rounded-xl border bg-slate-50 dark:bg-[#0B1121] dark:border-slate-700 dark:text-white"></textarea>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black">{loading ? 'Mengirim...' : 'Unggah'}</button>
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