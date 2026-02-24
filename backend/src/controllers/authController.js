// ============================================
// AUTHENTICATION CONTROLLER
// ============================================

const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');

class AuthController {
  // Login
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // Authenticate user
      const user = await UserModel.authenticate(username, password);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
          },
          token,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message,
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const user = await UserModel.getById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch profile',
        error: error.message,
      });
    }
  }

  // Logout (client-side token removal)
  static async logout(req, res) {
    res.json({
      success: true,
      message: 'Logout successful',
    });
  }
}

module.exports = AuthController;
