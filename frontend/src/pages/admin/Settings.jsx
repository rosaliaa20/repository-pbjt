import { useState, useRef } from 'react';
import { 
  FiDatabase, FiDownloadCloud, FiShield, FiAlertTriangle, 
  FiUploadCloud, FiCheckCircle, FiXCircle, FiInfo 
} from 'react-icons/fi';
import axios from 'axios';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  // State untuk mengontrol Modal Popup Custom
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'warning', // 'warning', 'success', 'error'
    title: '',
    message: '',
    onConfirm: null,
    isProcessing: false // Untuk efek loading di dalam tombol konfirmasi
  });

  const closePopup = () => setModal({ ...modal, isOpen: false });

  const handleBackup = () => {
    setLoading(true);
    window.location.href = 'http://localhost:5000/api/backup';
    setTimeout(() => setLoading(false), 2000); 
  };

  const handleRestoreClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi Ekstensi File
    if (!file.name.endsWith('.sql')) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Format File Salah!',
        message: 'Mohon unggah file database dengan ekstensi .sql',
        onConfirm: closePopup
      });
      e.target.value = ''; 
      return;
    }

    // Tampilkan Popup Konfirmasi Custom
    setModal({
      isOpen: true,
      type: 'warning',
      title: 'Peringatan Kritikal!',
      message: 'Tindakan ini akan MENGHAPUS DAN MENIMPA seluruh data aplikasi saat ini dengan data dari file backup yang Anda unggah. Anda yakin?',
      onConfirm: () => executeRestore(file)
    });
    
    e.target.value = ''; // Reset input agar bisa pilih file yang sama lagi jika batal
  };

  const executeRestore = async (file) => {
    // Ubah tombol konfirmasi menjadi loading
    setModal(prev => ({ ...prev, isProcessing: true }));
    
    const formData = new FormData();
    formData.append('database_file', file);

    try {
      const response = await axios.post('http://localhost:5000/api/restore', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Tampilkan Popup Sukses
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Restore Berhasil!',
        message: response.data.message || 'Database berhasil dipulihkan ke versi cadangan.',
        onConfirm: () => {
          closePopup();
          window.location.reload(); // Refresh halaman agar data sinkron
        }
      });
    } catch (error) {
      console.error("Gagal restore:", error);
      // Tampilkan Popup Error
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Restore Gagal',
        message: 'Terjadi kesalahan saat memulihkan database. Pastikan struktur file .sql valid.',
        onConfirm: closePopup
      });
    }
  };

  return (
    <div className="p-4 md:p-8 md:pt-6 relative font-sans">
      
      {/* HEADER SECTION */}
      <div className="mb-8">
        <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Pengaturan Sistem</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Kelola konfigurasi dan pemeliharaan data repository.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* KOTAK BACKUP DATABASE */}
        <div className="bg-white dark:bg-[#131C31] rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
          <div className="p-6 md:p-8">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
              <FiDatabase className="text-3xl" />
            </div>
            
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Backup Database</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Unduh seluruh struktur dan data aplikasi (file <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">.sql</span>) sebagai cadangan. Lakukan pencadangan ini secara berkala untuk mencegah kehilangan data akibat kerusakan server.
            </p>

            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
              <FiAlertTriangle className="text-amber-600 dark:text-amber-400 text-lg shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700 dark:text-amber-400/90 font-medium">
                File backup berisi data sensitif termasuk kredensial pengguna. Simpan file hasil unduhan di tempat yang aman.
              </p>
            </div>

            <button 
              onClick={handleBackup} 
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <><FiDownloadCloud className="text-lg" /> Unduh File Database (.sql)</>
              )}
            </button>
          </div>
        </div>

        {/* KOTAK RESTORE DATABASE */}
        <div className="bg-white dark:bg-[#131C31] rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300 ring-1 ring-rose-500/20">
          <div className="p-6 md:p-8">
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mb-6">
              <FiShield className="text-3xl" />
            </div>
            
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Restore Database</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Pulihkan sistem menggunakan file backup <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">.sql</span> yang sebelumnya telah Anda unduh. <b className="text-rose-500">Peringatan:</b> Tindakan ini akan menimpa seluruh data saat ini!
            </p>

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".sql" 
              onChange={handleFileChange} 
            />

            <button 
              onClick={handleRestoreClick}
              className="w-full bg-white dark:bg-[#0B1121] border-2 border-rose-500 text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <FiUploadCloud className="text-lg" /> Unggah & Pulihkan Database
            </button>
          </div>
        </div>

      </div>

      {/* === KOMPONEN MODAL POPUP CUSTOM === */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#131C31] border border-slate-200 dark:border-slate-700 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
            
            {/* Ikon Dinamis berdasarkan Tipe Modal */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 
              ${modal.type === 'error' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 
                modal.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' : 
                'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'}`}
            >
              {modal.type === 'error' ? <FiXCircle size={32} /> : 
               modal.type === 'warning' ? <FiAlertTriangle size={32} /> : 
               <FiCheckCircle size={32} />}
            </div>
            
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{modal.title}</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 px-2 leading-relaxed">{modal.message}</p>
            
            {/* Tombol Aksi Dinamis */}
            <div className="flex w-full gap-3">
              {modal.type === 'warning' ? (
                <>
                  <button 
                    onClick={closePopup} 
                    disabled={modal.isProcessing}
                    className="flex-1 py-3 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={modal.onConfirm} 
                    disabled={modal.isProcessing}
                    className="flex-1 py-3 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-all flex justify-center items-center"
                  >
                    {modal.isProcessing ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : 'Ya, Pulihkan'}
                  </button>
                </>
              ) : (
                <button 
                  onClick={modal.onConfirm} 
                  className={`w-full py-3 rounded-xl font-bold text-white transition-all 
                    ${modal.type === 'error' ? 'bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/20' : 
                    'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'}`}
                >
                  Tutup Peringatan
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;