const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

router.get('/stats', verifyToken, verifyAdmin, systemController.getSystemStats);
router.get('/logs', verifyToken, verifyAdmin, systemController.getSystemLogs);
router.get('/export', verifyToken, verifyAdmin, systemController.exportData);
router.get('/wa-qr', systemController.getWaQr);

module.exports = router;