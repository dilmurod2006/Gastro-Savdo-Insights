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
      width: '7%',
      align: 'center' as const,
      render: (value: unknown) => (
        <span className="font-bold text-gray-500 dark:text-gray-400">#{String(value)}</span>
      )
    },
    {
      key: 'product_name',
      header: 'Product Name',
      width: '22%',
      render: (value: unknown) => (
        <span className="font-semibold text-gray-900 dark:text-white">{String(value)}</span>
      )
    },
    {
      key: 'category_name',
      header: 'Category',
      width: '15%',
      render: (value: unknown) => (
        <span className="text-gray-600 dark:text-gray-300">{String(value) || '—'}</span>
      )
    },
    {
      key: 'total_revenue',
      header: 'Revenue',
      width: '16%',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="font-bold text-emerald-500">
          ${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )
    },
    {
      key: 'quantity_sold',
      header: 'Sold',
      width: '12%',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          {Number(value).toLocaleString()}
        </span>
      )
    },
    {
      key: 'order_count',
      header: 'Orders',
      width: '10%',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="text-gray-700 dark:text-gray-300 font-medium">
          {Number(value).toLocaleString()}
        </span>
      )
    },
    {
      key: 'revenue_percentage',
      header: '% Share',
      width: '18%',
      align: 'right' as const,
      render: (value: unknown) => {
        const percent = Number(value);
        return (
          <div className="flex items-center justify-end gap-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300 min-w-[45px] text-right">
              {percent.toFixed(1)}%
            </span>
            <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(percent * 4, 100)}%` }}
              />
            </div>
          </div>
        );
      }
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
