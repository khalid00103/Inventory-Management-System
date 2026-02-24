// ============================================
// DASHBOARD MODEL - ANALYTICS & REPORTING
// ============================================

const { query } = require('../config/database');

class DashboardModel {
  // Get complete dashboard summary
  static async getSummary() {
    try {
      const [
        totalProducts,
        lowStockCount,
        todayTransactions,
        stockValue,
        recentTransactions,
        lowStockProducts,
      ] = await Promise.all([
        this.getTotalProducts(),
        this.getLowStockCount(),
        this.getTodayTransactions(),
        this.getStockValue(),
        this.getRecentTransactions(10),
        this.getLowStockProducts(10),
      ]);

      return {
        summary: {
          totalProducts,
          lowStockCount,
          todayTransactions,
          stockValue,
        },
        recentTransactions,
        lowStockProducts,
      };
    } catch (error) {
      throw new Error(`Error fetching dashboard summary: ${error.message}`);
    }
  }

  // Get total products count
  static async getTotalProducts() {
    try {
      const [result] = await query(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
        FROM products`
      );
      return result;
    } catch (error) {
      throw new Error(`Error fetching total products: ${error.message}`);
    }
  }

  // Get low stock count
  static async getLowStockCount() {
    try {
      const [result] = await query(
        `SELECT COUNT(*) as count 
         FROM products 
         WHERE current_stock <= reorder_point 
         AND status = 'active'`
      );
      return result.count;
    } catch (error) {
      throw new Error(`Error fetching low stock count: ${error.message}`);
    }
  }

  // Get today's transaction summary
  static async getTodayTransactions() {
    try {
      const summary = await query(
        `SELECT 
          transaction_type,
          COUNT(*) as count,
          SUM(ABS(quantity)) as total_quantity,
          SUM(total_amount) as total_amount
        FROM stock_transactions
        WHERE DATE(created_at) = CURDATE()
        GROUP BY transaction_type`
      );

      // Format the summary
      const formatted = {
        purchases: { count: 0, quantity: 0, amount: 0 },
        sales: { count: 0, quantity: 0, amount: 0 },
        total: { count: 0, quantity: 0, amount: 0 },
      };

      summary.forEach(item => {
        const type = item.transaction_type === 'purchase' ? 'purchases' : 'sales';
        formatted[type] = {
          count: item.count,
          quantity: item.total_quantity,
          amount: parseFloat(item.total_amount || 0),
        };
        formatted.total.count += item.count;
        formatted.total.quantity += item.total_quantity;
        formatted.total.amount += parseFloat(item.total_amount || 0);
      });

      return formatted;
    } catch (error) {
      throw new Error(`Error fetching today's transactions: ${error.message}`);
    }
  }

  // Get total stock value
  static async getStockValue() {
    try {
      const [result] = await query(
        `SELECT 
          SUM(current_stock * cost_price) as total_cost_value,
          SUM(current_stock * unit_price) as total_selling_value,
          SUM(current_stock * (unit_price - cost_price)) as potential_profit
        FROM products
        WHERE status = 'active'`
      );
      return {
        costValue: parseFloat(result.total_cost_value || 0),
        sellingValue: parseFloat(result.total_selling_value || 0),
        potentialProfit: parseFloat(result.potential_profit || 0),
      };
    } catch (error) {
      throw new Error(`Error fetching stock value: ${error.message}`);
    }
  }

  // Get recent transactions
  static async getRecentTransactions(limit = 10) {
    try {
      return await query(
        `SELECT 
          st.id,
          st.transaction_type,
          st.quantity,
          st.unit_price,
          st.total_amount,
          st.created_at,
          p.name as product_name,
          p.sku as product_sku,
          u.username as created_by_name
        FROM stock_transactions st
        LEFT JOIN products p ON st.product_id = p.id
        LEFT JOIN users u ON st.created_by = u.id
        ORDER BY st.created_at DESC
        LIMIT ${Number(limit)}`,
      );
    } catch (error) {
      throw new Error(`Error fetching recent transactions: ${error.message}`);
    }
  }

  // Get low stock products
  static async getLowStockProducts(limit = 10) {
    try {
      return await query(`
        SELECT * FROM low_stock_products
        LIMIT ${Number(limit)}
      `);
    } catch (error) {
      throw new Error(`Error fetching low stock products: ${error.message}`);
    }
  }

  // Get sales analytics for a date range
  static async getSalesAnalytics(startDate, endDate) {
    try {
      const analytics = await query(
        `SELECT 
          DATE(created_at) as date,
          COUNT(*) as transaction_count,
          SUM(ABS(quantity)) as total_quantity,
          SUM(total_amount) as total_revenue
        FROM stock_transactions
        WHERE transaction_type = 'sale'
        AND DATE(created_at) BETWEEN ? AND ?
        GROUP BY DATE(created_at)
        ORDER BY date ASC`,
        [startDate, endDate]
      );

      return analytics;
    } catch (error) {
      throw new Error(`Error fetching sales analytics: ${error.message}`);
    }
  }

  // Get top selling products
  static async getTopSellingProducts(limit = 10, days = 30) {
    try {
      return await query(
        `SELECT 
          p.id,
          p.sku,
          p.name,
          p.category,
          p.current_stock,
          SUM(ABS(st.quantity)) as total_sold,
          SUM(st.total_amount) as total_revenue,
          COUNT(*) as transaction_count
        FROM products p
        JOIN stock_transactions st ON p.id = st.product_id
        WHERE st.transaction_type = 'sale'
        AND st.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY p.id, p.sku, p.name, p.category, p.current_stock
        ORDER BY total_sold DESC
        LIMIT ?`,
        [days, limit]
      );
    } catch (error) {
      throw new Error(`Error fetching top selling products: ${error.message}`);
    }
  }

  // Get stock movement summary
  static async getStockMovementSummary(days = 7) {
    try {
      return await query(
        `SELECT 
          DATE(created_at) as date,
          transaction_type,
          SUM(ABS(quantity)) as total_quantity
        FROM stock_transactions
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY DATE(created_at), transaction_type
        ORDER BY date DESC, transaction_type`,
        [days]
      );
    } catch (error) {
      throw new Error(`Error fetching stock movement: ${error.message}`);
    }
  }

  // Get category distribution
  static async getCategoryDistribution() {
    try {
      return await query(
        `SELECT 
          category,
          COUNT(*) as product_count,
          SUM(current_stock) as total_stock,
          SUM(current_stock * cost_price) as total_value
        FROM products
        WHERE status = 'active'
        GROUP BY category
        ORDER BY total_value DESC`
      );
    } catch (error) {
      throw new Error(`Error fetching category distribution: ${error.message}`);
    }
  }
}

module.exports = DashboardModel;
