// ============================================
// TRANSACTION FORM - PURCHASE/SALE ENTRY
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionsAPI, productsAPI } from '../services/api';
import { Save, X, Search, Package } from 'lucide-react';
import { toast } from 'react-toastify';

const TransactionForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    product_id: '',
    transaction_type: 'purchase',
    quantity: '',
    unit_price: '',
    reference_number: '',
    notes: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll({ limit: 100, status: 'active' });
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setFormData(prev => ({
      ...prev,
      product_id: product.id,
      unit_price: product.unit_price,
    }));
    setSearchTerm('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    const quantity = parseFloat(formData.quantity) || 0;
    const price = parseFloat(formData.unit_price) || 0;
    return (quantity * price).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.product_id) {
      toast.error('Please select a product');
      return;
    }

    try {
      setLoading(true);
      const response = await transactionsAPI.create(formData);

      if (response.success) {
        toast.success('Transaction recorded successfully');
        navigate('/transactions');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to record transaction');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Transaction</h1>
        <p className="text-gray-600 mt-1">Record a purchase or sale transaction</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg">
        <div className="p-6 space-y-6">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['purchase', 'sale', 'return', 'adjustment'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, transaction_type: type }))}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition ${
                    formData.transaction_type === type
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product <span className="text-red-500">*</span>
            </label>
            
            {selectedProduct ? (
              <div className="border-2 border-blue-600 bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">{selectedProduct.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">SKU: {selectedProduct.sku}</p>
                    <p className="text-sm text-gray-600">Current Stock: {selectedProduct.current_stock}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(null);
                      setFormData(prev => ({ ...prev, product_id: '', unit_price: '' }));
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products by name or SKU..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {searchTerm && (
                  <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map(product => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleProductSelect(product)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-200 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-600">
                            {product.sku} | Stock: {product.current_stock} | ${product.unit_price}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        No products found
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Transaction Details */}
          {selectedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="unit_price"
                  value={formData.unit_price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference Number
                </label>
                <input
                  type="text"
                  name="reference_number"
                  value={formData.reference_number}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., PO-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount
                </label>
                <input
                  type="text"
                  value={`$${calculateTotal()}`}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold text-gray-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional notes about this transaction"
                />
              </div>
            </div>
          )}

          {/* Stock Preview */}
          {selectedProduct && formData.quantity && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Stock Preview</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Current Stock:</span>
                  <p className="font-semibold text-gray-900">{selectedProduct.current_stock}</p>
                </div>
                <div>
                  <span className="text-gray-600">
                    {formData.transaction_type === 'purchase' || formData.transaction_type === 'return' ? 'After Addition:' : 'After Deduction:'}
                  </span>
                  <p className="font-semibold text-gray-900">
                    {formData.transaction_type === 'purchase' || formData.transaction_type === 'return'
                      ? selectedProduct.current_stock + parseInt(formData.quantity || 0)
                      : selectedProduct.current_stock - parseInt(formData.quantity || 0)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Reorder Point:</span>
                  <p className="font-semibold text-gray-900">{selectedProduct.reorder_point}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/transactions')}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            <X className="h-5 w-5 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !selectedProduct}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Save className="h-5 w-5 mr-2" />
            {loading ? 'Recording...' : 'Record Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
