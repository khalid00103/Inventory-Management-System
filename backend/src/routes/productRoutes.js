// ============================================
// PRODUCT ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  validateProduct,
  validateId,
  validatePagination,
} = require('../middleware/validator');

// All routes require authentication
router.use(authenticateToken);

// GET routes
router.get('/', validatePagination, ProductController.getAll);
router.get('/categories', ProductController.getCategories);
router.get('/low-stock', ProductController.getLowStock);
router.get('/:id', validateId, ProductController.getById);

// POST routes (Admin and Manager only)
router.post(
  '/',
  authorizeRoles('admin', 'manager'),
  validateProduct,
  ProductController.create
);

// PUT routes (Admin and Manager only)
router.put(
  '/:id',
  authorizeRoles('admin', 'manager'),
  validateId,
  validateProduct,
  ProductController.update
);

// DELETE routes (Admin only)
router.delete(
  '/:id',
  authorizeRoles('admin'),
  validateId,
  ProductController.delete
);

module.exports = router;
