const express = require('express');
const { getDashboardSummary } = require('../controllers/dashboardController');
const { requirePermission } = require('../middleware/authMiddleware');
const { PERMISSIONS } = require('../constants/permissions');
const router = express.Router();
router.get('/summary', requirePermission(PERMISSIONS.REPORTS_READ), getDashboardSummary);
module.exports = router;
