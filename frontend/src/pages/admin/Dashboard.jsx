import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiUsers, FiFileText, FiEye, FiActivity, FiClock, FiCheckCircle, 
  FiAlertCircle, FiShield, FiUserPlus, FiLock 
} from "react-icons/fi";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeLogTab, setActiveLogTab] = useState('dokumen');
  const [systemLogs, setSystemLogs] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  const [stats, setStats] = useState({
    totalDocs: 0, totalViews: 0, pendingDocs: 0,
    chartData: [], recentActivity: [],
  });

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get("/api/documents");
      const logResponse = await axios.get("/api/logs");
      
      setSystemLogs(logResponse.data);

      const docs = response.data;
      const totalViews = docs.reduce((sum, doc) => sum + (doc.views || 0), 0);
      const pendingDocs = docs.filter(doc => !doc.status || doc.status.toLowerCase() === "pending").length;
      
      const prodiCount = { Informatika: 0, Mesin: 0, Otomotif: 0, Elektronika: 0 };
      docs.forEach((doc) => {
        if (doc.department?.includes("Informatika")) prodiCount["Informatika"]++;
        else if (doc.department?.includes("Mesin")) prodiCount["Mesin"]++;
        else if (doc.department?.includes("Otomotif")) prodiCount["Otomotif"]++;
        else if (doc.department?.includes("Elektronika")) prodiCount["Elektronika"]++;
      });

      const chartData = [
        { name: "T. Informatika", total: prodiCount["Informatika"], color: "#6366f1" },
        { name: "T. Mesin", total: prodiCount["Mesin"], color: "#10b981" },
        { name: "T. Otomotif", total: prodiCount["Otomotif"], color: "#f43f5e" },
        { name: "T. Elektronika", total: prodiCount["Elektronika"], color: "#f59e0b" },
      ];

      setStats({
        totalDocs: docs.length, totalViews, pendingDocs, chartData,
        recentActivity: [...docs].sort((a, b) => {
          const timeA = new Date(a.updated_at || a.created_at).getTime();
          const timeB = new Date(b.updated_at || b.created_at).getTime();
          return timeB - timeA;
        }).slice(0, 5)
      });
    } catch (error) { 
      console.error("Gagal mengambil data realtime:", error); 
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchDashboardData();
    const intervalId = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const timeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    let diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 0) diffInSeconds = 0;
    if (diffInSeconds < 60) return 'Baru saja';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} mnt yll`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} jam yll`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Kemarin';
    if (diffInDays < 7) return `${diffInDays} hari yll`;
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  };

  const getStatusConfig = (status) => {
    const s = status ? status.toLowerCase() : 'pending';
    if (s === 'terbit' || s === 'approved') return { icon: <FiCheckCircle className="text-lg" />, bgClass: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' };
    if (s === 'revisi' || s === 'ditolak' || s === 'rejected') return { icon: <FiAlertCircle className="text-lg" />, bgClass: 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400' };
    return { icon: <FiClock className="text-lg" />, bgClass: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' };
  };

  // 🔥 PERBAIKAN 1: StatCard Dibuat Lebih Compact 🔥
  const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
    <div className="bg-white dark:bg-[#131C31] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all">
      <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-xl ${bgClass} ${colorClass}`}>
        <Icon />
      </div>
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white transition-colors">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8">
      
      <div className="mb-6">
        <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
          <FiActivity className="text-indigo-500" /> Dashboard Overview
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Ringkasan aktivitas E-Repository Politeknik Baja Tegal.</p>
      </div>

      {/* Jarak antar kartu dirapatkan (gap-4) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Dokumen" value={stats.totalDocs} icon={FiFileText} bgClass="bg-indigo-500/10" colorClass="text-indigo-600 dark:text-indigo-400" />
        <StatCard title="Menunggu Approval" value={stats.pendingDocs} icon={FiUsers} bgClass="bg-amber-500/10" colorClass="text-amber-600 dark:text-amber-400" />
        <StatCard title="Total Tayangan" value={stats.totalViews} icon={FiEye} bgClass="bg-emerald-500/10" colorClass="text-emerald-600 dark:text-emerald-400" />
      </div>

      {/* Jarak antar grid utama dirapatkan (gap-6) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART SECTION */}
        <div className="lg:col-span-2 bg-white dark:bg-[#131C31] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
          <h2 className="text-base font-black text-slate-900 dark:text-white mb-6 transition-colors">Distribusi Dokumen per Prodi</h2>
          
          {/* 🔥 PERBAIKAN 2: Tinggi Grafik Dikurangi (h-[260px]) 🔥 */}
          <div className="h-[260px] w-full relative">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.05} vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} fontWeight={700} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#94a3b8" fontSize={9} fontWeight={700} tickLine={false} axisLine={false} dx={-5} />
                  <Tooltip 
                    cursor={{ fill: "transparent" }} 
                    contentStyle={{ backgroundColor: "#1e293b", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
                  />
                  <Bar dataKey="total" barSize={30} radius={[8, 8, 8, 8]}>
                    {stats.chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ACTIVITY LOG SECTION */}
        <div className="bg-white dark:bg-[#131C31] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all flex flex-col">
          <div className="flex items-center justify-between mb-5 shrink-0">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FiClock className="text-indigo-500" /> Aktivitas
            </h2>
            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700/50">
              <button onClick={() => setActiveLogTab('dokumen')} className={`px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold rounded-md transition-all ${activeLogTab === 'dokumen' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Dokumen</button>
              <button onClick={() => setActiveLogTab('sistem')} className={`px-2.5 py-1 text-[9px] uppercase tracking-wider font-bold rounded-md transition-all ${activeLogTab === 'sistem' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Sistem</button>
            </div>
          </div>
          
          <div className="flex-1 space-y-2.5 overflow-y-auto pr-1 scrollbar-hide max-h-[300px]">
            {activeLogTab === 'dokumen' && (
              stats.recentActivity.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                  <FiFileText className="text-3xl mb-2 opacity-30" />
                  <p className="text-xs font-medium">Belum ada aktivitas.</p>
                </div>
              ) : (
                stats.recentActivity.map((item, index) => {
                  const config = getStatusConfig(item.status);
                  return (
                    <div key={index} onClick={() => navigate('/admin/documents')} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer border border-transparent transition-all group">
                      <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${config.bgClass}`}>{config.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-500 transition-colors">{item.title}</p>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-[10px] text-slate-500 truncate max-w-[100px]">{item.document_author || 'Anonim'}</p>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{timeAgo(item.updated_at || item.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            )}

            {activeLogTab === 'sistem' && (
              systemLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                  <FiShield className="text-3xl mb-2 opacity-30" />
                  <p className="text-xs font-medium">Log kosong.</p>
                </div>
              ) : (
                systemLogs.slice(0, 10).map((log, index) => {
                  let icon, bgClass;
                  if (log.type === 'login_success') { icon = <FiShield size={16} />; bgClass = 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'; }
                  else if (log.type === 'login_failed') { icon = <FiLock size={16} />; bgClass = 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'; }
                  else { icon = <FiUserPlus size={16} />; bgClass = 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'; }

                  return (
                    <div key={log.id || index} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-transparent transition-all">
                      <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${bgClass}`}>{icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{log.description}</p>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-[10px] text-slate-500 truncate">{log.user_name}</p>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{timeAgo(log.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
          
          <button 
            onClick={() => navigate(activeLogTab === 'dokumen' ? '/admin/documents' : '/admin/users')}
            className="w-full mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 hover:text-indigo-500 transition-colors uppercase tracking-widest flex items-center justify-center gap-2 group"
          >
            Lihat Detail <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;