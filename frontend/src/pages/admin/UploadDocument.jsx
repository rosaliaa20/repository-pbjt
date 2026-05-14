import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUploadCloud, FiLink, FiAlignLeft, FiCheckCircle, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';

const UploadDocument = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // State Form
  const [formData, setFormData] = useState({
    title: '',
    year: new Date().getFullYear().toString(),
    category: '',
    department: '',
    abstract: '',
    external_link: '',
  });

  // State untuk Popup Modern
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'success', 
    title: '',
    message: '',
    onConfirm: null
  });

  const closePopup = () => setModal({ ...modal, isOpen: false });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      setModal({
        isOpen: true,
        type: 'warning',
        title: 'Format Tidak Sesuai',
        message: 'Harap unggah file dalam format PDF.',
        onConfirm: closePopup
      });
      e.target.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      return setModal({
        isOpen: true,
        type: 'warning',
        title: 'File Kosong',
        message: 'Silakan lampirkan file dokumen PDF terlebih dahulu!',
        onConfirm: closePopup
      });
    }
    
    if (!formData.category || !formData.department) {
      return setModal({
        isOpen: true,
        type: 'warning',
        title: 'Data Belum Lengkap',
        message: 'Harap lengkapi pilihan Kategori dan Program Studi!',
        onConfirm: closePopup
      });
    }

    let maxSizeMB = 5; 

    if (formData.category === 'Tugas Akhir' || formData.category === 'Skripsi') {
      maxSizeMB = 15;
    } else if (formData.category === 'Laporan Magang') {
      maxSizeMB = 10;
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024; 

    if (file.size > maxSizeBytes) {
      return setModal({
        isOpen: true,
        type: 'warning',
        title: 'Ukuran File Terlalu Besar',
        message: `Kategori "${formData.category}" maksimal berukuran ${maxSizeMB}MB. File Anda berukuran ${(file.size / (1024 * 1024)).toFixed(2)}MB. Silakan kompres PDF Anda terlebih dahulu.`,
        onConfirm: closePopup
      });
    }

    setLoading(true);
    
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('document_author', user?.name || 'Anonim');
    submitData.append('year', formData.year);
    submitData.append('category', formData.category);
    submitData.append('department', formData.department);
    submitData.append('abstract', formData.abstract);
    submitData.append('external_link', formData.external_link);
    submitData.append('document_file', file);

    try {
      await axios.post('http://localhost:5000/api/documents/upload', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Berhasil Diunggah!',
        message: 'Karya ilmiah berhasil ditambahkan ke dalam sistem Repository.',
        onConfirm: () => navigate('/admin/documents') 
      });
      
    } catch (error) {
      console.error("Gagal mengunggah dokumen:", error);
      setModal({
        isOpen: true,
        type: 'danger',
        title: 'Upload Gagal',
        message: 'Terjadi kesalahan pada server saat mengunggah dokumen. Pastikan koneksi dan database aman.',
        onConfirm: closePopup
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 md:py-10 px-4 sm:px-6 relative">
      {/* 🔥 REVISI: max-w-3xl agar lebih compact & pas di tengah 🔥 */}
      <div className="max-w-3xl mx-auto">
        
        {/* Form Card */}
        <div className="bg-white dark:bg-[#131C31] rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden">
          
          {/* 🔥 REVISI: Header dimasukkan ke dalam Card 🔥 */}
          <div className="px-6 py-6 md:px-10 md:pt-8 md:pb-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B1121]/50">
            <button 
              onClick={() => navigate('/admin/documents')}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-4 w-max px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <FiArrowLeft className="text-base" /> Kembali
            </button>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Unggah Karya Ilmiah</h1>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              Tambahkan dokumen baru ke Repository Digital Politeknik Baja Tegal. Pastikan data yang dimasukkan sudah benar dan valid.
            </p>
          </div>

          <div className="p-6 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* ROW 1: Judul */}
              <div>
                <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Judul Dokumen <span className="text-rose-500 text-base leading-none">*</span>
                </label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Contoh: Analisis Sistem Keamanan Jaringan..." 
                  className="w-full bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  required
                />
              </div>

              {/* ROW 2: Penulis & Tahun */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-2">Penulis</label>
                  <input 
                    type="text" 
                    value={user?.name || 'Memuat...'} 
                    disabled
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-500 dark:text-slate-400 font-bold cursor-not-allowed italic"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Tahun Terbit <span className="text-rose-500 text-base leading-none">*</span>
                  </label>
                  <input 
                    type="number" 
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* ROW 3: Kategori & Prodi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Kategori <span className="text-rose-500 text-base leading-none">*</span>
                  </label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                    required
                  >
                    <option value="" disabled>Pilih Kategori</option>
                    <option value="Tugas Akhir">Tugas Akhir</option>
                    <option value="Laporan Magang">Laporan Magang</option>
                    <option value="Jurnal Akademik">Jurnal Akademik</option>
                    <option value="Makalah">Makalah</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Program Studi <span className="text-rose-500 text-base leading-none">*</span>
                  </label>
                  <select 
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                    required
                  >
                    <option value="" disabled>Pilih Prodi</option>
                    <option value="D3 Teknik Informatika">D3 Teknik Informatika</option>
                    <option value="D3 Teknik Mesin">D3 Teknik Mesin</option>
                    <option value="D3 Teknik Otomotif">D3 Teknik Otomotif</option>
                    <option value="D3 Teknik Elektronika">D3 Teknik Elektronika</option>
                  </select>
                </div>
              </div>

              {/* ROW 4: Abstrak / Deskripsi */}
              <div>
                <label className="flex items-center gap-2 text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <FiAlignLeft className="text-slate-400" /> Abstrak / Ringkasan
                </label>
                {/* 🔥 REVISI: rows diubah jadi 6 agar lebih proper 🔥 */}
                <textarea 
                  name="abstract"
                  value={formData.abstract}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Tuliskan ringkasan singkat atau latar belakang dokumen ini..." 
                  className="w-full bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none leading-relaxed"
                ></textarea>
              </div>

              {/* ROW 5: Link Eksternal */}
              <div>
                <label className="flex items-center gap-2 text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <FiLink className="text-slate-400" /> Tautan Publikasi Eksternal <span className="text-xs font-normal text-slate-400 ml-1">(Opsional)</span>
                </label>
                <input 
                  type="url" 
                  name="external_link"
                  value={formData.external_link}
                  onChange={handleChange}
                  placeholder="https://jurnal.poltekbaja.ac.id/..." 
                  className="w-full bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              {/* ROW 6: Upload File PDF */}
              <div className="pt-2">
                <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-3">
                  File Dokumen (PDF) <span className="text-rose-500 text-base leading-none">*</span>
                </label>
                {/* 🔥 REVISI: Desain Dropzone di-upgrade agar lebih mengundang 🔥 */}
                <div className="border-2 border-dashed border-indigo-200 dark:border-slate-700 rounded-2xl p-8 text-center bg-indigo-50/50 dark:bg-[#0B1121]/50 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors relative group">
                  <input 
                    type="file" 
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    required
                  />
                  <div className="flex flex-col items-center justify-center pointer-events-none">
                    {file ? (
                      <>
                        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                          <FiCheckCircle size={28} />
                        </div>
                        <p className="text-sm font-black text-slate-800 dark:text-white">{file.name}</p>
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1.5 bg-emerald-100 dark:bg-emerald-500/20 px-3 py-1 rounded-full">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4 shadow-sm border border-indigo-100 dark:border-slate-700 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                          <FiUploadCloud size={26} />
                        </div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Klik atau seret file PDF di sini</p>
                        <p className="text-xs font-medium text-slate-500 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full">
                          Max: 15MB (TA), 10MB (Magang), 5MB (Jurnal)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Tombol Submit */}
              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-70 disabled:cursor-not-allowed tracking-wide"
                >
                  {loading ? 'Mengunggah Dokumen...' : (
                    <>
                      <FiUploadCloud className="text-xl" /> SIMPAN DOKUMEN KE REPOSITORY
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* POPUP MODERN */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#131C31] border border-slate-200 dark:border-slate-700 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
            
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              modal.type === 'danger' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' :
              modal.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' :
              'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
            }`}>
              {modal.type === 'danger' ? <FiAlertCircle size={32} /> : 
               modal.type === 'warning' ? <FiAlertCircle size={32} /> : 
               <FiCheckCircle size={32} />}
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{modal.title}</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 px-2">{modal.message}</p>

            <button 
              onClick={modal.onConfirm} 
              className={`w-full py-3 rounded-xl font-bold text-white transition-colors shadow-lg ${
                modal.type === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30' :
                modal.type === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' :
                'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
              }`}
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default UploadDocument;