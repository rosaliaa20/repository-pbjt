import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUploadCloud, FiFile, FiX, FiCheckCircle, FiLink } from 'react-icons/fi';
import api from '../../api/axiosConfig'; // Sesuaikan dengan path file axios kamu

const StudentEditDoc = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '', 
    document_author: '', 
    year: '', 
    department: '',      
    category: '', 
    abstract: '', 
    keywords: '',
    external_url: '' // 🔥 Tambahan: Kolom Link Eksternal
  });

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const response = await api.get(`/documents/${id}`);
        const doc = response.data;
        
        // Memisahkan abstrak dan kata kunci
        let extractedAbstract = doc.abstract || '';
        let extractedKeywords = '';
        if (extractedAbstract.includes('Kata Kunci: ')) {
          const parts = extractedAbstract.split('\n\nKata Kunci: ');
          extractedAbstract = parts[0];
          extractedKeywords = parts[1];
        }

        setFormData({
          title: doc.title || '',
          document_author: doc.document_author || '',
          year: doc.year || '',
          department: doc.department || '',
          category: doc.category || '',
          abstract: extractedAbstract,
          keywords: extractedKeywords,
          external_url: doc.external_url || ''
        });
      } catch (error) {
        console.error('Gagal memuat data dokumen:', error);
        alert('Dokumen tidak ditemukan!');
        navigate('/dashboard-student');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchDoc();
  }, [id, navigate]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Mohon unggah file dalam format PDF.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const finalAbstract = formData.keywords 
      ? `${formData.abstract}\n\nKata Kunci: ${formData.keywords}` 
      : formData.abstract;

    const updateData = new FormData();
    // 🔥 PERBAIKAN ERROR 500: Nama field wajib 'document_file' 🔥
    if (file) updateData.append('document_file', file); 
    
    updateData.append('title', formData.title);
    updateData.append('document_author', formData.document_author); 
    updateData.append('year', formData.year);
    updateData.append('department', formData.department);
    updateData.append('category', formData.category);
    updateData.append('abstract', finalAbstract); 
    updateData.append('external_url', formData.external_url); 

    try {
      await api.put(`/documents/${id}`, updateData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard-student'), 2000);
    } catch (error) {
      console.error('Gagal mengirim revisi dokumen:', error);
      alert('Gagal mengirim dokumen. Cek koneksi atau coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B1121]">
      <div className="p-10 text-center font-bold text-slate-500 dark:text-slate-400 animate-pulse">
        Memuat Data Dokumen...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1121] py-10 px-4 transition-colors duration-300">
      <div className="max-w-4xl mx-auto font-sans pb-24">
        
        {/* HEADER SECTION */}
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Kirim Ulang Dokumen</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Perbaiki data dokumen Anda sesuai catatan revisi Admin.</p>
          </div>
          <button onClick={() => navigate('/dashboard-student')} className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors w-fit bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg md:bg-transparent md:px-0 md:py-0">
            &larr; Batal & Kembali
          </button>
        </div>

        {/* SUCCESS MESSAGE */}
        {success && (
          <div className="mb-6 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl flex items-center gap-3 font-medium animate-pulse transition-colors">
            <FiCheckCircle className="text-xl shrink-0" /> Dokumen revisi berhasil dikirim! Menunggu validasi Admin...
          </div>
        )}

        {/* FORM CONTAINER */}
        <div className="bg-white dark:bg-[#131C31] rounded-2xl md:rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
          <form onSubmit={handleSubmit} className="p-5 md:p-8 relative">
            
            {/* UPLOAD FILE SECTION */}
            <div className="mb-8 md:mb-10">
              <label className="block text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Ganti File Dokumen (PDF)
              </label>
              {!file ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 dark:border-slate-700 border-dashed rounded-2xl cursor-pointer bg-slate-50 dark:bg-[#0B1121] hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:border-amber-300 dark:hover:border-amber-500/50 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                    <FiUploadCloud className="text-3xl text-slate-400 dark:text-slate-500 group-hover:text-amber-500 mb-2 transition-colors shrink-0" />
                    <p className="mb-1 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium px-4">Biarkan kosong jika tidak ingin mengganti file PDF.</p>
                    <p className="text-[10px] md:text-xs text-amber-600 dark:text-amber-400 font-bold group-hover:underline mt-1">Klik di sini untuk mengganti PDF</p>
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
                      <p className="text-[10px] md:text-xs text-amber-600 dark:text-amber-400 font-bold">Akan menggantikan file lama</p>
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
                  <label className="block text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Judul Dokumen <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" name="title" required value={formData.title} onChange={handleInputChange} 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-amber-500/10 dark:focus:ring-amber-500/20 focus:border-amber-500 dark:focus:border-amber-400 outline-none text-sm font-medium text-slate-900 dark:text-white transition-colors" 
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Nama Penulis <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" name="document_author" required value={formData.document_author} onChange={handleInputChange} 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-amber-500/10 dark:focus:ring-amber-500/20 focus:border-amber-500 dark:focus:border-amber-400 outline-none text-sm font-medium text-slate-900 dark:text-white transition-colors" 
                  />
                </div>
                
                <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-4">
                  <div>
                    <label className="block text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Tahun Terbit <span className="text-rose-500">*</span>
                    </label>
                    <input type="number" name="year" required value={formData.year} onChange={handleInputChange} 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-amber-500/10 dark:focus:ring-amber-500/20 focus:border-amber-500 dark:focus:border-amber-400 outline-none text-sm font-medium text-slate-900 dark:text-white transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Kategori <span className="text-rose-500">*</span>
                    </label>
                    <select name="category" required value={formData.category} onChange={handleInputChange} 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-amber-500/10 dark:focus:ring-amber-500/20 focus:border-amber-500 dark:focus:border-amber-400 outline-none text-sm font-medium text-slate-900 dark:text-white transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-white dark:bg-[#0B1121]">Pilih...</option>
                      <option value="Laporan Magang" className="bg-white dark:bg-[#0B1121]">Laporan Magang</option>
                      <option value="Tugas Akhir" className="bg-white dark:bg-[#0B1121]">Tugas Akhir</option>
                      <option value="Jurnal Akademik" className="bg-white dark:bg-[#0B1121]">Jurnal Akademik</option>
                      <option value="Makalah" className="bg-white dark:bg-[#0B1121]">Makalah</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Program Studi <span className="text-rose-500">*</span>
                  </label>
                  <select name="department" required value={formData.department} onChange={handleInputChange} 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-amber-500/10 dark:focus:ring-amber-500/20 focus:border-amber-500 dark:focus:border-amber-400 outline-none text-sm font-medium text-slate-900 dark:text-white transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-white dark:bg-[#0B1121]">Pilih Program Studi</option>
                    <option value="D3 Teknik Informatika" className="bg-white dark:bg-[#0B1121]">D3 Teknik Informatika</option>
                    <option value="D3 Teknik Mesin" className="bg-white dark:bg-[#0B1121]">D3 Teknik Mesin</option>
                    <option value="D3 Teknik Otomotif" className="bg-white dark:bg-[#0B1121]">D3 Teknik Otomotif</option>
                    <option value="D3 Teknik Elektronika" className="bg-white dark:bg-[#0B1121]">D3 Teknik Elektronika</option>
                  </select>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">
                <div>
                  <label className="block text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Abstrak Dokumen <span className="text-rose-500">*</span>
                  </label>
                  <textarea name="abstract" required value={formData.abstract} onChange={handleInputChange} rows="5" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-amber-500/10 dark:focus:ring-amber-500/20 focus:border-amber-500 dark:focus:border-amber-400 outline-none text-sm font-medium text-slate-900 dark:text-white resize-none transition-colors"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Kata Kunci</label>
                  <input type="text" name="keywords" value={formData.keywords} onChange={handleInputChange} placeholder="Pisahkan dengan koma (Contoh: Teknologi, Sistem, Web)"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-amber-500/10 dark:focus:ring-amber-500/20 focus:border-amber-500 dark:focus:border-amber-400 outline-none text-sm font-medium text-slate-900 dark:text-white transition-colors" 
                  />
                </div>

                {/* KOLOM LINK EKSTERNAL */}
                <div>
                  <label className="block text-[11px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Link Repository Eksternal (Opsional)
                  </label>
                  <div className="relative">
                    <FiLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                    <input type="url" name="external_url" value={formData.external_url} onChange={handleInputChange} placeholder="Contoh: https://github.com/..."
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-amber-500/10 dark:focus:ring-amber-500/20 focus:border-amber-500 dark:focus:border-amber-400 outline-none text-sm font-medium text-slate-900 dark:text-white transition-colors" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="mt-8 md:mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse md:flex-row justify-end gap-3 md:gap-4 transition-colors">
              <button type="button" onClick={() => navigate('/dashboard-student')} className="px-6 py-3.5 md:py-3 font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 md:bg-transparent md:dark:bg-transparent rounded-xl transition-colors w-full md:w-auto text-sm md:text-base text-center shrink-0">
                Batal
              </button>
              <button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 md:py-3 rounded-xl font-bold shadow-lg shadow-amber-500/30 dark:shadow-none transition-all flex items-center justify-center w-full md:w-auto text-sm md:text-base shrink-0">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : 'Kirim Ulang Dokumen'}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentEditDoc;