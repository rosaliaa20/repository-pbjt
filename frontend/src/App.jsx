import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Komponen Pelindung (Satpam)
import AdminRoute from './components/AdminRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout'; // Di folder komputermu ini ada di components/AdminLayout atau layouts/AdminLayout? Sesuai kodemu ini di layouts/

// Pages (Public & Auth)
import Home from './pages/public/Home';
import Documents from './pages/public/Documents';
import DocumentDetail from './pages/public/DocumentDetail';
import PdfViewer from './pages/public/PdfViewer';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import StudentUpload from './pages/public/StudentUpload';
import StudentDashboard from './pages/public/StudentDashboard';
import StudentEditDoc from './pages/public/StudentEditDoc'; 
import Profile from './pages/public/Profile'; 

// Pages (Admin)
import ManageDocs from './pages/admin/ManageDocs';
import UploadDocument from './pages/admin/UploadDocument';
import Dashboard from './pages/admin/Dashboard';
import EditDoc from './pages/admin/EditDoc';
import EditUser from './pages/admin/EditUser';
import AddUser from './pages/admin/AddUser';
import ManageUsers from './pages/admin/ManageUsers';
import Settings from './pages/admin/Settings'; // 🔥 IMPORT HALAMAN SETTINGS DI SINI 🔥
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <BrowserRouter>
      {/* 🔥 2. TAMBAHKAN TOASTER DI SINI (Posisi Bawah Kanan) 🔥 */}
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: '#1e293b', // Warna gelap elegan
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: 'bold'
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } }
        }} 
      />
      
      <Routes>
        
        {/* === RUTE PUBLIK & MAHASISWA === */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="documents" element={<Documents />} />
          <Route path="detail/:id" element={<DocumentDetail />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Fitur Khusus Mahasiswa */}
          <Route path="upload" element={<StudentUpload />} />
          <Route path="dashboard-student" element={<StudentDashboard />} />
          <Route path="edit-upload/:id" element={<StudentEditDoc />} /> 
        </Route>

        {/* Viewer dipisah agar bisa full screen tanpa navbar/footer standar */}
        <Route path="/viewer/:id" element={<PdfViewer />} /> 

        {/* === RUTE AUTH === */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      

        {/* === RUTE ADMIN (SANGAT RAHASIA) === */}
        {/* Semua rute di dalam AdminRoute hanya bisa diakses jika role = 'admin' */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Manajemen Dokumen */}
            <Route path="documents" element={<ManageDocs />} />
            <Route path="documents/add" element={<UploadDocument />} /> 
            <Route path="documents/edit/:id" element={<EditDoc />} />
            
            {/* Manajemen Pengguna */}
            <Route path="users" element={<ManageUsers />} />
            <Route path="users/add" element={<AddUser />} />
            <Route path="users/edit/:id" element={<EditUser />} /> {/* PASTIKAN BARIS INI ADA */}


            {/* 🔥 RUTE PENGATURAN SISTEM (BACKUP DB) DI SINI 🔥 */}
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;