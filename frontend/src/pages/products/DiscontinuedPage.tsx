import { useDiscontinuedAnalysis } from '@/hooks';
import { Table } from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';
import { DiscontinuedProduct } from '@/types/analytics.types';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Ban, Package, DollarSign, ShoppingCart, Percent, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DiscontinuedPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useDiscontinuedAnalysis();

  const columns = [
    {
      key: 'product_status',
      header: 'Status',
      width: '15%',
      render: (value: unknown) => {
        const status = String(value);
        const variant = status === 'Discontinued' ? 'danger' : status === 'Active' ? 'success' : 'default';
        return (
          <Badge variant={variant}>
            {status}
          </Badge>
        );
      }
    },
    {
      key: 'product_count',
      header: 'Products',
      width: '12%',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {Number(value).toLocaleString()}
        </span>
      )
    },
    {
      key: 'total_orders',
      header: 'Total Orders',
      width: '15%',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="text-gray-700 dark:text-gray-300">
          {Number(value).toLocaleString()}
        </span>
      )
    },
    {
      key: 'total_units_sold',
      header: 'Units Sold',
      width: '15%',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="text-gray-700 dark:text-gray-300">
          {Number(value).toLocaleString()}
        </span>
      )
    },
    {
      key: 'total_revenue',
      header: 'Total Revenue',
      width: '18%',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="font-bold text-emerald-500">
          ${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )
    },
    {
      key: 'avg_revenue_per_product',
      header: 'Avg/Product',
      width: '15%',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="text-gray-600 dark:text-gray-400">
          ${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )
    },
    {
      key: 'avg_discount_given',
      header: 'Avg Discount',
      width: '10%',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="text-orange-500 font-medium">
          {(Number(value) * 100).toFixed(1)}%
        </span>
      )
    }
  ];

  // Filter data to get metrics (exclude GRAND TOTAL for cards)
  const activeData = data?.find((p: DiscontinuedProduct) => p.product_status === 'Active');
  const discontinuedData = data?.find((p: DiscontinuedProduct) => p.product_status === 'Discontinued');
  const grandTotal = data?.find((p: DiscontinuedProduct) => p.product_status === 'GRAND TOTAL');

  // For table display, exclude GRAND TOTAL or show it separately
  const tableData = data?.filter((p: DiscontinuedProduct) => p.product_status !== 'GRAND TOTAL') || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discontinued Products Analysis</h1>
            <p className="text-gray-500 dark:text-gray-400">Comparison of active vs discontinued inventory performance</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Products */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Products</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {activeData?.product_count || 0}
              </p>
              <p className="text-xs text-emerald-500 mt-1">
                ${(activeData?.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} revenue
              </p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
              <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </Card>

        {/* Discontinued Products */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Discontinued</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {discontinuedData?.product_count || 0}
              </p>
              <p className="text-xs text-red-500 mt-1">
                ${(discontinuedData?.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} lost revenue
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
              <Ban className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>

        {/* Total Revenue */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                ${((grandTotal?.total_revenue || 0) / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {grandTotal?.total_orders || 0} orders total
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        {/* Avg Revenue Per Product */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Revenue/Product</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                ${((grandTotal?.avg_revenue_per_product || 0) / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {((grandTotal?.avg_discount_given || 0) * 100).toFixed(1)}% avg discount
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Comparison Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Comparison */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Active Products</span>
                <span className="font-medium text-emerald-500">
                  ${(activeData?.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${grandTotal?.total_revenue ? ((activeData?.total_revenue || 0) / grandTotal.total_revenue) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Discontinued Products</span>
                <span className="font-medium text-red-500">
                  ${(discontinuedData?.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${grandTotal?.total_revenue ? ((discontinuedData?.total_revenue || 0) / grandTotal.total_revenue) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Product Count Comparison */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product Distribution</h3>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-2">
                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {activeData?.product_count || 0}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-xs text-emerald-500">
                {grandTotal?.product_count ? (((activeData?.product_count || 0) / grandTotal.product_count) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="text-4xl text-gray-300 dark:text-gray-600">vs</div>
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-2">
                <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {discontinuedData?.product_count || 0}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Discontinued</p>
              <p className="text-xs text-red-500">
                {grandTotal?.product_count ? (((discontinuedData?.product_count || 0) / grandTotal.product_count) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed Breakdown</h3>
        </div>
        {error ? (
          <div className="p-8 text-center text-red-500">
            Error loading data: {error}
          </div>
        ) : (
          <Table<DiscontinuedProduct>
            columns={columns}
            data={tableData}
            loading={loading}
            emptyMessage="No records found"
          />
        )}
      </Card>
    </div>
  );
}
