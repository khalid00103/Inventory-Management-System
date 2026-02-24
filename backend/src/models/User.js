// ============================================
// USER MODEL
// ============================================

const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

class UserModel {
  // Get user by username
  static async getByUsername(username) {
    try {
      const users = await query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return users[0] || null;
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  // Get user by ID
  static async getById(id) {
    try {
      const users = await query(
        'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
        [id]
      );
      return users[0] || null;
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  // Create new user
  static async create(userData) {
    try {
      const { username, password, email, role = 'staff' } = userData;

      // Check if username exists
      const existing = await this.getByUsername(username);
      if (existing) {
        throw new Error('Username already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(
        password,
        parseInt(process.env.BCRYPT_ROUNDS) || 10
      );

      const result = await query(
        'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
        [username, hashedPassword, email, role]
      );

      return await this.getById(result.insertId);
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw new Error(`Error verifying password: ${error.message}`);
    }
  }

  // Authenticate user
  static async authenticate(username, password) {
    try {
      const user = await this.getByUsername(username);
      if (!user) {
        return null;
      }

      const isValid = await this.verifyPassword(password, user.password);
      if (!isValid) {
        return null;
      }

      // Remove password from returned user object
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw new Error(`Error authenticating user: ${error.message}`);
    }
  }
}

module.exports = UserModel;
