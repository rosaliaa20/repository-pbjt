import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUploadCloud, FiFileText, FiCheckCircle, FiAlignLeft, FiLink, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';

const StudentUpload = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', 
    document_author: '', 
    abstract: '',
    category: '', 
    department: '', 
    year: new Date().getFullYear(),
    external_link: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [modal, setModal] = useState({
    isOpen: false, type: 'warning', title: '', message: '', onConfirm: null
  });

  const closePopup = () => setModal({ ...modal, isOpen: false });

  useEffect(() => {
    window.scrollTo(0, 0);
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      setModal({
        isOpen: true,
        type: 'warning',
        title: 'Akses Ditolak',
        message: 'Silakan login terlebih dahulu untuk mengunggah dokumen.',
        onConfirm: () => navigate('/login')
      });
    } else {
      setFormData(prev => ({ ...prev, document_author: user.name || '' }));
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      return setModal({
        isOpen: true, type: 'warning', title: 'File Kosong',
        message: 'Silakan lampirkan file dokumen PDF terlebih dahulu!', onConfirm: closePopup
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

    // VALIDASI UKURAN FILE
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
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('document_file', file); 
    data.append('status', 'Pending');

    try {
      await axios.post('http://localhost:5000/api/documents/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 🔥 PERBAIKAN: Scroll ke atas secara halus sebelum menampilkan status sukses
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      setSuccess(true);
      
      // Tunggu sebentar lalu pindah halaman
      setTimeout(() => navigate('/dashboard-student'), 3500);
    } catch (error) {
      console.error(error);
      setModal({
        isOpen: true, type: 'danger', title: 'Upload Gagal',
        message: 'Terjadi kesalahan pada server. Pastikan data lengkap dan koneksi aman.', onConfirm: closePopup
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔥 PERBAIKAN UI SUKSES: Dibuat Full Screen & Center agar tidak perlu scroll
  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
        <div className="text-center p-10 bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <FiCheckCircle size={56} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Berhasil!</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
            Karya ilmiah Anda telah terkirim dan sedang menunggu verifikasi Admin.
          </p>
          <div className="flex justify-center">
            <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 animate-progress origin-left"></div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-bold">Mengalihkan Halaman...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans pb-20 relative transition-colors">
      <section className="relative pt-20 pb-28 px-4 overflow-hidden border-b border-slate-200 dark:border-slate-800">
        <img src="/wallpaper.png" alt="Wallpaper" className="absolute inset-0 w-full h-full object-cover opacity-10 z-0" />
        <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/60 backdrop-blur-[1px] z-10"></div>
        <div className="max-w-4xl mx-auto relative z-20 text-center">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Unggah Karya Ilmiah</h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto">Kontribusikan karya Anda ke Repository Digital Politeknik Baja Tegal.</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-30">
        <form onSubmit={handleSubmit} className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 gap-6">
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Judul Dokumen <span className="text-rose-500">*</span></label>
              <div className="relative">
                <FiFileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input required type="text" className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 outline-none dark:text-white transition-all" placeholder="Contoh: Analisis Sistem Keamanan Jaringan..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Penulis</label>
                <div className="relative font-bold text-slate-500 italic bg-slate-100 dark:bg-slate-900/50 p-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                   {formData.document_author || 'Memuat...'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tahun Terbit <span className="text-rose-500">*</span></label>
                <input required type="number" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 outline-none dark:text-white transition-all" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Kategori <span className="text-rose-500">*</span></label>
                <select required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 outline-none dark:text-white transition-all" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="">Pilih Kategori</option>
                  <option value="Laporan Magang">Laporan Magang</option>
                  <option value="Tugas Akhir">Tugas Akhir</option>
                  <option value="Jurnal Akademik">Jurnal Akademik</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Program Studi <span className="text-rose-500">*</span></label>
                <select required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 outline-none dark:text-white transition-all" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                  <option value="">Pilih Prodi</option>
                  <option value="D3 Teknik Informatika">D3 Teknik Informatika</option>
                  <option value="D3 Teknik Mesin">D3 Teknik Mesin</option>
                  <option value="D3 Teknik Otomotif">D3 Teknik Otomotif</option>
                  <option value="D3 Teknik Elektronika">D3 Teknik Elektronika</option>
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                <FiAlignLeft className="text-slate-400"/> Abstrak / Ringkasan <span className="text-rose-500">*</span>
              </label>
              <textarea required rows="4" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 outline-none dark:text-white resize-none transition-all" placeholder="Tuliskan ringkasan singkat tentang dokumen ini..." value={formData.abstract} onChange={e => setFormData({...formData, abstract: e.target.value})}></textarea>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                <FiLink className="text-slate-400"/> Tautan Publikasi Eksternal <span className="text-xs font-normal text-slate-400 ml-1">(Opsional)</span>
              </label>
              <input type="url" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 outline-none dark:text-white transition-all" placeholder="https://jurnal.poltekbaja.ac.id/..." value={formData.external_link} onChange={e => setFormData({...formData, external_link: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">File Dokumen (PDF) <span className="text-rose-500">*</span></label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative">
                <input required type="file" accept=".pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={e => setFile(e.target.files[0])} />
                <div className="pointer-events-none">
                  {file ? (
                    <>
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FiCheckCircle size={24} />
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{file.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </>
                  ) : (
                    <>
                      <FiUploadCloud className="mx-auto text-4xl text-slate-400 mb-2"/>
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Klik atau seret file PDF di sini</p>
                      <p className="text-xs text-slate-500 mt-1">Max: 15MB (TA), 10MB (Magang), 5MB (Jurnal)</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-slate-900 dark:bg-yellow-400 text-white dark:text-slate-900 font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
              {loading ? "Sedang Mengirim..." : <><FiUploadCloud/> Kirim untuk Diverifikasi</>}
            </button>
          </div>
        </form>
      </div>

      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#131C31] border border-slate-200 dark:border-slate-700 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              modal.type === 'danger' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' :
              modal.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' :
              'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
            }`}>
              {modal.type === 'danger' ? <FiAlertCircle size={32} /> : 
               modal.type === 'warning' ? <FiAlertCircle size={32} /> : <FiCheckCircle size={32} />}
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{modal.title}</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 px-2 leading-relaxed">{modal.message}</p>
            <button onClick={modal.onConfirm} className={`w-full py-3 rounded-xl font-bold text-white transition-colors ${
                modal.type === 'danger' ? 'bg-rose-600 hover:bg-rose-700' :
                modal.type === 'warning' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'
              }`}>
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentUpload;