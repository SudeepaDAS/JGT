// routes/inventoryReportRoutes.js
const express = require('express');
const router = express.Router();
const { getInventoryReport } = require('../controllers/inventoryReportController');

// Matches GET /api/inventory-report
router.get('/', getInventoryReport);

module.exports = router;
