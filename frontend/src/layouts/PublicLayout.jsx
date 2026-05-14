import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-[#0B1121] transition-colors duration-300">
      
      {/* --- NAVBAR RESPONSIF --- */}
      <Navbar />

      {/* --- AREA KONTEN HALAMAN --- */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* --- FOOTER KOMPONEN --- */}
      {/* 
          Sekarang kita panggil komponen Footer yang ada di src/components/Footer.jsx 
          supaya perubahan kode pos & WhatsApp otomatis muncul di sini.
      */}
      <Footer />

    </div>
  );
};

export default PublicLayout;