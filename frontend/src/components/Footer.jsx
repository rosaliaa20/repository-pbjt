import { Link } from 'react-router-dom';
import { 
  FiMapPin, FiMail, FiPhone, FiBookOpen, 
  FiSearch, FiUser, FiMessageCircle 
} from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 font-sans border-t-4 border-yellow-400 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white p-2 rounded-xl">
                <img src="/logo.png" alt="Logo PBJT" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <h2 className="text-white font-black text-lg tracking-wider leading-tight">PBJT REPOSITORY</h2>
                <p className="text-[10px] text-yellow-400 font-bold tracking-[0.2em] uppercase">Politeknik Baja Tegal</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Pusat penyimpanan dan publikasi karya ilmiah, tugas akhir, dan laporan magang mahasiswa Politeknik Baja Tegal secara digital dan terintegrasi.
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-white font-black text-sm uppercase tracking-widest mb-6 border-b border-slate-700 pb-4">Tautan Cepat</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-yellow-400 transition-colors flex items-center gap-2"><FiBookOpen className="text-slate-600" /> Beranda Utama</Link></li>
              <li><Link to="/documents" className="hover:text-yellow-400 transition-colors flex items-center gap-2"><FiSearch className="text-slate-600" /> Eksplorasi Dokumen</Link></li>
              <li><Link to="/login" className="hover:text-yellow-400 transition-colors flex items-center gap-2"><FiUser className="text-slate-600" /> Portal Mahasiswa & Admin</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-white font-black text-sm uppercase tracking-widest mb-6 border-b border-slate-700 pb-4">Hubungi Kami</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <FiMapPin className="text-yellow-400 text-lg shrink-0 mt-0.5" />
                <span>
                  Jl. Raya Slawi-Jatibarang Km 4 Dukuhwaru, Kab. Tegal, Jawa Tengah, 52451.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-yellow-400 text-lg shrink-0" />
                <a href="mailto:info@pbjt.ac.id" className="hover:text-white transition-colors">info@pbjt.ac.id</a>
              </li>
              
              <li className="flex items-center gap-3">
                {/* Tautan Langsung ke WhatsApp */}
                <FiMessageCircle className="text-emerald-400 text-lg shrink-0" />
                <a 
                  href="https://wa.me/6282325580008" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-emerald-400 transition-colors font-bold"
                >
                  0823-2558-0008 (WhatsApp)
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>
      
      <div className="bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between text-xs gap-4">
          <p>&copy; {new Date().getFullYear()} Politeknik Baja Tegal. Hak Cipta Dilindungi.</p>
          <p className="text-slate-500">
            Dikembangkan oleh Rosalia Indah Dwi Putriningsih.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;