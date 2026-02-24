// ============================================
// PRODUCT CONTROLLER
// ============================================

const ProductModel = require('../models/Product');

class ProductController {
  // Get all products
  static async getAll(req, res) {
    try {
      const { page, limit, category, status, search, lowStock } = req.query;
      
      const result = await ProductModel.getAll({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        category,
        status,
        search,
        lowStock: lowStock === 'true',
      });

      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: error.message,
      });
    }
  }

  // Get product by ID
  static async getById(req, res) {
    try {
      const product = await ProductModel.getById(req.params.id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch product',
        error: error.message,
      });
    }
  }

  // Create product
  static async create(req, res) {
    try {
      const product = await ProductModel.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      console.error('Create product error:', error);
      
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: error.message,
      });
    }
  }

  // Update product
  static async update(req, res) {
    try {
      const product = await ProductModel.update(req.params.id, req.body);

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error) {
      console.error('Update product error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update product',
        error: error.message,
      });
    }
  }

  // Delete product
  static async delete(req, res) {
    try {
      const result = await ProductModel.delete(req.params.id);

      res.json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      console.error('Delete product error:', error);
      
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: error.message,
      });
    }
  }

  // Get low stock products
  static async getLowStock(req, res) {
    try {
      const products = await ProductModel.getLowStock();

      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error('Get low stock error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch low stock products',
        error: error.message,
      });
    }
  }

  // Get categories
  static async getCategories(req, res) {
    try {
      const categories = await ProductModel.getCategories();

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        error: error.message,
      });
    }
  }
}

module.exports = ProductController;
