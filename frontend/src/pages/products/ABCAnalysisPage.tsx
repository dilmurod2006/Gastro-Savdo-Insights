import { useState } from 'react';
import { useABCAnalysis } from '@/hooks';
import { Card } from '@/components/ui/Card';
import { ABCAnalysisProduct } from '@/types/analytics.types';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Package, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ABCAnalysisPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useABCAnalysis();
  const [selectedClass, setSelectedClass] = useState<'all' | 'A' | 'B' | 'C'>('all');

  // Calculate summary stats
  const classA = data?.filter((p: ABCAnalysisProduct) => p.abc_category.startsWith('A')) || [];
  const classB = data?.filter((p: ABCAnalysisProduct) => p.abc_category.startsWith('B')) || [];
  const classC = data?.filter((p: ABCAnalysisProduct) => p.abc_category.startsWith('C')) || [];

  const classARevenue = classA.reduce((sum, p) => sum + p.total_revenue, 0);
  const classBRevenue = classB.reduce((sum, p) => sum + p.total_revenue, 0);
  const classCRevenue = classC.reduce((sum, p) => sum + p.total_revenue, 0);
  const totalRevenue = classARevenue + classBRevenue + classCRevenue;

  // Filter data based on selected class
  const filteredData = selectedClass === 'all' 
    ? data 
    : data?.filter((p: ABCAnalysisProduct) => p.abc_category.startsWith(selectedClass)) || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Get badge for ABC class
  const getClassBadge = (category: string) => {
    const isA = category.startsWith('A');
    const isB = category.startsWith('B');
    
    if (isA) {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-sm font-bold">
          A
        </span>
      );
    }
    if (isB) {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 text-sm font-bold">
          B
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-500/15 text-gray-400 border border-gray-500/30 text-sm font-bold">
        C
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
              ABC Tahlili
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              Daromad ta'siriga asoslangan inventar tasnifi
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="success">A Sinf</Badge>
                <span className="text-xs text-gray-500">Eng muhim</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{classA.length} ta mahsulot</p>
              <p className="text-sm text-emerald-500 font-medium mt-1">
                ${(classARevenue / 1000).toFixed(0)}K ({totalRevenue > 0 ? ((classARevenue / totalRevenue) * 100).toFixed(1) : 0}%)
              </p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            Yuqori ustuvorlik. Qat'iy nazorat talab qilinadi.
          </p>
        </Card>

        <Card className="p-5 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="warning">B Sinf</Badge>
                <span className="text-xs text-gray-500">O'rtacha</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{classB.length} ta mahsulot</p>
              <p className="text-sm text-yellow-600 font-medium mt-1">
                ${(classBRevenue / 1000).toFixed(0)}K ({totalRevenue > 0 ? ((classBRevenue / totalRevenue) * 100).toFixed(1) : 0}%)
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl">
              <BarChart3 className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            O'rtacha ustuvorlik. Mo''tadil nazorat kerak.
          </p>
        </Card>

        <Card className="p-5 border-l-4 border-l-gray-400">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="default">C Sinf</Badge>
                <span className="text-xs text-gray-500">Oddiy</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{classC.length} ta mahsulot</p>
              <p className="text-sm text-gray-600 font-medium mt-1">
                ${(classCRevenue / 1000).toFixed(0)}K ({totalRevenue > 0 ? ((classCRevenue / totalRevenue) * 100).toFixed(1) : 0}%)
              </p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <Package className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            Past ustuvorlik. Ommaviy buyurtma tavsiya etiladi.
          </p>
        </Card>
      </div>

      {/* Revenue Distribution Visual */}
      <Card className="p-5 overflow-visible">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-6">
          Sinf bo'yicha daromad taqsimoti
        </h3>
        <div className="flex h-10 rounded-full overflow-visible">
          {/* Class A */}
          <div 
            className="bg-emerald-500 flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:bg-emerald-600 transition-colors relative group first:rounded-l-full"
            style={{ width: `${totalRevenue > 0 ? (classARevenue / totalRevenue) * 100 : 0}%` }}
          >
            A
            <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-3 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-xl shadow-2xl z-[100] min-w-[160px]">
              <div className="font-bold text-emerald-400 text-base mb-2">A Sinf</div>
              <div className="text-gray-400 text-xs mb-1">Eng muhim</div>
              <div className="text-gray-300 text-sm">{classA.length} ta mahsulot</div>
              <div className="text-white font-semibold text-sm">${classARevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
              <div className="text-emerald-400 font-bold text-xl mt-1">{((classARevenue / totalRevenue) * 100).toFixed(1)}%</div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
            </div>
          </div>
          {/* Class B */}
          <div 
            className="bg-yellow-500 flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:bg-yellow-600 transition-colors relative group"
            style={{ width: `${totalRevenue > 0 ? (classBRevenue / totalRevenue) * 100 : 0}%` }}
          >
            B
            <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-3 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-xl shadow-2xl z-[100] min-w-[160px]">
              <div className="font-bold text-yellow-400 text-base mb-2">B Sinf</div>
              <div className="text-gray-400 text-xs mb-1">O'rtacha</div>
              <div className="text-gray-300 text-sm">{classB.length} ta mahsulot</div>
              <div className="text-white font-semibold text-sm">${classBRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
              <div className="text-yellow-400 font-bold text-xl mt-1">{((classBRevenue / totalRevenue) * 100).toFixed(1)}%</div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
            </div>
          </div>
          {/* Class C */}
          <div 
            className="bg-gray-400 flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:bg-gray-500 transition-colors relative group last:rounded-r-full"
            style={{ width: `${totalRevenue > 0 ? (classCRevenue / totalRevenue) * 100 : 0}%` }}
          >
            C
            <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-3 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-xl shadow-2xl z-[100] min-w-[160px]">
              <div className="font-bold text-gray-300 text-base mb-2">C Sinf</div>
              <div className="text-gray-400 text-xs mb-1">Oddiy</div>
              <div className="text-gray-300 text-sm">{classC.length} ta mahsulot</div>
              <div className="text-white font-semibold text-sm">${classCRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
              <div className="text-gray-300 font-bold text-xl mt-1">{((classCRevenue / totalRevenue) * 100).toFixed(1)}%</div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden border border-gray-200 dark:border-gray-700/50 shadow-sm p-0">
        {/* Table Header with Filter */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/50">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Mahsulot tasnifi</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedClass === 'all' 
                ? `Barcha ${data?.length || 0} ta mahsulot daromad bo'yicha tartiblangan` 
                : `${selectedClass} Sinf: ${filteredData?.length || 0} ta mahsulot`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Filtr:</span>
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setSelectedClass('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedClass === 'all' 
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Barchasi
              </button>
              <button
                onClick={() => setSelectedClass('A')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedClass === 'A' 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-emerald-500'
                }`}
              >
                A ({classA.length})
              </button>
              <button
                onClick={() => setSelectedClass('B')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedClass === 'B' 
                    ? 'bg-yellow-500 text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-yellow-500'
                }`}
              >
                B ({classB.length})
              </button>
              <button
                onClick={() => setSelectedClass('C')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  selectedClass === 'C' 
                    ? 'bg-gray-500 text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-500'
                }`}
              >
                C ({classC.length})
              </button>
            </div>
          </div>
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
                <col style={{ width: '70px' }} />
                <col style={{ width: '250px' }} />
                <col style={{ width: '150px' }} />
                <col style={{ width: '140px' }} />
                <col style={{ width: '100px' }} />
                <col style={{ width: '140px' }} />
                <col style={{ width: '80px' }} />
              </colgroup>
              
              {/* Table Header */}
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700/50">
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    #
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
                    Ulush
                  </th>
                  <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Kumulyativ
                  </th>
                  <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sinf
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
                        <div className="w-40 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end">
                          <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end">
                          <div className="w-14 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end items-center gap-2">
                          <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filteredData?.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-gray-500 dark:text-gray-400">
                      Tahlil ma'lumotlari topilmadi
                    </td>
                  </tr>
                ) : (
                  filteredData?.map((product) => {
                    const percent = Number(product.revenue_percentage);
                    const cumulative = Number(product.cumulative_percentage);
                    
                    return (
                      <tr 
                        key={product.revenue_rank} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-150"
                      >
                        {/* Rank */}
                        <td className="px-4 py-4">
                          <div className="flex justify-center">
                            <span className="font-bold text-gray-500 dark:text-gray-400 text-sm">
                              {product.revenue_rank}
                            </span>
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
                            <span className="text-gray-600 dark:text-gray-300 text-sm">
                              {product.category_name || '—'}
                            </span>
                          </div>
                        </td>

                        {/* Revenue */}
                        <td className="px-4 py-4 text-right">
                          <span className="font-bold text-emerald-400 text-[15px] font-mono">
                            {formatCurrency(product.total_revenue)}
                          </span>
                        </td>

                        {/* Share */}
                        <td className="px-4 py-4 text-right">
                          <span className="font-medium text-gray-300 text-sm font-mono">
                            {percent.toFixed(2)}%
                          </span>
                        </td>

                        {/* Cumulative */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-gray-400 text-sm font-mono w-[50px] text-right">
                              {cumulative.toFixed(1)}%
                            </span>
                            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300" 
                                style={{ width: `${cumulative}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Class */}
                        <td className="px-4 py-4">
                          <div className="flex justify-center">
                            {getClassBadge(product.abc_category)}
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
        {!loading && !error && filteredData && filteredData.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{filteredData.length} ta mahsulot ko'rsatilmoqda</span>
              <span className="font-mono text-xs">GET /api/v1/analytics/products/abc-analysis</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}