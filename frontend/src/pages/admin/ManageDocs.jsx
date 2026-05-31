import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FiSearch, FiEdit2, FiTrash2, FiCheck, FiX, FiAlertCircle, 
  FiCheckCircle, FiPlus, FiEye, FiFilter, FiRefreshCw, FiDownloadCloud 
} from "react-icons/fi";
import axios from "axios";

const ManageDocs = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // STATE FILTER TANGGAL
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 🔥 STATE BARU: Mencegah Double-Click saat memproses data 🔥
  const [actionLoading, setActionLoading] = useState(false);

  // STATE POPUP KONFIRMASI 
  const [modal, setModal] = useState({
    isOpen: false,
    type: 'warning', 
    title: '',
    message: '',
    showInput: false,
    action: '',      
    targetId: null   
  });

  // STATE POPUP EXPORT LAPORAN
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFilterStatus, setExportFilterStatus] = useState("Semua");
  
  // STATE BARU: Untuk menyimpan ketikan alasan revisi
  const [rejectReason, setRejectReason] = useState("");
  const [rejectFile, setRejectFile] = useState(null);
  
  const closePopup = () => setModal({ ...modal, isOpen: false });

  // FUNGSI BANTUAN: Mengubah format YYYY-MM-DD menjadi DD-MM-YYYY
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  // Fungsi ambil data dari backend
  const fetchDocuments = async () => {
    try {
      const response = await axios.get("/api/documents", {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }
      });
      setDocuments(response.data);
    } catch (error) {
      console.error("Gagal memuat dokumen:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    const intervalId = setInterval(fetchDocuments, 15000);
    const handleFocus = () => fetchDocuments();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [startDate, endDate]);

  const handleResetFilter = () => {
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
  };

  const filteredDocs = documents.filter((doc) => {
    return (
      (doc.title && doc.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.document_author && doc.document_author.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // ========================================================
  // FUNGSI EXPORT LAPORAN KE CSV
  // ========================================================
  const executeExport = () => {
    setIsExportModalOpen(false);

    let docsToExport = filteredDocs;
    if (exportFilterStatus !== "Semua") {
      docsToExport = docsToExport.filter(
        doc => (doc.status || "Pending").toLowerCase() === exportFilterStatus.toLowerCase()
      );
    }

    if (docsToExport.length === 0) {
      return setModal({
        isOpen: true, type: 'warning', title: 'Data Kosong',
        message: `Tidak ada data dengan status "${exportFilterStatus}" pada rentang waktu ini.`,
        showInput: false, action: '', targetId: null
      });
    }

    const headers = ['ID', 'Judul Dokumen', 'Penulis', 'Kategori', 'Program Studi', 'Tahun', 'Status', 'Tayangan', 'Tanggal Unggah'];
    
    const csvRows = docsToExport.map(doc => {
      const uploadDate = new Date(doc.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
      return [
        doc.id,
        `"${doc.title ? doc.title.replace(/"/g, '""') : 'Tanpa Judul'}"`,
        `"${doc.document_author || 'Anonim'}"`,
        `"${doc.category || '-'}"`,
        `"${doc.department || '-'}"`,
        doc.year || '-',
        doc.status || 'Pending',
        doc.views || 0,
        `"${uploadDate}"`
      ];
    });

    const csvContent = "sep=;\n" + [headers.join(';'), ...csvRows.map(row => row.join(';'))].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const fileNameDate = startDate && endDate 
      ? `${formatDateDisplay(startDate)}_sd_${formatDateDisplay(endDate)}` 
      : 'Semua_Waktu';
      
    link.href = url;
    link.setAttribute('download', `Laporan_Repository_${exportFilterStatus}_${fileNameDate}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ========================================================
  // FUNGSI VALIDASI & HAPUS DENGAN FEEDBACK
  // ========================================================
  const handleApproveClick = (id) => {
    setModal({
      isOpen: true, type: 'success', title: 'Setujui Dokumen?',
      message: 'Dokumen ini akan diterbitkan dan dapat diakses oleh publik.',
      showInput: false, action: 'approve', targetId: id
    });
  };

  const handleRejectClick = (id) => {
    setRejectReason(""); 
    setModal({
      isOpen: true, type: 'warning', title: 'Tolak & Beri Revisi',
      message: 'Berikan catatan/alasan agar mahasiswa tahu bagian mana yang harus diperbaiki:',
      showInput: true, action: 'reject', targetId: id
    });
  };

  const handleDeleteClick = (id) => {
    setModal({
      isOpen: true, type: 'error', title: 'Hapus Dokumen?',
      message: 'Tindakan ini tidak dapat dibatalkan. Dokumen dan file fisik akan dihapus permanen.',
      showInput: false, action: 'delete', targetId: id
    });
  };

  const handleConfirmModal = () => {
    if (modal.action === 'approve') {
      executeStatusChange(modal.targetId, 'Terbit');
    } else if (modal.action === 'reject') {
      executeStatusChange(modal.targetId, 'Ditolak');
    } else if (modal.action === 'delete') {
      executeDelete(modal.targetId); 
    } else {
      closePopup(); 
    }
  };

  const executeStatusChange = async (id, newStatus) => {
    if (newStatus === 'Ditolak' && !rejectReason.trim()) {
      alert("Mohon isi catatan revisi!");
      return;
    }

    setActionLoading(true); // 🔥 KUNCI TOMBOL SAAT PROSES DIMULAI 🔥
    const formData = new FormData();
    formData.append('status', newStatus);
    formData.append('rejection_reason', rejectReason);
    if (rejectFile) formData.append('document_file', rejectFile); 

    try {
      await axios.put(`/api/documents/${id}/status`, formData);
      fetchDocuments();
      closePopup();
    } catch (error) { 
      console.error(error); 
    } finally {
      setActionLoading(false); // 🔥 BUKA KUNCI TOMBOL SETELAH SELESAI 🔥
    }
  };

  const executeDelete = async (id) => {
    setActionLoading(true); // 🔥 KUNCI TOMBOL SAAT MENGHAPUS 🔥
    try {
      await axios.delete(`/api/documents/${id}`);
      setDocuments(documents.filter(doc => doc.id !== id));
      closePopup();
    } catch (error) {
      console.error("Gagal menghapus:", error);
    } finally {
      setActionLoading(false); // 🔥 BUKA KUNCI TOMBOL 🔥
    }
  };

  const getStatusBadge = (status) => {
    const s = status ? status.toLowerCase() : '';
    if (s === 'terbit') return <span className="text-emerald-600 bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-max"><FiCheckCircle /> TERBIT</span>;
    if (s === 'ditolak') return <span className="text-rose-600 bg-rose-50 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-max"><FiAlertCircle /> DITOLAK</span>;
    return <span className="text-amber-600 bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-max">PENDING</span>;
  };

  if (loading) return <div className="p-8 text-slate-500 font-bold animate-pulse text-center">Memuat data dokumen...</div>;

  return (
    <div className="p-4 md:p-8 md:pt-6 relative">
      
      {/* HEADER SECTION */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Manajemen Dokumen</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Kelola, setujui, dan unduh laporan karya ilmiah.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 shrink-0"
          >
            <FiDownloadCloud className="text-lg" /> Unduh Laporan
          </button>

          <Link 
            to="/admin/documents/add" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/20 shrink-0"
          >
            <FiPlus className="text-lg" /> Tambah Baru
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-[#131C31] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* TOOLBAR */}
        <div className="p-4 md:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
          <div className="relative w-full xl:max-w-xs shrink-0">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            <input 
              type="text" placeholder="Cari judul atau penulis..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-800 dark:text-white focus:outline-none" />
              <span className="text-slate-400 font-bold">-</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full sm:w-auto px-3 py-2 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-800 dark:text-white focus:outline-none" />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button onClick={fetchDocuments} className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"><FiFilter /> Filter</button>
              <button onClick={handleResetFilter} className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 dark:bg-[#0B1121] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"><FiRefreshCw /> Reset</button>
            </div>
          </div>
        </div>

        {/* TABEL */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-[#0B1121]/50 border-b border-slate-100 dark:border-slate-800">
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Info Dokumen</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategori</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Validasi</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDocs.length === 0 ? (
                <tr><td colSpan="5" className="py-10 text-center text-sm text-slate-500">Tidak ada data ditemukan.</td></tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:bg-[#0B1121]/20 hover:dark:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="max-w-xs md:max-w-md flex flex-col items-start">
                        <Link 
                          to={`/detail/${doc.id}`} 
                          className="font-bold text-slate-800 dark:text-white text-sm leading-tight line-clamp-2 hover:text-amber-500 dark:hover:text-amber-400 transition-colors" 
                        >
                          {doc.title}
                        </Link>
                        <p className="text-[11px] text-slate-500 mt-1">Oleh: {doc.document_author || 'Anonim'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6"><p className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md w-max">{doc.category || '-'}</p></td>
                    <td className="py-4 px-6">{getStatusBadge(doc.status)}</td>
                    <td className="py-4 px-6 text-center">
                      {(!doc.status || doc.status.toLowerCase() === 'pending') ? (
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleApproveClick(doc.id)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-md transition-all"><FiCheck size={16} /></button>
                          <button onClick={() => handleRejectClick(doc.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-all"><FiX size={16} /></button>
                        </div>
                      ) : (<span className="text-[11px] font-medium text-slate-400 italic">Selesai</span>)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/viewer/${doc.id}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-md transition-colors"><FiEye size={16} /></Link>
                        <Link to={`/admin/documents/edit/${doc.id}`} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md transition-colors"><FiEdit2 size={16} /></Link>
                        <button onClick={() => handleDeleteClick(doc.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"><FiTrash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP STANDAR UNTUK APPROVE, REJECT, DELETE */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#131C31] border border-slate-200 dark:border-slate-700 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
            
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${modal.type === 'error' ? 'bg-rose-100 text-rose-600' : modal.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {modal.type === 'error' ? <FiTrash2 size={32} /> : modal.type === 'warning' ? <FiAlertCircle size={32} /> : <FiCheckCircle size={32} />}
            </div>
            
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{modal.title}</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 px-2">{modal.message}</p>
            
            {modal.showInput && (
              <div className="w-full text-left mb-6">
                <textarea 
                  className="w-full p-4 mb-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-amber-500 dark:text-white resize-none"
                  rows="3"
                  placeholder="Contoh: Format margin salah, mohon ubah ke 4-4-3-3..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                ></textarea>
                
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">
                    Unggah Bukti Gambar (Opsional)
                  </label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setRejectFile(e.target.files[0])}
                    className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-wider file:bg-amber-100 file:text-amber-700 dark:file:bg-amber-500/20 dark:file:text-amber-400 hover:file:bg-amber-200 dark:hover:file:bg-amber-500/30 cursor-pointer transition-colors"
                  />
                </div>
              </div>
            )}
            
            <div className="flex w-full gap-3">
              {modal.type === 'warning' || modal.type === 'error' || modal.type === 'success' ? (
                <>
                  <button 
                    onClick={closePopup} 
                    disabled={actionLoading}
                    className="flex-1 py-3 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                  >
                    Batal
                  </button>
                  {/* 🔥 TOMBOL "YA LANJUTKAN" YANG SUDAH DILINDUNGI 🔥 */}
                  <button 
                    onClick={handleConfirmModal} 
                    disabled={actionLoading}
                    className={`flex-1 py-3 rounded-xl font-bold text-white transition-all disabled:opacity-70 disabled:cursor-not-allowed
                      ${modal.type === 'error' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' : 
                        modal.type === 'success' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' :
                        'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'} shadow-lg`}
                  >
                    {actionLoading ? 'Memproses...' : 'Ya, Lanjutkan'}
                  </button>
                </>
              ) : (
                <button onClick={handleConfirmModal} className="w-full py-3 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600">Tutup</button>
              )}
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default ManageDocs;