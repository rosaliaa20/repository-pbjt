const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Mengambil token dari header request
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: "Token tidak disediakan!" });
    }

    try {
        // Memisahkan "Bearer" dan token aslinya
        const bearerToken = token.split(' ')[1];
        const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
        req.user = decoded; // Menyimpan data user (id, role) ke request
        next(); // Lanjut ke proses berikutnya
    } catch (err) {
        return res.status(401).json({ message: "Sesi tidak valid atau kadaluarsa." });
    }
};

const verifyAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Akses ditolak. Khusus Admin!" });
    }
    next();
};

module.exports = { verifyToken, verifyAdmin };