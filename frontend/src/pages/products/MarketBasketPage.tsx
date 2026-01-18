import { useState } from 'react';
import { useMarketBasket } from '@/hooks';
import { Card } from '@/components/ui/Card';
import { MarketBasketItem } from '@/types/analytics.types';
import { ArrowLeft, Link2, ShoppingCart, TrendingUp, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MarketBasketPage() {
  const navigate = useNavigate();
  const [minOccurrences, setMinOccurrences] = useState(5);
  const [limit] = useState(20);
  const { data, loading, error } = useMarketBasket(minOccurrences, limit);

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

  const minOccurrenceOptions = [
    { value: 3, label: '3+' },
    { value: 5, label: '5+' },
    { value: 10, label: '10+' },
    { value: 20, label: '20+' },
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
              Savat Tahlili
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              Tez-tez birga sotib olinadigan mahsulotlarni aniqlash
            </p>
          </div>
        </div>
        
        {/* Filter */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Min. takrorlanish:
          </span>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl">
            {minOccurrenceOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setMinOccurrences(option.value)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  minOccurrences === option.value
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Mahsulot juftliklari
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalPairs}</p>
              <p className="text-xs text-gray-500 mt-1">bog'lanish topildi</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <Link2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Maks. birga
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{maxOccurrences}</p>
              <p className="text-xs text-emerald-500 mt-1">eng kuchli juftlik</p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                O'rtacha birga
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{avgOccurrences}</p>
              <p className="text-xs text-gray-500 mt-1">har bir juftlik uchun</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                O'rtacha qo'llab-quvvatlash
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{avgSupport}%</p>
              <p className="text-xs text-gray-500 mt-1">barcha buyurtmalardan</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
              <Package className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="overflow-hidden border border-gray-200 dark:border-gray-700/50 shadow-sm p-0">
        {/* Table Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Mahsulot bog'lanishlari
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bitta buyurtmada tez-tez sotib olinadigan mahsulotlar
          </p>
        </div>

        {error ? (
          <div className="p-12 text-center">
            <div className="text-red-500 font-medium">Tahlilni yuklashda xatolik</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: '800px' }}>
              <colgroup>
                <col style={{ width: '60px' }} />
                <col style={{ width: 'auto' }} />
                <col style={{ width: '150px' }} />
                <col style={{ width: '200px' }} />
              </colgroup>
              
              {/* Table Header */}
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700/50">
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Mahsulot juftligi
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Birga sotilgan
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Qo'llab-quvvatlash %
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                {loading ? (
                  // Loading Skeleton
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 py-5">
                        <div className="flex justify-center">
                          <div className="w-6 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                          <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex justify-center">
                          <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex justify-end items-center gap-3">
                          <div className="w-14 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                          <div className="w-24 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : data?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-16 text-center text-gray-500 dark:text-gray-400">
                      Ushbu mezonlar uchun mahsulot bog'lanishlari topilmadi
                    </td>
                  </tr>
                ) : (
                  data?.map((item, index) => {
                    const percent = Number(item.support_percent);
                    
                    return (
                      <tr 
                        key={index} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-150"
                      >
                        {/* Rank */}
                        <td className="px-4 py-4">
                          <div className="flex justify-center">
                            <span className="font-bold text-gray-500 dark:text-gray-400 text-sm">
                              {index + 1}
                            </span>
                          </div>
                        </td>

                        {/* Product Pair */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-medium text-gray-900 dark:text-white px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm whitespace-nowrap">
                              {item.product_1}
                            </span>
                            <Link2 className="w-4 h-4 text-primary-500 flex-shrink-0" />
                            <span className="font-medium text-gray-900 dark:text-white px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm whitespace-nowrap">
                              {item.product_2}
                            </span>
                          </div>
                        </td>

                        {/* Times Together */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <ShoppingCart className="w-4 h-4 text-blue-500" />
                            <span className="font-bold text-blue-600 dark:text-blue-400 text-lg font-mono">
                              {item.times_bought_together.toLocaleString()}
                            </span>
                          </div>
                        </td>

                        {/* Support % */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-3">
                            <span className="font-semibold text-gray-700 dark:text-gray-300 font-mono w-[55px] text-right">
                              {percent.toFixed(2)}%
                            </span>
                            <div className="w-24 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-primary-500 rounded-full transition-all duration-300" 
                                style={{ width: `${Math.min(percent * 50, 100)}%` }}
                              />
                            </div>
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
              <span>{data.length} ta juftlik ko'rsatilmoqda</span>
              <span className="font-mono text-xs">GET /api/v1/analytics/products/market-basket</span>
            </div>
          </div>
        )}
      </Card>
      
      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-200 dark:border-blue-900/30 p-5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-500 rounded-xl flex-shrink-0">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Qo'shma sotish strategiyasi
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                Ushbu juftliklarni "Tez-tez birga sotib olinadi" tavsiyalari uchun ishlating. 
                Mijoz bitta mahsulotni qo'shganda, savat qiymatini oshirish uchun uning juftligini taklif qiling.
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10 border-purple-200 dark:border-purple-900/30 p-5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-purple-500 rounded-xl flex-shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                To'plam imkoniyatlari
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
                Yuqori qo'llab-quvvatlashga ega juftliklar uchun chegirmali to'plamlar yarating. 
                O'rtacha buyurtma qiymatini (AOV) oshirish uchun birga sotib olinganda 5-10% chegirma taklif qiling.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}