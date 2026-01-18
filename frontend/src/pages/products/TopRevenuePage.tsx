import { useState } from 'react';
import { useTopRevenueProducts } from '@/hooks';
import { Card } from '@/components/ui/Card';
import { TopRevenueProduct } from '@/types/analytics.types';
import { ArrowLeft, TrendingUp, Package, ShoppingCart, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TopRevenuePage() {
  const navigate = useNavigate();
  const [limit, setLimit] = useState(10);
  const { data, loading, error } = useTopRevenueProducts(limit);

  const limitOptions = [
    { value: 10, label: 'Top 10' },
    { value: 20, label: 'Top 20' },
    { value: 50, label: 'Top 50' },
    { value: 100, label: 'Top 100' },
  ];

  // Calculate totals
  const totalRevenue = data?.reduce((sum, p) => sum + Number(p.total_revenue), 0) || 0;
  const totalQuantity = data?.reduce((sum, p) => sum + Number(p.quantity_sold), 0) || 0;
  const totalOrders = data?.reduce((sum, p) => sum + Number(p.order_count), 0) || 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Rank badge component
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
          <span className="text-sm font-bold text-amber-900">{rank}</span>
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-lg shadow-gray-400/30">
          <span className="text-sm font-bold text-gray-700">{rank}</span>
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-600/30">
          <span className="text-sm font-bold text-amber-100">{rank}</span>
        </div>
      );
    }
    return (
      <div className="w-9 h-9 flex items-center justify-center">
        <span className="text-sm font-semibold text-gray-400">{rank}</span>
      </div>
    );
  };

  // Category colors
  const getCategoryStyle = (category: string) => {
    const styles: Record<string, string> = {
      'Beverages': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      'Meat/Poultry': 'bg-red-500/15 text-red-400 border-red-500/30',
      'Dairy Products': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      'Confections': 'bg-pink-500/15 text-pink-400 border-pink-500/30',
      'Seafood': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      'Grains/Cereals': 'bg-lime-500/15 text-lime-400 border-lime-500/30',
      'Produce': 'bg-green-500/15 text-green-400 border-green-500/30',
      'Condiments': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    };
    return styles[category] || 'bg-gray-500/15 text-gray-400 border-gray-500/30';
  };

  // Stats cards data
  const stats = [
    { 
      label: 'Umumiy daromad', 
      value: formatCurrency(totalRevenue), 
      icon: DollarSign,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    },
    { 
      label: 'Mahsulotlar soni', 
      value: data?.length || 0, 
      icon: Package,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    { 
      label: 'Sotilgan birliklar', 
      value: formatNumber(totalQuantity), 
      icon: TrendingUp,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    { 
      label: 'Buyurtmalar soni', 
      value: formatNumber(totalOrders), 
      icon: ShoppingCart,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Eng ko'p daromad keltirgan mahsulotlar
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              Umumiy daromad bo'yicha eng yaxshi sotiladigan mahsulotlar
            </p>
          </div>
        </div>
        
        {/* Limit Selector */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl">
          {limitOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setLimit(option.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                limit === option.value
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-5 border border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                  {stat.value}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="overflow-hidden border border-gray-200 dark:border-gray-700/50 shadow-sm p-0">
        {error ? (
          <div className="p-12 text-center">
            <div className="text-red-500 font-medium">Ma'lumotlarni yuklashda xatolik</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: '1070px' }}>
              <colgroup>
                <col style={{ width: '100px' }} />
                <col style={{ width: '280px' }} />
                <col style={{ width: '160px' }} />
                <col style={{ width: '150px' }} />
                <col style={{ width: '100px' }} />
                <col style={{ width: '100px' }} />
                <col style={{ width: '180px' }} />
              </colgroup>
              
              {/* Table Header */}
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700/50">
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    O'rin
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Mahsulot nomi
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Kategoriya
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Daromad
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sotilgan
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Buyurtmalar
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ulush
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                {loading ? (
                  // Loading Skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-5">
                        <div className="flex justify-center">
                          <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="w-40 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex justify-center">
                          <div className="w-24 h-7 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex justify-end">
                          <div className="w-28 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex justify-end">
                          <div className="w-14 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex justify-end">
                          <div className="w-10 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex justify-end items-center gap-3">
                          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
                          <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : data?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-gray-500 dark:text-gray-400">
                      Mahsulotlar topilmadi
                    </td>
                  </tr>
                ) : (
                  data?.map((product, index) => {
                    const rank = index + 1;
                    const sharePercent = Number(product.revenue_percentage);
                    
                    return (
                      <tr 
                        key={product.rank || index} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-150"
                      >
                        {/* Rank */}
                        <td className="px-4 py-4">
                          <div className="flex justify-center">
                            {getRankBadge(rank)}
                          </div>
                        </td>

                        {/* Product Name */}
                        <td className="px-4 py-4">
                          <span className="font-semibold text-gray-900 dark:text-white text-[15px]">
                            {product.product_name}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4">
                          <div className="flex justify-center">
                            <span className={`inline-flex px-3 py-1.5 text-xs font-medium rounded-lg border ${getCategoryStyle(product.category_name || '')}`}>
                              {product.category_name || '—'}
                            </span>
                          </div>
                        </td>

                        {/* Revenue */}
                        <td className="px-4 py-4 text-right">
                          <span className="font-bold text-emerald-400 text-[15px] font-mono">
                            {formatCurrency(Number(product.total_revenue))}
                          </span>
                        </td>

                        {/* Sold */}
                        <td className="px-4 py-4 text-right">
                          <span className="font-medium text-gray-300 text-[15px] font-mono">
                            {formatNumber(Number(product.quantity_sold))}
                          </span>
                        </td>

                        {/* Orders */}
                        <td className="px-4 py-4 text-right">
                          <span className="font-medium text-gray-400 text-[15px] font-mono">
                            {formatNumber(Number(product.order_count))}
                          </span>
                        </td>

                        {/* Share */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-3">
                            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(sharePercent * 4, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-300 font-mono w-[52px] text-right">
                              {sharePercent.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!loading && !error && data && data.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{data.length} ta mahsulot ko'rsatilmoqda</span>
              <span className="font-mono text-xs">GET /api/v1/analytics/products/top-revenue</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}