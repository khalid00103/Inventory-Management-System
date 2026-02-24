// ============================================
// DASHBOARD PAGE
// ============================================

import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getSummary();
      
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No dashboard data available</p>
      </div>
    );
  }

  const { summary, recentTransactions, lowStockProducts } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your inventory management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <StatCard
          title="Total Products"
          value={summary.totalProducts.total}
          subtitle={`${summary.totalProducts.active} active`}
          icon={Package}
          color="bg-blue-500"
        />

        {/* Low Stock Alerts */}
        <StatCard
          title="Low Stock Items"
          value={summary.lowStockCount}
          subtitle="Needs restocking"
          icon={AlertTriangle}
          color="bg-orange-500"
        />

        {/* Today's Sales */}
        <StatCard
          title="Today's Sales"
          value={summary.todayTransactions.sales.count}
          subtitle={`${summary.todayTransactions.sales.quantity} units`}
          icon={ShoppingCart}
          color="bg-green-500"
        />

        {/* Inventory Value */}
        <StatCard
          title="Inventory Value"
          value={`$${summary.stockValue.costValue.toLocaleString()}`}
          subtitle="Total cost value"
          icon={DollarSign}
          color="bg-purple-500"
        />
      </div>

      {/* Transaction Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Transactions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TransactionSummaryCard
            title="Purchases"
            count={summary.todayTransactions.purchases.count}
            amount={summary.todayTransactions.purchases.amount}
            icon={ArrowDownRight}
            color="text-blue-600"
          />
          <TransactionSummaryCard
            title="Sales"
            count={summary.todayTransactions.sales.count}
            amount={summary.todayTransactions.sales.amount}
            icon={ArrowUpRight}
            color="text-green-600"
          />
          <TransactionSummaryCard
            title="Total"
            count={summary.todayTransactions.total.count}
            amount={summary.todayTransactions.total.amount}
            icon={TrendingUp}
            color="text-purple-600"
          />
        </div>
      </div>

      {/* Recent Transactions & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.slice(0, 5).map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.transaction_type === 'sale'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {transaction.transaction_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.abs(transaction.quantity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${transaction.total_amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reorder
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.sku}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-orange-600">
                        {product.current_stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.reorder_point}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </div>
      <div className={`${color} p-3 rounded-lg`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

// Transaction Summary Card Component
const TransactionSummaryCard = ({ title, count, amount, icon: Icon, color }) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-600">{title}</span>
      <Icon className={`h-5 w-5 ${color}`} />
    </div>
    <p className="text-2xl font-bold text-gray-900">{count}</p>
    <p className="text-sm text-gray-500">${amount.toFixed(2)}</p>
  </div>
);

export default Dashboard;
