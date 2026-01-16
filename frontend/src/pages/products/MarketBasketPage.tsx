import { useState } from 'react';
import { useMarketBasket } from '@/hooks';
import { Table } from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';
import { MarketBasketItem } from '@/types/analytics.types';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MarketBasketPage() {
  const navigate = useNavigate();
  const [minOccurrences, setMinOccurrences] = useState(5);
  const [limit] = useState(20);
  const { data, loading, error } = useMarketBasket(minOccurrences, limit);

  const columns = [
    {
      key: 'products',
      header: 'Product Pair',
      width: '50%',
      render: (_: unknown, row: MarketBasketItem) => (
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-900 dark:text-white px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
            {row.product_1}
          </span>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
            {row.product_2}
          </span>
        </div>
      )
    },
    {
      key: 'occurrence_count',
      header: 'Times Bought Together',
      align: 'center' as const,
      render: (value: unknown) => (
        <span className="font-semibold text-blue-600 dark:text-blue-400">
          {Number(value).toLocaleString()}
        </span>
      )
    },
    {
      key: 'support_percentage',
      header: 'Support %',
      align: 'right' as const,
      render: (value: unknown) => (
        <div className="flex items-center justify-end gap-2">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {(Number(value) * 100).toFixed(2)}%
          </span>
          <div className="w-20 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            {/* Normalize visually: multiply by 10 for visibility if needed, or assume value is small */}
            <div 
              className="h-full bg-blue-500 rounded-full" 
              style={{ width: `${Math.min(Number(value) * 100 * 5, 100)}%` }}
            />
          </div>
        </div>
      )
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Market Basket Analysis</h1>
            <p className="text-gray-500 dark:text-gray-400">Identify products frequently bought together</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
           <div className="flex items-center gap-2">
             <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Min Occurrences:</label>
             <select 
              value={minOccurrences} 
              onChange={(e) => setMinOccurrences(Number(e.target.value))}
              className="bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 p-2"
            >
              <option value="5">5+</option>
              <option value="10">10+</option>
              <option value="20">20+</option>
              <option value="50">50+</option>
            </select>
           </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-red-500">
            Error loading analysis: {error}
          </div>
        ) : (
          <Table<MarketBasketItem>
            columns={columns}
            data={data || []}
            loading={loading}
            emptyMessage="No product associations found for these criteria"
          />
        )}
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20 p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Recommendation Strategy</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Use these pairs for cross-selling. If a customer adds <strong>Product A</strong> to cart, suggest <strong>Product B</strong> as a "Frequently Bought Together" item.
            </p>
         </Card>
         <Card className="bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/20 p-4">
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Bundle Opportunities</h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Create special bundle offers for high-support pairs to increase Average Order Value (AOV).
            </p>
         </Card>
      </div>
    </div>
  );
}
