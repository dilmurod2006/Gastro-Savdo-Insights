import { useState } from 'react';
import { useTopRevenueProducts } from '@/hooks';
import { Table } from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';
import { TopRevenueProduct } from '@/types/analytics.types';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TopRevenuePage() {
  const navigate = useNavigate();
  const [limit, setLimit] = useState(10);
  const { data, loading, error } = useTopRevenueProducts(limit);

  const columns = [
    {
      key: 'rank',
      header: 'Rank',
      width: '80px',
      align: 'center' as const,
      render: (value: unknown) => <span className="font-bold text-gray-500">#{String(value)}</span>
    },
    {
      key: 'product_name',
      header: 'Product Name',
      render: (value: unknown) => <span className="font-medium text-gray-900 dark:text-white">{String(value)}</span>
    },
    {
      key: 'category_name',
      header: 'Category',
    },
    {
      key: 'total_revenue',
      header: 'Revenue',
      align: 'right' as const,
      render: (value: unknown) => <span className="font-semibold text-green-600 dark:text-green-400">${Number(value).toLocaleString()}</span>
    },
    {
      key: 'quantity_sold',
      header: 'Sold',
      align: 'right' as const,
      render: (value: unknown) => Number(value).toLocaleString()
    },
    {
      key: 'order_count',
      header: 'Orders',
      align: 'right' as const,
    },
    {
      key: 'revenue_percentage',
      header: '% Share',
      align: 'right' as const,
      render: (value: unknown) => 
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {Number(value).toFixed(1)}%
          </span>
          <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-500 rounded-full" 
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
    }
  ];

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Top Revenue Products</h1>
            <p className="text-gray-500 dark:text-gray-400">Best selling products by total revenue</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Show:</label>
           <select 
            value={limit} 
            onChange={(e) => setLimit(Number(e.target.value))}
            className="bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2"
          >
            <option value="10">Top 10</option>
            <option value="20">Top 20</option>
            <option value="50">Top 50</option>
            <option value="100">Top 100</option>
          </select>
        </div>
      </div>

      <Card className="overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-500">
            Error loading data: {error}
          </div>
        ) : (
          <Table<TopRevenueProduct>
            columns={columns}
            data={data || []}
            loading={loading}
            emptyMessage="No products found"
          />
        )}
      </Card>
      
    </div>
  );
}
