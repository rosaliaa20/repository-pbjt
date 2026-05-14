import axios from 'axios';

const api = axios.create({
    // Sesuaikan port ini dengan port backend Express.js kamu nanti
    baseURL: 'http://localhost:5000/api', 
});

// Nanti kita bisa tambahkan interceptor untuk token JWT di sini
export default api;