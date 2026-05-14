import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DocumentCard from '../components/DocumentCard';
import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

// Tambahkan baris ini untuk memperbaiki layar kosong:
import { Link } from 'react-router-dom';
const LandingPage = () => {
    // Data Dummy untuk presentasi UI
    const stats = [
        { label: 'Total Dokumen', value: '1,245' },
        { label: 'Tugas Akhir', value: '850' },
        { label: 'Laporan Magang', value: '312' },
        { label: 'Jurnal Mahasiswa', value: '83' },
    ];

    const categories = ['Teknik Informatika', 'Teknik Mesin', 'Teknik Elektro', 'Sistem Informasi'];

    const recentDocs = [
        { id: 1, title: 'Rancang Bangun Sistem Pencatatan Pengunjung Perpustakaan Berbasis RFID', category: 'Laporan Magang', author: 'Rosalia Indah', year: '2026', views: 124 },
        { id: 2, title: 'Implementasi Machine Learning untuk Prediksi Kelulusan Mahasiswa', category: 'Tugas Akhir', author: 'Budi Santoso', year: '2025', views: 89 },
        { id: 3, title: 'Analisis Keamanan Jaringan Menggunakan Metode Penetration Testing', category: 'Jurnal Mahasiswa', author: 'Ahmad Faisal', year: '2025', views: 210 },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />

            {/* 1. Hero Section & Search */}
            <section className="bg-blue-900 text-white py-20 px-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-800 opacity-50 transform -skew-y-3 origin-top-left z-0"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                        E-Repository Digital
                    </h1>
                    <p className="text-lg md:text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
                        Akses mudah dan cepat ke ribuan dokumen akademik, karya ilmiah, dan laporan penelitian mahasiswa Politeknik Baja Tegal.
                    </p>
                    
                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto flex bg-white p-1.5 rounded-lg shadow-xl">
                        <input 
                            type="text" 
                            placeholder="Cari judul, penulis, atau kata kunci..." 
                            className="flex-grow px-4 py-3 text-gray-800 focus:outline-none rounded-l-lg"
                        />
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-bold transition">
                            Cari
                        </button>
                    </div>
                </div>
            </section>

            {/* 2. Statistik Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {stats.map((stat, index) => (
                        <div key={index} className="p-2 border-r last:border-r-0 border-gray-100">
                            <h3 className="text-3xl font-extrabold text-blue-800">{stat.value}</h3>
                            <p className="text-sm text-gray-500 font-medium mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. Kategori Cepat Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Jelajahi Berdasarkan Program Studi</h2>
                <div className="flex flex-wrap justify-center gap-4">
                    {categories.map((cat, index) => (
                        <button key={index} className="bg-white border border-blue-200 text-blue-800 hover:bg-blue-50 px-6 py-3 rounded-full font-semibold shadow-sm transition">
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* 4. Dokumen Terbaru Section */}
            <section className="bg-white py-16 border-t border-gray-200 flex-grow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Unggahan Terbaru</h2>
                            <p className="text-gray-500 mt-1">Publikasi akademik terkini dari mahasiswa.</p>
                        </div>
                        <Link to="/documents" className="text-blue-600 font-bold hover:text-blue-800 hover:underline hidden sm:block">
                            Lihat Semua Koleksi &rarr;
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentDocs.map((doc) => (
                            <DocumentCard key={doc.id} {...doc} />
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;