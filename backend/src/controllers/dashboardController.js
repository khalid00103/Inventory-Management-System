// ============================================
// DASHBOARD CONTROLLER
// ============================================

const DashboardModel = require('../models/Dashboard');

class DashboardController {
  // Get complete dashboard summary
  static async getSummary(req, res) {
    try {
      const summary = await DashboardModel.getSummary();

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error('Get dashboard summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard summary',
        error: error.message,
      });
    }
  }

  // Get sales analytics
  static async getSalesAnalytics(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
        });
      }

      const analytics = await DashboardModel.getSalesAnalytics(startDate, endDate);

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      console.error('Get sales analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sales analytics',
        error: error.message,
      });
    }
  }

  // Get top selling products
  static async getTopSellingProducts(req, res) {
    try {
      const { limit = 10, days = 30 } = req.query;

      const products = await DashboardModel.getTopSellingProducts(
        parseInt(limit),
        parseInt(days)
      );

      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error('Get top selling products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch top selling products',
        error: error.message,
      });
    }
  }

  // Get stock movement summary
  static async getStockMovementSummary(req, res) {
    try {
      const { days = 7 } = req.query;

      const summary = await DashboardModel.getStockMovementSummary(parseInt(days));

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error('Get stock movement error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch stock movement summary',
        error: error.message,
      });
    }
  }

  // Get category distribution
  static async getCategoryDistribution(req, res) {
    try {
      const distribution = await DashboardModel.getCategoryDistribution();

      res.json({
        success: true,
        data: distribution,
      });
    } catch (error) {
      console.error('Get category distribution error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category distribution',
        error: error.message,
      });
    }
  }
}

module.exports = DashboardController;
