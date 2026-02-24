// ============================================
// AUTHENTICATION ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateLogin } = require('../middleware/validator');

// Public routes
router.post('/login', validateLogin, AuthController.login);
router.post('/logout', AuthController.logout);

// Protected routes
router.get('/profile', authenticateToken, AuthController.getProfile);

module.exports = router;
