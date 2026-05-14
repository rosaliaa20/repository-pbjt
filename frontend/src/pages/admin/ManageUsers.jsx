import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FiSearch, FiEdit2, FiTrash2, FiUserPlus, FiLock, FiUnlock, 
  FiUserCheck, FiUserX, FiShield, FiKey, FiUploadCloud, FiCheckSquare, 
  FiX, FiCheckCircle, FiAlertCircle
} from "react-icons/fi";
import axios from "axios";

const ManageUsers = () => {
  const location = useLocation();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States untuk Filter & Tabs (Bisa menerima perintah dari notifikasi)
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "approved"); 
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("Semua");
  const [selectedAngkatan, setSelectedAngkatan] = useState("");
  
  // States untuk Checkbox Massal
  const [selectedUsers, setSelectedUsers] = useState([]);

  // States untuk Modal Modern
  const [modal, setModal] = useState({ 
    isOpen: false, type: 'warning', title: '', message: '', isAlert: false, onConfirm: null 
  });
  
  // States untuk Upload Excel
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [uploadingExcel, setUploadingExcel] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Gagal mengambil data pengguna:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Kosongkan checklist setiap kali pindah tab
  useEffect(() => {
    setSelectedUsers([]);
  }, [activeTab]);

  // Pantau perubahan dari navigasi (misal diklik dari toast notifikasi)
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // FILTERING LOGIC
  const filteredUsers = users.filter((user) => {
    const status = user.approval_status || 'approved'; 
    if (status !== activeTab) return false;

    const matchSearch = 
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.nim_nidn && user.nim_nidn.toLowerCase().includes(searchQuery.toLowerCase()));

    const r = user.role ? user.role.trim().toLowerCase() : '';
    let roleDisplay = 'Mahasiswa'; 
    if (r === 'admin') roleDisplay = 'Admin';
    if (r === 'dosen') roleDisplay = 'Dosen';
    const matchRole = roleFilter === 'Semua' || roleDisplay.toLowerCase() === roleFilter.toLowerCase();

    const matchAngkatan = selectedAngkatan === "" || (roleDisplay === 'Mahasiswa' && user.nim_nidn && user.nim_nidn.startsWith(selectedAngkatan));

    return matchSearch && matchRole && matchAngkatan;
  });

  const closePopup = () => setModal({ ...modal, isOpen: false });

  // ========================================================
  // FITUR: IMPORT EXCEL (Mendeteksi Duplikat)
  // ========================================================
  const handleExcelUpload = async (e) => {
    e.preventDefault();
    if (!excelFile) {
      return setModal({ isOpen: true, type: 'warning', title: 'File Kosong', message: 'Pilih file Excel terlebih dahulu!', isAlert: true, onConfirm: closePopup });
    }

    setUploadingExcel(true);
    const formData = new FormData();
    formData.append('excel_file', excelFile);

    try {
      const response = await axios.post("http://localhost:5000/api/auth/users/import", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setShowExcelModal(false);
      setExcelFile(null);
      fetchUsers();

      const failedData = response.data.failedData || [];
      const hasErrors = failedData.length > 0;

      const detailMessage = (
        <div className="text-left w-full">
          <p className="text-slate-600 dark:text-slate-300 mb-3 text-center">
            {response.data.message}
          </p>
          
          {hasErrors && (
            <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl p-3 max-h-32 overflow-y-auto mt-2 text-left">
              <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                <FiAlertCircle /> Gagal Diinput (Duplikat):
              </p>
              <ul className="list-disc pl-5 text-[11px] text-rose-600 dark:text-rose-300 space-y-0.5 font-mono">
                {failedData.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );

      setModal({ 
        isOpen: true, 
        type: hasErrors ? 'warning' : 'success', 
        title: hasErrors ? 'Import Selesai (Ada Duplikat)' : 'Import Berhasil!', 
        message: detailMessage, 
        isAlert: true, 
        onConfirm: closePopup 
      });

    } catch (error) {
      console.error("Gagal import Excel:", error);
      setModal({ isOpen: true, type: 'danger', title: 'Import Gagal', message: error.response?.data?.message || "Gagal mengimport data Excel.", isAlert: true, onConfirm: closePopup });
    } finally {
      setUploadingExcel(false);
    }
  };

  // ========================================================
  // FITUR: CHECKBOX MASSAL
  // ========================================================
  const toggleSelectUser = (id) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]);
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) setSelectedUsers([]);
    else setSelectedUsers(filteredUsers.map(u => u.id));
  };

  // AKSI: Setujui Terpilih
  const handleApproveSelected = async () => {
    if (selectedUsers.length === 0) return;
    setModal({
      isOpen: true, type: 'success', title: 'Setujui Mahasiswa?', message: `Setujui ${selectedUsers.length} akun agar bisa login?`, isAlert: false,
      onConfirm: async () => {
        try {
          const res = await axios.put("http://localhost:5000/api/auth/users/approve", { ids: selectedUsers });
          setSelectedUsers([]); fetchUsers(); 
          setModal({ isOpen: true, type: 'success', title: 'Berhasil Disetujui!', message: res.data.message, isAlert: true, onConfirm: closePopup });
        } catch (error) {
          setModal({ isOpen: true, type: 'danger', title: 'Gagal', message: 'Terjadi kesalahan.', isAlert: true, onConfirm: closePopup });
        }
      }
    });
  };

  // 🔥 AKSI BARU: Tolak/Hapus Terpilih 🔥
  const handleRejectSelected = async () => {
    if (selectedUsers.length === 0) return;
    setModal({
      isOpen: true, 
      type: 'danger', 
      title: 'Tolak & Hapus Pendaftar?', 
      message: `Anda akan menolak dan menghapus permanen ${selectedUsers.length} akun yang menunggu persetujuan ini. Tindakan ini tidak dapat dibatalkan. Lanjutkan?`, 
      isAlert: false,
      onConfirm: async () => {
        try {
          // Eksekusi hapus massal
          await Promise.all(selectedUsers.map(id => axios.delete(`http://localhost:5000/api/auth/users/${id}`)));
          
          setSelectedUsers([]); 
          fetchUsers(); 
          setModal({ isOpen: true, type: 'success', title: 'Berhasil Dihapus!', message: `${selectedUsers.length} pendaftar berhasil ditolak dan dihapus.`, isAlert: true, onConfirm: closePopup });
        } catch (error) {
          console.error("Gagal menolak pendaftar:", error);
          setModal({ isOpen: true, type: 'danger', title: 'Gagal', message: 'Terjadi kesalahan saat menghapus data massal.', isAlert: true, onConfirm: closePopup });
        }
      }
    });
  };

  // AKSI: Kunci/Buka Terpilih
  const handleLockUnlockSelected = async (isLock) => {
    if (selectedUsers.length === 0) return;
    setModal({
      isOpen: true, type: isLock ? 'warning' : 'success', title: isLock ? 'Kunci Terpilih?' : 'Buka Kunci Terpilih?',
      message: `Anda akan ${isLock ? 'mengunci' : 'membuka kunci'} ${selectedUsers.length} pengguna. Lanjutkan?`, isAlert: false,
      onConfirm: async () => {
        try {
          await Promise.all(selectedUsers.map(id => axios.put(`http://localhost:5000/api/auth/users/${id}/toggle-lock`, { is_locked: isLock })));
          setSelectedUsers([]); fetchUsers();
          setModal({ isOpen: true, type: 'success', title: 'Berhasil!', message: `Status ${selectedUsers.length} akun berhasil diperbarui.`, isAlert: true, onConfirm: closePopup });
        } catch (error) {
          setModal({ isOpen: true, type: 'danger', title: 'Gagal', message: 'Terjadi kesalahan saat memproses data massal.', isAlert: true, onConfirm: closePopup });
        }
      }
    });
  };

  // ========================================================
  // FITUR: AKSI MASSAL ANGKATAN
  // ========================================================
  const handleMassActionAngkatan = (isLock) => {
    if (!selectedAngkatan) return setModal({ isOpen: true, type: 'danger', title: 'Pilih Angkatan!', message: 'Pilih tahun angkatan dari dropdown dulu.', isAlert: true, onConfirm: closePopup });
    setModal({
      isOpen: true, type: isLock ? 'warning' : 'success', title: isLock ? `Kunci Angkatan 20${selectedAngkatan}?` : `Buka Angkatan 20${selectedAngkatan}?`,
      message: `Tindakan ini akan ${isLock ? 'mengunci' : 'membuka'} SELURUH akun mahasiswa angkatan 20${selectedAngkatan}. Yakin?`, isAlert: false,
      onConfirm: async () => {
        try {
          const res = await axios.put(`http://localhost:5000/api/auth/users/mass-lock`, { angkatan: selectedAngkatan, is_locked: isLock });
          fetchUsers();
          setModal({ isOpen: true, type: 'success', title: 'Berhasil', message: res.data.message, isAlert: true, onConfirm: closePopup });
        } catch (error) { console.error(error); }
      }
    });
  };

  // ========================================================
  // FITUR: INDIVIDUAL (Reset Sandi, Kunci, Hapus)
  // ========================================================
  const handleResetPasswordClick = (id, name) => {
    setModal({
      isOpen: true, type: 'warning', title: 'Reset Sandi?', message: `Kembalikan sandi "${name}" menjadi "pbjt123"?`, isAlert: false,
      onConfirm: async () => {
        try {
          await axios.put(`http://localhost:5000/api/auth/users/${id}`, { password: 'pbjt123' });
          setModal({ isOpen: true, type: 'success', title: 'Direset!', message: `Sandi dikembalikan ke pbjt123.`, isAlert: true, onConfirm: closePopup });
        } catch (error) { console.error(error); }
      }
    });
  };

  const handleToggleLockClick = (id, currentStatus) => {
    const isCurrentlyLocked = currentStatus === 1 || currentStatus === true;
    setModal({
      isOpen: true, type: isCurrentlyLocked ? 'success' : 'warning', title: isCurrentlyLocked ? "Buka Kunci?" : "Kunci Akun?",
      message: isCurrentlyLocked ? "Pengguna dapat login kembali." : "Pengguna tidak akan bisa login.", isAlert: false,
      onConfirm: async () => {
        try {
          await axios.put(`http://localhost:5000/api/auth/users/${id}/toggle-lock`, { is_locked: !isCurrentlyLocked });
          fetchUsers(); closePopup();
        } catch (error) { console.error(error); }
      }
    });
  };

  const handleDeleteClick = (id) => {
    setModal({
      isOpen: true, type: 'danger', title: 'Hapus Pengguna?', message: 'Data akan hilang permanen.', isAlert: false,
      onConfirm: async () => {
        try {
          await axios.delete(`http://localhost:5000/api/auth/users/${id}`);
          fetchUsers(); closePopup();
        } catch (error) { console.error(error); }
      }
    });
  };

  const getRoleBadge = (role) => {
    const r = role ? role.toLowerCase() : '';
    if (r === 'admin') return <span className="text-purple-600 bg-purple-50 dark:bg-purple-500/10 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Admin</span>;
    if (r === 'dosen') return <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Dosen</span>;
    return <span className="text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Mahasiswa</span>;
  };

  if (loading) return <div className="p-8 text-slate-500 font-bold animate-pulse">Memuat data pengguna...</div>;

  return (
    <div className="p-4 md:p-8 md:pt-6 relative">
      
      {/* HEADER */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Kelola Pengguna</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Manajemen akun, kontrol akses, dan persetujuan.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => setShowExcelModal(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20">
            <FiUploadCloud className="text-lg" /> Import Excel
          </button>
          <Link to="/admin/users/add" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-500/20">
            <FiUserPlus className="text-lg" /> Tambah Baru
          </Link>
        </div>
      </div>

      {/* BANNER AKSI MASSAL ANGKATAN */}
      <div className="mb-6 p-4 md:p-5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg"><FiShield size={20} /></div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Aksi Massal Angkatan</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kunci atau buka seluruh akun mahasiswa berdasarkan angkatan lulus.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select 
            value={selectedAngkatan}
            onChange={(e) => { setSelectedAngkatan(e.target.value); setRoleFilter('Mahasiswa'); setActiveTab('approved'); }}
            className="px-3 py-2 bg-white dark:bg-[#0B1121] border border-amber-200 dark:border-amber-500/30 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 outline-none w-full md:w-auto"
          >
            <option value="">Semua Angkatan</option>
            <option value="20">Angkatan 2020</option>
            <option value="21">Angkatan 2021</option>
            <option value="22">Angkatan 2022</option>
            <option value="23">Angkatan 2023</option>
            <option value="24">Angkatan 2024</option>
            <option value="25">Angkatan 2025</option>
          </select>
          <button onClick={() => handleMassActionAngkatan(true)} title="Kunci Seluruh Angkatan Ini" className="p-2.5 bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-lg transition-colors border border-rose-200"><FiLock size={18} /></button>
          <button onClick={() => handleMassActionAngkatan(false)} title="Buka Kunci Seluruh Angkatan Ini" className="p-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-lg transition-colors border border-emerald-200"><FiUnlock size={18} /></button>
        </div>
      </div>

      {/* TABS: AKTIF vs MENUNGGU PERSETUJUAN */}
      <div className="flex items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800">
        <button onClick={() => setActiveTab('approved')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'approved' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
          Pengguna Aktif
        </button>
        <button onClick={() => setActiveTab('pending')} className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'pending' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
          Menunggu Persetujuan
          {users.filter(u => u.approval_status === 'pending').length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">
              {users.filter(u => u.approval_status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {/* 🔥 MENU AKSI CHECKBOX MASSAL (Dengan Tombol Tolak/Hapus Baru) 🔥 */}
      {selectedUsers.length > 0 && (
        <div className={`mb-4 p-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 border ${activeTab === 'pending' ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30' : 'bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700'}`}>
          <p className={`text-sm font-bold ${activeTab === 'pending' ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
            {selectedUsers.length} Pengguna dipilih
          </p>
          <div className="flex flex-wrap gap-2">
            {activeTab === 'pending' ? (
              <>
                <button onClick={handleApproveSelected} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md flex items-center gap-2">
                  <FiCheckSquare /> Setujui Terpilih
                </button>
                <button onClick={handleRejectSelected} className="bg-rose-100 hover:bg-rose-200 text-rose-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors">
                  <FiTrash2 /> Tolak Terpilih
                </button>
              </>
            ) : (
              <>
                <button onClick={() => handleLockUnlockSelected(true)} className="bg-rose-100 hover:bg-rose-200 text-rose-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                  <FiLock /> Kunci Terpilih
                </button>
                <button onClick={() => handleLockUnlockSelected(false)} className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                  <FiUnlock /> Buka Kunci
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* TABEL PENGGUNA */}
      <div className="bg-white dark:bg-[#131C31] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* BARIS PENCARIAN & FILTER ROLE */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row items-center justify-between gap-4">
          <div className="relative w-full xl:max-w-xs shrink-0">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            <input type="text" placeholder="Cari nama atau NIM..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0B1121] border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:outline-none focus:border-indigo-500"/>
          </div>

          <div className="flex bg-slate-100 dark:bg-[#0B1121] p-1 rounded-lg border border-slate-200 dark:border-slate-700/50 w-full sm:w-auto overflow-x-auto scrollbar-hide">
            {['Semua', 'Admin', 'Dosen', 'Mahasiswa'].map((role) => (
              <button key={role} onClick={() => setRoleFilter(role)} className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${roleFilter === role ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-[#0B1121]/50 border-b border-slate-100 dark:border-slate-800">
                <th className="py-3 px-4 w-10">
                  <input type="checkbox" onChange={selectAllUsers} checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                </th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase">Pengguna</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase">Kontak & ID</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase text-center">Akses</th>
                {activeTab === 'approved' && <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase text-center">Status</th>}
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr><td colSpan="6" className="py-10 text-center text-sm text-slate-500">Tidak ada data pengguna.</td></tr>
              ) : (
                filteredUsers.map((user) => {
                  const isLocked = user.is_locked === 1 || user.is_locked === true;
                  return (
                    <tr key={user.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${isLocked && activeTab === 'approved' ? 'bg-rose-50/30 dark:bg-rose-900/10' : ''}`}>
                      <td className="py-3 px-4">
                        <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => toggleSelectUser(user.id)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner shrink-0 ${isLocked && activeTab === 'approved' ? 'bg-slate-400' : 'bg-gradient-to-br from-indigo-500 to-blue-600'}`}>
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className={`font-bold text-sm leading-tight ${isLocked && activeTab === 'approved' ? 'text-slate-500 dark:text-slate-400 line-through decoration-slate-300' : 'text-slate-800 dark:text-white'}`}>{user.name}</p>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">{user.nim_nidn || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-6"><p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{user.email || '-'}</p></td>
                      <td className="py-3 px-6 text-center">{getRoleBadge(user.role)}</td>
                      
                      {activeTab === 'approved' && (
                        <td className="py-3 px-6 text-center">
                          {isLocked ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-md"><FiUserX /> Terkunci</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md"><FiUserCheck /> Aktif</span>
                          )}
                        </td>
                      )}

                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {activeTab === 'approved' && (
                            <>
                              <button onClick={() => handleToggleLockClick(user.id, user.is_locked)} title={isLocked ? "Buka Kunci" : "Kunci Akun"} className={`p-1.5 rounded-md transition-colors border ${isLocked ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/30' : 'text-slate-400 border-transparent hover:bg-amber-50 hover:text-amber-500 dark:hover:bg-slate-700'}`}>
                                {isLocked ? <FiUnlock size={16} /> : <FiLock size={16} />}
                              </button>
                              <button onClick={() => handleResetPasswordClick(user.id, user.name)} title="Reset Sandi" className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors dark:hover:bg-slate-700"><FiKey size={16} /></button>
                              <Link to={`/admin/users/edit/${user.id}`} title="Edit" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors dark:hover:bg-slate-700"><FiEdit2 size={16} /></Link>
                            </>
                          )}
                          <button onClick={() => handleDeleteClick(user.id)} title="Hapus" className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors dark:hover:bg-slate-700"><FiTrash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL UPLOAD EXCEL */}
      {showExcelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#131C31] rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Import Data SEVIMA (Excel)</h3>
              <button onClick={() => setShowExcelModal(false)} className="text-slate-400 hover:text-slate-600"><FiX size={24} /></button>
            </div>
            <form onSubmit={handleExcelUpload}>
              <div className="border-2 border-dashed border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-6 rounded-2xl text-center mb-6 relative hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors">
                <FiUploadCloud className="mx-auto text-4xl text-emerald-500 mb-3" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Klik atau Drag File .xlsx</p>
                <p className="text-xs text-slate-500">Pastikan kolom header: nama, nim, tanggal_lahir, prodi</p>
                <input type="file" accept=".xlsx, .xls" onChange={(e) => setExcelFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
              </div>
              {excelFile && <p className="text-xs font-bold text-emerald-600 mb-4 text-center bg-emerald-50 p-2 rounded-lg">File: {excelFile.name}</p>}
              <button type="submit" disabled={uploadingExcel} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition-colors flex justify-center items-center shadow-lg shadow-emerald-500/30">
                {uploadingExcel ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Mulai Import'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI & NOTIFIKASI MODERN */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-[#131C31] rounded-[2rem] p-8 w-full max-w-sm shadow-2xl flex flex-col items-center text-center border border-slate-100 dark:border-slate-800">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 shadow-inner ${
              modal.type === 'danger' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' :
              modal.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' :
              'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
            }`}>
              {modal.type === 'danger' ? <FiTrash2 size={36} /> : modal.title.includes('Reset') ? <FiKey size={36} /> : modal.type === 'warning' ? <FiAlertCircle size={36} /> : <FiCheckCircle size={36} />}
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{modal.title}</h3>
            
            {/* Memungkinkan render HTML/JSX dari state message */}
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed px-2 w-full flex justify-center">
              {modal.message}
            </div>

            <div className="flex w-full gap-3">
              {!modal.isAlert && (
                <button onClick={closePopup} className="flex-1 py-3.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Batal
                </button>
              )}
              <button onClick={modal.onConfirm || closePopup} className={`flex-1 py-3.5 rounded-xl font-bold text-white transition-all shadow-lg ${
                modal.type === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30' : 
                modal.type === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30' : 
                'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
              }`}>
                {modal.isAlert ? 'OK Mengerti' : 'Ya, Lanjutkan'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageUsers;