import { Globe, DollarSign, Users, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui';
import { BarChart, PieChart } from '@/components/charts';

import { useTopByCountry } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/helpers';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { CHART_COLORS } from '@/utils/constants';

export function TopByCountryPage() {
  const navigate = useNavigate();
  // const { theme } = useTheme(); // Unused
  const { data, loading, error, refetch } = useTopByCountry();

  // Professional PieChart: TOP 6 + "Boshqalar" guruhi
  const pieChartData = (() => {
    if (!data || data.length === 0) return [];
    
    const sorted = [...data].sort((a, b) => b.total_revenue - a.total_revenue);
    
    if (sorted.length <= 7) {
      return sorted.map((item, index) => ({
        name: item.country,
        value: item.total_revenue,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }));
    }
    
    const top6 = sorted.slice(0, 6);
    const others = sorted.slice(6);
    const othersTotal = others.reduce((sum, item) => sum + item.total_revenue, 0);
    
    return [
      ...top6.map((item, index) => ({
        name: item.country,
        value: item.total_revenue,
        color: CHART_COLORS[index % CHART_COLORS.length],
      })),
      {
        name: `Boshqalar (${others.length})`,
        value: othersTotal,
        color: '#6B7280',
      }
    ];
  })();

  const barData = data?.slice(0, 10).map((item) => ({
    name: item.country,
    revenue: item.total_revenue,
    customers: item.customer_count,
  })) || [];

  // Top stats
  const totalRevenue = data?.reduce((sum, c) => sum + c.total_revenue, 0) || 0;
  const totalOrders = data?.reduce((sum, c) => sum + c.total_orders, 0) || 0;

  // Add revenue share percentage to data
  const enrichedData = data?.map((item, index) => ({
    ...item,
    revenue_share: totalRevenue > 0 ? (item.total_revenue / totalRevenue) * 100 : 0,
    rank: index + 1,
  })) || [];

  // Get share color class
  const getShareColorClass = (percent: number) => {
    if (percent >= 15) return 'text-emerald-400 font-semibold';
    if (percent >= 10) return 'text-blue-400 font-medium';
    if (percent >= 5) return 'text-yellow-400';
    return 'text-gray-400';
  };

  if (error) {
    return (
      <div className="p-12 text-center">
        <div className="text-red-500 font-medium mb-4">Ma'lumotlarni yuklashda xatolik</div>
        <button 
          onClick={refetch}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Qayta urinish
        </button>
      </div>
    );
  }

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
              Mamlakat bo'yicha eng yaxshi mijozlar
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              Har bir davlat bo'yicha eng ko'p xarid qilgan mijozlar tahlili
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Mamlakatlar
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {data?.length || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Jami daromad
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                TOP mijozlar
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {data?.length || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30">
              <ShoppingCart className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Jami buyurtmalar
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {formatNumber(totalOrders)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border border-gray-200 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Daromad taqsimoti
          </h3>
          {loading ? (
            <div className="h-[300px] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ) : (
            <PieChart data={pieChartData} donut height={300} showLabels />
          )}
        </Card>

        <Card className="p-6 border border-gray-200 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            TOP 10 mamlakatlar
          </h3>
          {loading ? (
            <div className="h-[300px] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ) : (
            <BarChart
              data={barData}
              xKey="name"
              yKey="revenue"
              horizontal
              colorByValue
              height={300}
            />
          )}
        </Card>
      </div>

      {/* Table */}
      <Card className="overflow-hidden border border-gray-200 dark:border-gray-700/50 shadow-sm p-0">
        {/* Table Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Barcha mamlakatlar
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Har bir mamlakat uchun eng yaxshi mijoz va daromad ulushi
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Jami mamlakatlar</p>
            <p className="text-xl font-bold text-primary-500">{enrichedData.length}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: '1000px' }}>
            <colgroup>
              <col style={{ width: '60px' }} />
              <col style={{ width: '160px' }} />
              <col style={{ width: '200px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '150px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '170px' }} />
            </colgroup>
            
            {/* Table Header */}
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700/50">
                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mamlakat
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Eng yaxshi mijoz
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Buyurtmalar
                </th>
                <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Jami daromad
                </th>
                <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  O'rtacha buyurtma
                </th>
                <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ulushi
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
              {loading ? (
                // Loading Skeleton
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <div className="w-6 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end">
                        <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end">
                        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : enrichedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-500 dark:text-gray-400">
                    Ma'lumotlar topilmadi
                  </td>
                </tr>
              ) : (
                enrichedData.map((item) => {
                  const percent = item.revenue_share;
                  
                  return (
                    <tr 
                      key={item.rank} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-150"
                    >
                      {/* Rank */}
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <span className="text-sm font-bold text-gray-400">
                            {item.rank}
                          </span>
                        </div>
                      </td>

                      {/* Country */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-primary-500 flex-shrink-0" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {item.country}
                          </span>
                        </div>
                      </td>

                      {/* Top Customer */}
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {item.top_customer}
                        </span>
                      </td>

                      {/* Orders */}
                      <td className="px-4 py-4 text-center">
                        <span className="font-medium text-gray-700 dark:text-gray-300 font-mono">
                          {formatNumber(item.total_orders)}
                        </span>
                      </td>

                      {/* Total Revenue */}
                      <td className="px-4 py-4 text-right">
                        <span className="font-bold text-emerald-500 font-mono">
                          {formatCurrency(item.total_revenue)}
                        </span>
                      </td>

                      {/* Avg Order Value */}
                      <td className="px-4 py-4 text-right">
                        <span className="text-gray-500 dark:text-gray-400 font-mono">
                          {formatCurrency(item.avg_order_value)}
                        </span>
                      </td>

                      {/* Share */}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(percent, 100)}%` }}
                            />
                          </div>
                          <span className={cn('font-mono text-sm w-[52px] text-right', getShareColorClass(percent))}>
                            {percent.toFixed(1)}%
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

        {/* Footer */}
        {!loading && enrichedData.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{enrichedData.length} ta mamlakat ko'rsatilmoqda</span>
              <span className="font-mono text-xs">GET /api/v1/analytics/customers/top-by-country</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}