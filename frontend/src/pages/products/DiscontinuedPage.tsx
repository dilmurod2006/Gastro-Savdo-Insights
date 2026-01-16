import { useDiscontinuedAnalysis } from '@/hooks';
import { Table } from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';
import { DiscontinuedProduct } from '@/types/analytics.types';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DiscontinuedPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useDiscontinuedAnalysis();

  const columns = [
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
      key: 'discontinued',
      header: 'Status',
      align: 'center' as const,
      render: (value: unknown) => (
        <Badge variant={value ? 'danger' : 'success'}>
          {value ? 'Discontinued' : 'Active'}
        </Badge>
      )
    },
    {
      key: 'total_orders',
      header: 'Lifetime Orders',
      align: 'right' as const,
      render: (value: unknown) => Number(value).toLocaleString()
    },
    {
      key: 'total_revenue',
      header: 'Lifetime Revenue',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="font-medium text-gray-700 dark:text-gray-300">
          ${Number(value).toLocaleString()}
        </span>
      )
    }
  ];

  // Helper metrics
  const discontinuedCount = data?.filter((p: DiscontinuedProduct) => p.discontinued).length || 0;
  const discontinuedRevenue = data
    ?.filter((p: DiscontinuedProduct) => p.discontinued)
    .reduce((sum: number, p: DiscontinuedProduct) => sum + p.total_revenue, 0) || 0;

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discontinued Products</h1>
            <p className="text-gray-500 dark:text-gray-400">Analysis of discontinued vs active inventory</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Discontinued Items</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{discontinuedCount}</p>
          </div>
          <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
            <Ban className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
        </Card>
        
        <Card className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Lost Revenue</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              ${discontinuedRevenue.toLocaleString()}
            </p>
          </div>
           <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
            <Ban className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-500">
            Error loading data: {error}
          </div>
        ) : (
          <Table<DiscontinuedProduct>
            columns={columns}
            data={data || []}
            loading={loading}
            emptyMessage="No records found"
          />
        )}
      </Card>
    </div>
  );
}
