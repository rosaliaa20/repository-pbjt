const jwt = require('jsonwebtoken');

// Resolve once at startup — consistent with authController
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ error: { code: 'TOKEN_MISSING', message: 'Token autentikasi tidak disediakan.' } });
    }

    try {
        const bearerToken = token.split(' ')[1];
        if (!bearerToken) {
            return res.status(403).json({ error: { code: 'TOKEN_INVALID', message: 'Format token tidak valid. Gunakan: Bearer <token>' } });
        }
        const decoded = jwt.verify(bearerToken, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: { code: 'TOKEN_EXPIRED', message: 'Sesi tidak valid atau telah kadaluarsa. Silakan login kembali.' } });
    }
};

const verifyAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Akses ditolak. Halaman ini khusus Admin.' } });
    }
    next();
};

module.exports = { verifyToken, verifyAdmin };