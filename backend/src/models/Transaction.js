// ============================================
// TRANSACTION MODEL - HANDLES STOCK UPDATES
// ============================================

const { query, transaction } = require('../config/database');
const ProductModel = require('./Product');

class TransactionModel {
  // Create new transaction with automatic stock update
  // This is the critical method for maintaining data consistency
  static async create(transactionData, userId) {
    return await transaction(async (connection) => {
      try {
        const {
          product_id,
          transaction_type,
          quantity,
          unit_price,
          reference_number,
          notes,
        } = transactionData;

        // Lock product row for update to prevent race conditions
        const [products] = await connection.execute(
          'SELECT * FROM products WHERE id = ? FOR UPDATE',
          [product_id]
        );

        if (products.length === 0) {
          throw new Error('Product not found');
        }

        const product = products[0];
        const currentStock = product.current_stock;
        let newStock;
        let adjustedQuantity;

        // Calculate new stock based on transaction type
        switch (transaction_type) {
          case 'purchase':
          case 'return':
            adjustedQuantity = Math.abs(quantity);
            newStock = currentStock + adjustedQuantity;
            break;
          case 'sale':
          case 'adjustment':
            adjustedQuantity = -Math.abs(quantity);
            newStock = currentStock - Math.abs(quantity);
            break;
          default:
            throw new Error('Invalid transaction type');
        }

        // Check for negative stock
        if (newStock < 0) {
          throw new Error(
            `Insufficient stock. Available: ${currentStock}, Required: ${Math.abs(quantity)}`
          );
        }

        // Check for max stock limit
        if (newStock > product.max_stock_level) {
          throw new Error(
            `Stock would exceed maximum limit of ${product.max_stock_level}`
          );
        }

        // Insert transaction record
        const [transactionResult] = await connection.execute(
          `INSERT INTO stock_transactions 
          (product_id, transaction_type, quantity, unit_price, stock_before, 
           stock_after, reference_number, notes, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            product_id,
            transaction_type,
            adjustedQuantity,
            unit_price,
            currentStock,
            newStock,
            reference_number,
            notes,
            userId,
          ]
        );

        // Update product stock
        await connection.execute(
          'UPDATE products SET current_stock = ? WHERE id = ?',
          [newStock, product_id]
        );

        // Fetch the created transaction
        const [newTransaction] = await connection.execute(
          `SELECT 
            st.*,
            p.name as product_name,
            p.sku as product_sku,
            u.username as created_by_name
          FROM stock_transactions st
          LEFT JOIN products p ON st.product_id = p.id
          LEFT JOIN users u ON st.created_by = u.id
          WHERE st.id = ?`,
          [transactionResult.insertId]
        );

        return newTransaction[0];
      } catch (error) {
        throw new Error(`Transaction failed: ${error.message}`);
      }
    });
  }

  // Get all transactions with pagination and filtering
  static async getAll(filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        product_id,
        transaction_type,
        startDate,
        endDate,
      } = filters;

      const offset = (page - 1) * limit;
      let whereClause = 'WHERE 1=1';
      const params = [];

      if (product_id) {
        whereClause += ' AND st.product_id = ?';
        params.push(product_id);
      }

      if (transaction_type) {
        whereClause += ' AND st.transaction_type = ?';
        params.push(transaction_type);
      }

      if (startDate) {
        whereClause += ' AND DATE(st.created_at) >= ?';
        params.push(startDate);
      }

      if (endDate) {
        whereClause += ' AND DATE(st.created_at) <= ?';
        params.push(endDate);
      }

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM stock_transactions st 
        ${whereClause}
      `;
      const [countResult] = await query(countQuery, params);
      const total = countResult.total;

      // Get paginated results
      const dataQuery = `
        SELECT 
          st.*,
          p.name as product_name,
          p.sku as product_sku,
          u.username as created_by_name
        FROM stock_transactions st
        LEFT JOIN products p ON st.product_id = p.id
        LEFT JOIN users u ON st.created_by = u.id
        ${whereClause}
        ORDER BY st.created_at DESC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `;
      
      const transactions = await query(dataQuery, params);

      return {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Error fetching transactions: ${error.message}`);
    }
  }

  // Get transaction by ID
  static async getById(id) {
    try {
      const transactions = await query(
        `SELECT 
          st.*,
          p.name as product_name,
          p.sku as product_sku,
          u.username as created_by_name
        FROM stock_transactions st
        LEFT JOIN products p ON st.product_id = p.id
        LEFT JOIN users u ON st.created_by = u.id
        WHERE st.id = ?`,
        [id]
      );
      return transactions[0] || null;
    } catch (error) {
      throw new Error(`Error fetching transaction: ${error.message}`);
    }
  }

  // Get today's transactions
  static async getToday() {
    try {
      return await query(
        `SELECT 
          st.*,
          p.name as product_name,
          p.sku as product_sku,
          u.username as created_by_name
        FROM stock_transactions st
        LEFT JOIN products p ON st.product_id = p.id
        LEFT JOIN users u ON st.created_by = u.id
        WHERE DATE(st.created_at) = CURDATE()
        ORDER BY st.created_at DESC`
      );
    } catch (error) {
      throw new Error(`Error fetching today's transactions: ${error.message}`);
    }
  }

  // Get transaction summary by date range
  static async getSummary(startDate, endDate) {
    try {
      const summary = await query(
        `SELECT 
          transaction_type,
          COUNT(*) as count,
          SUM(ABS(quantity)) as total_quantity,
          SUM(total_amount) as total_amount
        FROM stock_transactions
        WHERE DATE(created_at) BETWEEN ? AND ?
        GROUP BY transaction_type`,
        [startDate, endDate]
      );

      return summary;
    } catch (error) {
      throw new Error(`Error fetching transaction summary: ${error.message}`);
    }
  }

  // Get product transaction history
  static async getProductHistory(productId, limit = 50) {
    try {
      return await query(
        `SELECT 
          st.*,
          u.username as created_by_name
        FROM stock_transactions st
        LEFT JOIN users u ON st.created_by = u.id
        WHERE st.product_id = ?
        ORDER BY st.created_at DESC
        LIMIT ?`,
        [productId, limit]
      );
    } catch (error) {
      throw new Error(`Error fetching product history: ${error.message}`);
    }
  }

  // Get daily summary
  static async getDailySummary() {
    try {
      return await query(
        `SELECT * FROM daily_transaction_summary 
         WHERE transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         ORDER BY transaction_date DESC`
      );
    } catch (error) {
      throw new Error(`Error fetching daily summary: ${error.message}`);
    }
  }
}

module.exports = TransactionModel;
