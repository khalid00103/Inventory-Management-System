// ============================================
// VALIDATION MIDDLEWARE
// ============================================

const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Product validation rules
const validateProduct = [
  body('sku')
    .trim()
    .notEmpty().withMessage('SKU is required')
    .isLength({ max: 50 }).withMessage('SKU must be less than 50 characters'),
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ max: 255 }).withMessage('Name must be less than 255 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Category must be less than 100 characters'),
  body('unit_price')
    .notEmpty().withMessage('Unit price is required')
    .isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  body('cost_price')
    .notEmpty().withMessage('Cost price is required')
    .isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('current_stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Current stock must be a non-negative integer'),
  body('min_stock_level')
    .optional()
    .isInt({ min: 0 }).withMessage('Min stock level must be a non-negative integer'),
  body('reorder_point')
    .optional()
    .isInt({ min: 0 }).withMessage('Reorder point must be a non-negative integer'),
  handleValidationErrors,
];

// Transaction validation rules
const validateTransaction = [
  body('product_id')
    .notEmpty().withMessage('Product ID is required')
    .isInt({ min: 1 }).withMessage('Product ID must be a positive integer'),
  body('transaction_type')
    .notEmpty().withMessage('Transaction type is required')
    .isIn(['purchase', 'sale', 'adjustment', 'return']).withMessage('Invalid transaction type'),
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('unit_price')
    .notEmpty().withMessage('Unit price is required')
    .isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  body('reference_number')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Reference number must be less than 100 characters'),
  body('notes')
    .optional()
    .trim(),
  handleValidationErrors,
];

// Login validation rules
const validateLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors,
];

// ID parameter validation
const validateId = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  handleValidationErrors,
];

module.exports = {
  validateProduct,
  validateTransaction,
  validateLogin,
  validatePagination,
  validateId,
  handleValidationErrors,
};
