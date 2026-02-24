// ============================================
// PRODUCT MODEL
// ============================================

const { query, transaction } = require('../config/database');

class ProductModel {
  // Get all products with pagination and filtering
  static async getAll(filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        status = 'active',
        search,
        lowStock = false,
      } = filters;

      const offset = (page - 1) * limit;
      let whereClause = 'WHERE 1=1';
      const params = [];

      // Apply filters
      if (status) {
        whereClause += ' AND status = ?';
        params.push(status);
      }

      if (category) {
        whereClause += ' AND category = ?';
        params.push(category);
      }

      if (search) {
        whereClause += ' AND (name LIKE ? OR sku LIKE ? OR description LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (lowStock) {
        whereClause += ' AND current_stock <= reorder_point';
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`;
      const [countResult] = await query(countQuery, params);
      const total = countResult.total;

      // Get paginated results
      const dataQuery = `
        SELECT 
          id,
          sku,
          name,
          description,
          category,
          unit_price,
          cost_price,
          current_stock,
          min_stock_level,
          max_stock_level,
          reorder_point,
          supplier,
          status,
          created_at,
          updated_at,
          CASE 
            WHEN current_stock <= reorder_point THEN true 
            ELSE false 
          END as is_low_stock
        FROM products 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${Number(limit)} OFFSET ${Number(offset)}
      `;

      const products = await query(dataQuery, params);

      return {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }

  // Get product by ID
  static async getById(id) {
    try {
      const products = await query(
        `SELECT 
          *,
          CASE 
            WHEN current_stock <= reorder_point THEN true 
            ELSE false 
          END as is_low_stock
        FROM products 
        WHERE id = ?`,
        [id]
      );
      return products[0] || null;
    } catch (error) {
      throw new Error(`Error fetching product: ${error.message}`);
    }
  }

  // Get product by SKU
  static async getBySku(sku) {
    try {
      const products = await query('SELECT * FROM products WHERE sku = ?', [sku]);
      return products[0] || null;
    } catch (error) {
      throw new Error(`Error fetching product by SKU: ${error.message}`);
    }
  }

  // Create new product
  static async create(productData) {
    try {
      const {
        sku,
        name,
        description,
        category,
        unit_price,
        cost_price,
        current_stock = 0,
        min_stock_level = 10,
        max_stock_level = 1000,
        reorder_point = 20,
        supplier,
        status = 'active',
      } = productData;

      // Check if SKU already exists
      const existing = await this.getBySku(sku);
      if (existing) {
        throw new Error('Product with this SKU already exists');
      }

      const result = await query(
        `INSERT INTO products 
        (sku, name, description, category, unit_price, cost_price, current_stock, 
         min_stock_level, max_stock_level, reorder_point, supplier, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sku,
          name,
          description,
          category,
          unit_price,
          cost_price,
          current_stock,
          min_stock_level,
          max_stock_level,
          reorder_point,
          supplier,
          status,
        ]
      );

      return await this.getById(result.insertId);
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }
  }

  // Update product
  static async update(id, productData) {
    try {
      const product = await this.getById(id);
      if (!product) {
        throw new Error('Product not found');
      }

      const {
        sku,
        name,
        description,
        category,
        unit_price,
        cost_price,
        min_stock_level,
        max_stock_level,
        reorder_point,
        supplier,
        status,
      } = productData;

      // If SKU is being changed, check if new SKU exists
      if (sku && sku !== product.sku) {
        const existing = await this.getBySku(sku);
        if (existing) {
          throw new Error('Product with this SKU already exists');
        }
      }

      await query(
        `UPDATE products 
        SET sku = ?, name = ?, description = ?, category = ?, 
            unit_price = ?, cost_price = ?, min_stock_level = ?,
            max_stock_level = ?, reorder_point = ?, supplier = ?, status = ?
        WHERE id = ?`,
        [
          sku || product.sku,
          name || product.name,
          description !== undefined ? description : product.description,
          category || product.category,
          unit_price !== undefined ? unit_price : product.unit_price,
          cost_price !== undefined ? cost_price : product.cost_price,
          min_stock_level !== undefined ? min_stock_level : product.min_stock_level,
          max_stock_level !== undefined ? max_stock_level : product.max_stock_level,
          reorder_point !== undefined ? reorder_point : product.reorder_point,
          supplier || product.supplier,
          status || product.status,
          id,
        ]
      );

      return await this.getById(id);
    } catch (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }
  }

  // Delete product (soft delete by changing status)
  static async delete(id) {
    try {
      const product = await this.getById(id);
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if product has transactions
      const transactions = await query(
        'SELECT COUNT(*) as count FROM stock_transactions WHERE product_id = ?',
        [id]
      );

      if (transactions[0].count > 0) {
        // Soft delete - change status to inactive
        await query('UPDATE products SET status = ? WHERE id = ?', ['inactive', id]);
        return { deleted: false, message: 'Product marked as inactive (has transaction history)' };
      } else {
        // Hard delete - no transactions
        await query('DELETE FROM products WHERE id = ?', [id]);
        return { deleted: true, message: 'Product permanently deleted' };
      }
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }

  // Get low stock products
  static async getLowStock() {
    try {
      return await query(
        `SELECT * FROM low_stock_products ORDER BY shortage_quantity DESC`
      );
    } catch (error) {
      throw new Error(`Error fetching low stock products: ${error.message}`);
    }
  }

  // Get product categories
  static async getCategories() {
    try {
      return await query(
        `SELECT DISTINCT category, COUNT(*) as count 
         FROM products 
         WHERE status = 'active' AND category IS NOT NULL
         GROUP BY category 
         ORDER BY category`
      );
    } catch (error) {
      throw new Error(`Error fetching categories: ${error.message}`);
    }
  }
}

module.exports = ProductModel;
