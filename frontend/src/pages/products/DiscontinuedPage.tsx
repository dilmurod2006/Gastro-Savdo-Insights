import { useDiscontinuedAnalysis } from '@/hooks';
import { Card } from '@/components/ui/Card';
import { DiscontinuedProduct } from '@/types/analytics.types';

import { ArrowLeft, Ban, Package, DollarSign, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DiscontinuedPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useDiscontinuedAnalysis();

  // Filter data to get metrics
  const activeData = data?.find((p: DiscontinuedProduct) => p.product_status === 'Active');
  const discontinuedData = data?.find((p: DiscontinuedProduct) => p.product_status === 'Discontinued');
  const grandTotal = data?.find((p: DiscontinuedProduct) => p.product_status === 'GRAND TOTAL');

  // For table display, exclude GRAND TOTAL
  const tableData = data?.filter((p: DiscontinuedProduct) => p.product_status !== 'GRAND TOTAL') || [];

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

  // Status badge
  const getStatusBadge = (status: string) => {
    if (status === 'Active') {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          Faol
        </span>
      );
    }
    if (status === 'Discontinued') {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/30">
          To'xtatilgan
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-500/15 text-gray-400 border border-gray-500/30">
        {status}
      </span>
    );
  };

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
              To'xtatilgan mahsulotlar tahlili
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              Faol va to'xtatilgan inventar samaradorligini solishtirish
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Products */}
        <Card className="p-5 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Faol mahsulotlar
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {activeData?.product_count || 0}
              </p>
              <p className="text-xs text-emerald-500 mt-1">
                ${formatNumber(activeData?.total_revenue || 0)} daromad
              </p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
              <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </Card>

        {/* Discontinued Products */}
        <Card className="p-5 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                To'xtatilgan
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {discontinuedData?.product_count || 0}
              </p>
              <p className="text-xs text-red-500 mt-1">
                ${formatNumber(discontinuedData?.total_revenue || 0)} yo'qotilgan daromad
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
              <Ban className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>

        {/* Total Revenue */}
        <Card className="p-5 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Umumiy daromad
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                ${((grandTotal?.total_revenue || 0) / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatNumber(grandTotal?.total_orders || 0)} ta buyurtma
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        {/* Avg Revenue Per Product */}
        <Card className="p-5 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                O'rtacha daromad/Mahsulot
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                ${((grandTotal?.avg_revenue_per_product || 0) / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {((grandTotal?.avg_discount_given || 0) * 100).toFixed(1)}% o'rtacha chegirma
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
        <Card className="p-6 border border-gray-200 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Daromad taqsimoti
          </h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Faol mahsulotlar</span>
                <span className="font-medium text-emerald-500">
                  ${formatNumber(activeData?.total_revenue || 0)}
                </span>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${grandTotal?.total_revenue ? ((activeData?.total_revenue || 0) / grandTotal.total_revenue) * 100 : 0}%` 
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {grandTotal?.total_revenue ? (((activeData?.total_revenue || 0) / grandTotal.total_revenue) * 100).toFixed(1) : 0}% umumiy daromaddan
              </p>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">To'xtatilgan mahsulotlar</span>
                <span className="font-medium text-red-500">
                  ${formatNumber(discontinuedData?.total_revenue || 0)}
                </span>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${grandTotal?.total_revenue ? ((discontinuedData?.total_revenue || 0) / grandTotal.total_revenue) * 100 : 0}%` 
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {grandTotal?.total_revenue ? (((discontinuedData?.total_revenue || 0) / grandTotal.total_revenue) * 100).toFixed(1) : 0}% umumiy daromaddan
              </p>
            </div>
          </div>
        </Card>

        {/* Product Count Comparison */}
        <Card className="p-6 border border-gray-200 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Mahsulot taqsimoti
          </h3>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-2 border-4 border-emerald-500/30">
                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {activeData?.product_count || 0}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Faol</p>
              <p className="text-xs text-emerald-500">
                {grandTotal?.product_count ? (((activeData?.product_count || 0) / grandTotal.product_count) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="text-4xl font-light text-gray-300 dark:text-gray-600">vs</div>
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-2 border-4 border-red-500/30">
                <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {discontinuedData?.product_count || 0}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">To'xtatilgan</p>
              <p className="text-xs text-red-500">
                {grandTotal?.product_count ? (((discontinuedData?.product_count || 0) / grandTotal.product_count) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="overflow-hidden border border-gray-200 dark:border-gray-700/50 shadow-sm p-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Batafsil ma'lumotlar
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Status bo'yicha mahsulot ko'rsatkichlari
          </p>
        </div>

        {error ? (
          <div className="p-12 text-center">
            <div className="text-red-500 font-medium">Ma'lumotlarni yuklashda xatolik</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: '900px' }}>
              <colgroup>
                <col style={{ width: '120px' }} />
                <col style={{ width: '100px' }} />
                <col style={{ width: '130px' }} />
                <col style={{ width: '130px' }} />
                <col style={{ width: '150px' }} />
                <col style={{ width: '140px' }} />
                <col style={{ width: '100px' }} />
              </colgroup>
              
              {/* Table Header */}
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700/50">
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Mahsulotlar
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Buyurtmalar
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sotilgan
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Umumiy daromad
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    O'rtacha/Mahsulot
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Chegirma
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                {loading ? (
                  // Loading Skeleton
                  Array.from({ length: 2 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-5">
                        <div className="w-24 h-7 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex justify-end">
                          <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex justify-end">
                          <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex justify-end">
                          <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex justify-end">
                          <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex justify-end">
                          <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex justify-end">
                          <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : tableData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-gray-500 dark:text-gray-400">
                      Ma'lumotlar topilmadi
                    </td>
                  </tr>
                ) : (
                  tableData.map((item, index) => (
                    <tr 
                      key={index} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-150"
                    >
                      {/* Status */}
                      <td className="px-4 py-4">
                        {getStatusBadge(item.product_status)}
                      </td>

                      {/* Products */}
                      <td className="px-4 py-4 text-right">
                        <span className="font-semibold text-gray-900 dark:text-white text-[15px] font-mono">
                          {formatNumber(item.product_count)}
                        </span>
                      </td>

                      {/* Total Orders */}
                      <td className="px-4 py-4 text-right">
                        <span className="font-medium text-gray-700 dark:text-gray-300 text-[15px] font-mono">
                          {formatNumber(item.total_orders)}
                        </span>
                      </td>

                      {/* Units Sold */}
                      <td className="px-4 py-4 text-right">
                        <span className="font-medium text-gray-700 dark:text-gray-300 text-[15px] font-mono">
                          {formatNumber(item.total_units_sold)}
                        </span>
                      </td>

                      {/* Total Revenue */}
                      <td className="px-4 py-4 text-right">
                        <span className="font-bold text-emerald-400 text-[15px] font-mono">
                          {formatCurrency(item.total_revenue)}
                        </span>
                      </td>

                      {/* Avg/Product */}
                      <td className="px-4 py-4 text-right">
                        <span className="font-medium text-gray-500 dark:text-gray-400 text-[15px] font-mono">
                          {formatCurrency(item.avg_revenue_per_product)}
                        </span>
                      </td>

                      {/* Avg Discount */}
                      <td className="px-4 py-4 text-right">
                        <span className="font-medium text-orange-500 text-[15px] font-mono">
                          {(item.avg_discount_given * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {/* Table Footer - Grand Total */}
              {!loading && grandTotal && (
                <tfoot>
                  <tr className="bg-gray-100 dark:bg-gray-800/80 border-t-2 border-gray-300 dark:border-gray-600">
                    <td className="px-4 py-4">
                      <span className="font-bold text-gray-900 dark:text-white text-sm uppercase">
                        Jami
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-bold text-gray-900 dark:text-white font-mono">
                        {formatNumber(grandTotal.product_count)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-bold text-gray-900 dark:text-white font-mono">
                        {formatNumber(grandTotal.total_orders)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-bold text-gray-900 dark:text-white font-mono">
                        {formatNumber(grandTotal.total_units_sold)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-bold text-emerald-500 font-mono">
                        {formatCurrency(grandTotal.total_revenue)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-bold text-gray-700 dark:text-gray-300 font-mono">
                        {formatCurrency(grandTotal.avg_revenue_per_product)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-bold text-orange-500 font-mono">
                        {(grandTotal.avg_discount_given * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        {/* Footer */}
        {!loading && !error && tableData.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{tableData.length} ta status ko'rsatilmoqda</span>
              <span className="font-mono text-xs">GET /api/v1/analytics/products/discontinued</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}