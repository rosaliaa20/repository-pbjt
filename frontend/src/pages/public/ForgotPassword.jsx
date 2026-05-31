import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiArrowLeft, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import axios from "axios";
import { motion } from "framer-motion";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await axios.post("/api/auth/forgot-password", { email });
      setMessage({ type: "success", text: response.data.message });
      setEmail("");
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Terjadi kesalahan. Silakan coba lagi." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-0 flex items-center justify-center font-sans px-4 bg-slate-50 dark:bg-[#0F172A] overflow-hidden"
    >
      {/* 🔥 BACKGROUND WALLPAPER RAK BUKU 🔥 */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src="/wallpaper.png"
          alt="Background" 
          className="w-full h-full object-cover opacity-30 dark:opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/80 to-white/40 dark:from-slate-900/60 dark:via-slate-900/90 dark:to-slate-900/60"></div>
      </div>

      {/* CARD KONTEN */}
      <div className="w-full max-w-md relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 rounded-[2rem] p-6 md:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.1)]"
        >
          
          <button onClick={() => navigate("/login")} className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white mb-6 transition-colors">
            <FiArrowLeft /> Kembali ke Login
          </button>

          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Pemulihan Password</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">Masukkan alamat email aktif Anda yang terdaftar di sistem. Kami akan mengirimkan tautan untuk mereset kata sandi.</p>
          </div>

          {message.text && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className={`mb-6 p-4 rounded-xl border flex items-start gap-3 text-sm font-medium shadow-sm ${
              message.type === "success" 
                ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                : "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400"
            }`}>
              {message.type === "success" ? <FiCheckCircle className="mt-0.5 shrink-0 text-lg" /> : <FiAlertCircle className="mt-0.5 shrink-0 text-lg" />}
              <span className="leading-relaxed">{message.text}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-3 mb-1.5">Alamat Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input 
                  type="email" 
                  required 
                  placeholder="nama@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 dark:focus:border-yellow-400 text-slate-800 dark:text-white text-sm transition-colors"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex justify-center items-center mt-2">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Kirim Email Pemulihan"}
            </button>
          </form>

        </motion.div>
        
        <p className="text-center mt-6 text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest relative z-10">
          &copy; 2026 Politeknik Baja Tegal
        </p>
      </div>
    </motion.div>
  );
};

export default ForgotPassword;