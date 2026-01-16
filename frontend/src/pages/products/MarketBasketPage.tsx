import { useState } from 'react';
import { useMarketBasket } from '@/hooks';
import { Table } from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';
import { MarketBasketItem } from '@/types/analytics.types';
import { ArrowLeft, Link2, ShoppingCart, TrendingUp, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MarketBasketPage() {
  const navigate = useNavigate();
  const [minOccurrences, setMinOccurrences] = useState(5);
  const [limit] = useState(20);
  const { data, loading, error } = useMarketBasket(minOccurrences, limit);

  const columns = [
    {
      key: 'rank',
      header: '#',
      width: '5%',
      align: 'center' as const,
      render: (_: unknown, __: MarketBasketItem, index: number) => (
        <span className="font-bold text-gray-500 dark:text-gray-400">{index + 1}</span>
      )
    },
    {
      key: 'products',
      header: 'Product Pair',
      width: '55%',
      render: (_: unknown, row: MarketBasketItem) => (
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-900 dark:text-white px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
            {row.product_1}
          </span>
          <Link2 className="w-4 h-4 text-primary-500 flex-shrink-0" />
          <span className="font-medium text-gray-900 dark:text-white px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm">
            {row.product_2}
          </span>
        </div>
      )
    },
    {
      key: 'times_bought_together',
      header: 'Times Together',
      width: '18%',
      align: 'center' as const,
      render: (value: unknown) => (
        <div className="flex items-center justify-center gap-2">
          <ShoppingCart className="w-4 h-4 text-blue-500" />
          <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
            {Number(value).toLocaleString()}
          </span>
        </div>
      )
    },
    {
      key: 'support_percent',
      header: 'Support %',
      width: '22%',
      align: 'right' as const,
      render: (value: unknown) => {
        const percent = Number(value);
        return (
          <div className="flex items-center justify-end gap-3">
            <span className="font-semibold text-gray-700 dark:text-gray-300 min-w-[50px] text-right">
              {percent.toFixed(2)}%
            </span>
            <div className="w-24 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-primary-500 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(percent * 50, 100)}%` }}
              />
            </div>
          </div>
        );
      }
    }
  ];

  // Calculate summary stats
  const totalPairs = data?.length || 0;
  const avgOccurrences = data?.length 
    ? Math.round(data.reduce((sum, item) => sum + item.times_bought_together, 0) / data.length) 
    : 0;
  const maxOccurrences = data?.length 
    ? Math.max(...data.map(item => item.times_bought_together)) 
    : 0;
  const avgSupport = data?.length 
    ? (data.reduce((sum, item) => sum + item.support_percent, 0) / data.length).toFixed(2) 
    : '0';

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
              <option value="3">3+</option>
              <option value="5">5+</option>
              <option value="10">10+</option>
              <option value="20">20+</option>
            </select>
           </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Product Pairs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalPairs}</p>
              <p className="text-xs text-gray-500 mt-1">associations found</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <Link2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Max Together</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{maxOccurrences}</p>
              <p className="text-xs text-emerald-500 mt-1">strongest pair</p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Together</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{avgOccurrences}</p>
              <p className="text-xs text-gray-500 mt-1">times per pair</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Support</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{avgSupport}%</p>
              <p className="text-xs text-gray-500 mt-1">of all orders</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
              <Package className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Associations</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Products frequently purchased in the same order</p>
        </div>
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
      
      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-200 dark:border-blue-900/30 p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Cross-Selling Strategy</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Use these pairs for "Frequently Bought Together" recommendations. When a customer adds one product, suggest its pair to increase cart value.
                </p>
              </div>
            </div>
         </Card>
         <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10 border-purple-200 dark:border-purple-900/30 p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Bundle Opportunities</h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Create discount bundles for high-support pairs. Offer 5-10% off when purchased together to boost Average Order Value (AOV).
                </p>
              </div>
            </div>
         </Card>
      </div>
    </div>
  );
}
