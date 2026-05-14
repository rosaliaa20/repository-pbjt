import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUploadCloud, FiFile, FiX, FiCheckCircle } from 'react-icons/fi';

const UploadDoc = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // State Form
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '', author: '', year: '', program: '', category: '', abstract: '', keywords: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Mohon unggah file dalam format PDF.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return alert('File PDF wajib diunggah!');

    setLoading(true);
    // SIMULASI API POST REQUEST
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      // Reset form setelah 2 detik lalu kembali ke kelola dokumen
      setTimeout(() => {
        navigate('/admin/documents');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans pb-24">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Upload Dokumen Baru</h1>
          <p className="text-slate-500 text-sm mt-1">Tambahkan arsip laporan, jurnal, atau tugas akhir ke repositori.</p>
        </div>
        <button onClick={() => navigate('/admin/documents')} className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
          &larr; Batal & Kembali
        </button>
      </div>

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-center gap-3 font-medium animate-pulse">
          <FiCheckCircle className="text-xl" />
          Dokumen berhasil diunggah! Mengalihkan ke halaman kelola...
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8">
          
          {/* AREA UPLOAD FILE (DRAG & DROP STYLE) */}
          <div className="mb-10">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">File Dokumen (PDF)</label>
            {!file ? (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FiUploadCloud className="text-4xl text-slate-400 group-hover:text-blue-500 mb-3 transition-colors" />
                  <p className="mb-1 text-sm text-slate-500 font-medium">
                    <span className="font-bold text-blue-600">Klik untuk unggah</span> atau seret file ke sini
                  </p>
                  <p className="text-xs text-slate-400">PDF Maksimal 10MB</p>
                </div>
                <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-lg">
                    <FiFile className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 truncate max-w-xs md:max-w-md">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button type="button" onClick={() => setFile(null)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                  <FiX className="text-xl" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* KOLOM KIRI */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Judul Dokumen</label>
                <input type="text" name="title" required value={formData.title} onChange={handleInputChange} placeholder="Contoh: Sistem Informasi Akademik..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Penulis</label>
                <input type="text" name="author" required value={formData.author} onChange={handleInputChange} placeholder="Nama Lengkap Penulis" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tahun Terbit</label>
                  <input type="number" name="year" required value={formData.year} onChange={handleInputChange} placeholder="2026" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kategori</label>
                  <select name="category" required value={formData.category} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium">
                    <option value="">Pilih...</option>
                    <option value="Laporan Magang">Laporan Magang</option>
                    <option value="Tugas Akhir">Tugas Akhir</option>
                    <option value="Jurnal">Jurnal</option>
                  </select>
                </div>
              </div>
            </div>

            {/* KOLOM KANAN */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Program Studi</label>
                <select name="program" required value={formData.program} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium">
                  <option value="">Pilih Program Studi</option>
                  <option value="Teknik Informatika">Teknik Informatika</option>
                  <option value="Teknik Mesin">Teknik Mesin</option>
                  <option value="Teknik Otomotif">Teknik Otomotif</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Abstrak Dokumen</label>
                <textarea name="abstract" required value={formData.abstract} onChange={handleInputChange} rows="4" placeholder="Tuliskan ringkasan atau abstrak dokumen di sini..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium resize-none"></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kata Kunci (Keywords)</label>
                <input type="text" name="keywords" value={formData.keywords} onChange={handleInputChange} placeholder="Pisahkan dengan koma (contoh: web, react, pbt)" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm font-medium" />
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end gap-4">
            <button type="button" onClick={() => navigate('/admin/documents')} className="px-6 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
              Batal
            </button>
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center min-w-[160px] disabled:opacity-70">
              {loading ? (
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Simpan Dokumen'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadDoc;