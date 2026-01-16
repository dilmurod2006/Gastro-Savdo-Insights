import { useABCAnalysis } from '@/hooks';
import { Table } from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';
import { ABCAnalysisProduct } from '@/types/analytics.types';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// import { Tooltip } from '@/components/ui/Tooltip';

export function ABCAnalysisPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useABCAnalysis();

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
      key: 'total_revenue',
      header: 'Revenue',
      align: 'right' as const,
      render: (value: unknown) => 
        <span className="font-medium">${Number(value).toLocaleString()}</span>
    },
    {
      key: 'revenue_percentage',
      header: '% Share',
      align: 'right' as const,
      render: (value: unknown) => `${Number(value).toFixed(2)}%`
    },
    {
      key: 'cumulative_percentage',
      header: 'Cumulative %',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="text-gray-500">
          {Number(value).toFixed(2)}%
        </span>
      )
    },
    {
      key: 'abc_category',
      header: 'Class',
      align: 'center' as const,
      render: (value: unknown) => {
        const category = value as 'A' | 'B' | 'C';
        const variants = {
          'A': 'success', 
          'B': 'warning',
          'C': 'secondary'
        } as const;
        
        return (
          <Badge variant={(variants[category] || 'default') as 'success' | 'warning' | 'danger' | 'info' | 'default'} className="w-8 justify-center">
            {category}
          </Badge>
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ABC Analysis</h1>
            <p className="text-gray-500 dark:text-gray-400">Inventory classification based on revenue impact</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">Class A</h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">Top ~70% of Revenue</p>
            </div>
            <Badge variant="success">Vital Few</Badge>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-4">
            High priority items. Require strict inventory control and accurate forecasting.
          </p>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-900/20">
           <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Class B</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">Next ~20% of Revenue</p>
            </div>
            <Badge variant="warning">Moderate</Badge>
          </div>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-4">
            Medium priority. Moderate inventory levels and controls needed.
          </p>
        </Card>

        <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800">
           <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Class C</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">Bottom ~10% of Revenue</p>
            </div>
            <Badge variant="default">Trivial Many</Badge>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-4">
            Low value/priority. Bulk ordering and simpler controls recommended.
          </p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-500">
            Error loading data: {error}
          </div>
        ) : (
          <Table<ABCAnalysisProduct>
            columns={columns}
            data={data || []}
            loading={loading}
            emptyMessage="No analysis data found"
          />
        )}
      </Card>
    </div>
  );
}
