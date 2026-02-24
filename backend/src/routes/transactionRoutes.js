// ============================================
// TRANSACTION ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  validateTransaction,
  validateId,
  validatePagination,
} = require('../middleware/validator');

// All routes require authentication
router.use(authenticateToken);

// GET routes
router.get('/', validatePagination, TransactionController.getAll);
router.get('/today', TransactionController.getToday);
router.get('/summary', TransactionController.getSummary);
router.get('/daily-summary', TransactionController.getDailySummary);
router.get('/product/:productId/history', TransactionController.getProductHistory);
router.get('/:id', validateId, TransactionController.getById);

// POST routes (All authenticated users can create transactions)
router.post('/', validateTransaction, TransactionController.create);

module.exports = router;
