const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');

router.get('/stats', systemController.getSystemStats);
router.get('/logs', systemController.getSystemLogs);
router.get('/export', systemController.exportData);
router.get('/backup', systemController.backupDatabase); // Pastikan ini ada

module.exports = router;