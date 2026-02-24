// ============================================
// DASHBOARD ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Dashboard routes
router.get('/summary', DashboardController.getSummary);
router.get('/sales-analytics', DashboardController.getSalesAnalytics);
router.get('/top-selling', DashboardController.getTopSellingProducts);
router.get('/stock-movement', DashboardController.getStockMovementSummary);
router.get('/category-distribution', DashboardController.getCategoryDistribution);

module.exports = router;
