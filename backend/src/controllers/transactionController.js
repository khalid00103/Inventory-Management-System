// ============================================
// TRANSACTION CONTROLLER
// ============================================

const TransactionModel = require('../models/Transaction');

class TransactionController {
  // Create new transaction
  static async create(req, res) {
    try {
      const userId = req.user.id;
      const transaction = await TransactionModel.create(req.body, userId);

      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: transaction,
      });
    } catch (error) {
      console.error('Create transaction error:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('Insufficient stock')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('exceed maximum')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create transaction',
        error: error.message,
      });
    }
  }

  // Get all transactions
  static async getAll(req, res) {
    try {
      const { page, limit, product_id, transaction_type, startDate, endDate } = req.query;

      const result = await TransactionModel.getAll({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        product_id: product_id ? parseInt(product_id) : undefined,
        transaction_type,
        startDate,
        endDate,
      });

      res.json({
        success: true,
        data: result.transactions,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transactions',
        error: error.message,
      });
    }
  }

  // Get transaction by ID
  static async getById(req, res) {
    try {
      const transaction = await TransactionModel.getById(req.params.id);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
      }

      res.json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      console.error('Get transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transaction',
        error: error.message,
      });
    }
  }

  // Get today's transactions
  static async getToday(req, res) {
    try {
      const transactions = await TransactionModel.getToday();

      res.json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      console.error('Get today transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch today\'s transactions',
        error: error.message,
      });
    }
  }

  // Get transaction summary
  static async getSummary(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
        });
      }

      const summary = await TransactionModel.getSummary(startDate, endDate);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error('Get summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transaction summary',
        error: error.message,
      });
    }
  }

  // Get product transaction history
  static async getProductHistory(req, res) {
    try {
      const { productId } = req.params;
      const { limit } = req.query;

      const history = await TransactionModel.getProductHistory(
        parseInt(productId),
        parseInt(limit) || 50
      );

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      console.error('Get product history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product history',
        error: error.message,
      });
    }
  }

  // Get daily summary
  static async getDailySummary(req, res) {
    try {
      const summary = await TransactionModel.getDailySummary();

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error('Get daily summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch daily summary',
        error: error.message,
      });
    }
  }
}

module.exports = TransactionController;
