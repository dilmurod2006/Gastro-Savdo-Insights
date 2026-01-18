import { useState, useMemo } from 'react';
import { Percent, Users, DollarSign, ArrowLeft, Filter, X, Tag } from 'lucide-react';
import { Card } from '@/components/ui';
import { BarChart, PieChart } from '@/components/charts';
import { useDiscountBehavior } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/helpers';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/formatters';
import { CHART_COLORS } from '@/utils/constants';
import type { DiscountBehaviorCustomer } from '@/types';

// Segment configuration
const SEGMENT_CONFIG: Record<string, { color: string; description: string }> = {
  'Full Price Buyer': { color: '#10b981', description: "To'liq narxda xarid qiluvchi" },
  'Discount Aware': { color: '#3b82f6', description: 'Chegirmadan xabardor' },
  'Low Discount User': { color: '#22c55e', description: 'Kam chegirma ishlatuvchi' },
  'Medium Discount User': { color: '#f59e0b', description: "O'rtacha chegirma ishlatuvchi" },
  'High Discount User': { color: '#ef4444', description: "Ko'p chegirma ishlatuvchi" },
  'Discount Hunter': { color: '#dc2626', description: 'Chegirma ovchisi' },
};

const LIMIT_OPTIONS = [
  { value: 20, label: 'TOP 20' },
  { value: 50, label: 'TOP 50' },
  { value: 100, label: 'TOP 100' },
];

export function DiscountBehaviorPage() {
  const navigate = useNavigate();
  const [limit, setLimit] = useState(50);
  const { data, loading, error, refetch } = useDiscountBehavior(limit);
  const [selectedSegment, setSelectedSegment] = useState<string>('all');

  // Get unique segments for filter


  const filteredData = useMemo(() => {
    if (!data) return [];
    if (selectedSegment === 'all') return data;
    return data.filter((item: any) => item.behavior_segment === selectedSegment);
  }, [data, selectedSegment]);

  // Segment distribution
  const segmentData = useMemo(() => {
    if (!data) return [];
    const grouped: Record<string, number> = {};
    data.forEach((c) => {
      const seg = c.behavior_segment || 'Unknown';
      grouped[seg] = (grouped[seg] || 0) + 1;
    });
    return Object.entries(grouped)
      .map(([name, value], index) => ({
        name,
        value,
        color: SEGMENT_CONFIG[name]?.color || CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  // Top discount users
  const topDiscountUsers = data?.slice(0, 10).map((c) => ({
    name: c.company_name.length > 20 ? c.company_name.slice(0, 20) + '...' : c.company_name,
    discount: c.total_discount_value,
  })) || [];

  // Summary
  const totalDiscount = data?.reduce((sum, c) => sum + c.total_discount_value, 0) || 0;
  
  const avgDiscountPct = useMemo(() => {
    if (!data || data.length === 0) return 0;
    const validPercentages = data
      .map(c => Number(c.discount_percentage))
      .filter(p => !isNaN(p));
    if (validPercentages.length === 0) return 0;
    return validPercentages.reduce((sum, p) => sum + p, 0) / validPercentages.length;
  }, [data]);

  // Get segment badge
  const getSegmentBadge = (segment: string) => {
    const config = SEGMENT_CONFIG[segment];
    const color = config?.color || '#6B7280';
    
    return (
      <span 
        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border"
        style={{ 
          backgroundColor: `${color}15`,
          color: color,
          borderColor: `${color}30`
        }}
      >
        {segment}
      </span>
    );
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
              Chegirma Xulq-atvori
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              Mijozlarning chegirma olish tendensiyasi
            </p>
          </div>
        </div>
        
        {/* Limit Selector */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl">
          {LIMIT_OPTIONS.map(option => (
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30">
              <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Jami chegirma
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {formatCurrency(totalDiscount)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <Percent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                O'rtacha chegirma %
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {formatPercent(avgDiscountPct)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Mijozlar soni
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {data?.length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border border-gray-200 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Segment taqsimoti
          </h3>
          {loading ? (
            <div className="h-[280px] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ) : (
            <PieChart data={segmentData} donut height={280} />
          )}
        </Card>

        <Card className="p-6 border border-gray-200 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            TOP 10 chegirma oluvchilar
          </h3>
          {loading ? (
            <div className="h-[280px] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ) : (
            <BarChart
              data={topDiscountUsers}
              xKey="name"
              yKey="discount"
              horizontal
              colorByValue
              height={280}
            />
          )}
        </Card>
      </div>

      {/* Filter Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Segment bo'yicha filtr
            </span>
          </div>
          {selectedSegment !== 'all' && (
            <button
              onClick={() => setSelectedSegment('all')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-3 h-3" />
              Filtrni tozalash
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* All Segments Button */}
          <button
            onClick={() => setSelectedSegment('all')}
            className={cn(
              "px-4 py-2.5 rounded-xl border-2 transition-all duration-200 flex items-center gap-2",
              selectedSegment === 'all'
                ? "border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400 shadow-lg shadow-primary-500/20"
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/50"
            )}
          >
            <Tag className="w-4 h-4" />
            <span className="font-medium">Barchasi</span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-bold",
              selectedSegment === 'all' 
                ? "bg-primary-500/20 text-primary-600 dark:text-primary-400" 
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            )}>
              {data?.length || 0}
            </span>
          </button>

          {/* Segment Buttons */}
          {segmentData.map((seg) => {
            const isSelected = selectedSegment === seg.name;
            const color = seg.color;
            
            return (
              <button
                key={seg.name}
                onClick={() => setSelectedSegment(isSelected ? 'all' : seg.name)}
                className={cn(
                  "px-4 py-2.5 rounded-xl border-2 transition-all duration-200 flex items-center gap-2",
                  isSelected
                    ? "shadow-lg"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/50"
                )}
                style={{
                  borderColor: isSelected ? color : undefined,
                  backgroundColor: isSelected ? `${color}10` : undefined,
                  boxShadow: isSelected ? `0 10px 25px -5px ${color}30` : undefined,
                  color: isSelected ? color : undefined,
                }}
              >
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="font-medium">{seg.name}</span>
                <span 
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: isSelected ? `${color}20` : undefined,
                    color: isSelected ? color : undefined,
                  }}
                >
                  {seg.value}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filter Badge */}
      {selectedSegment !== 'all' && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">Faol filtr:</span>
          {getSegmentBadge(selectedSegment)}
          <span className="text-sm text-gray-500 dark:text-gray-400">
            — {filteredData.length} ta mijoz
          </span>
        </div>
      )}

      {/* Table */}
      <Card className="overflow-hidden border border-gray-200 dark:border-gray-700/50 shadow-sm p-0">
        {/* Table Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Batafsil ma'lumotlar
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedSegment === 'all' 
                ? `Barcha segmentlar — ${filteredData.length} ta mijoz` 
                : `${selectedSegment} — ${filteredData.length} ta mijoz`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {Object.entries(SEGMENT_CONFIG).slice(0, 2).map(([name, config]) => (
              <span 
                key={name}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium"
                style={{ 
                  backgroundColor: `${config.color}15`,
                  color: config.color,
                }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                {name.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: '950px' }}>
            <colgroup>
              <col style={{ width: '200px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '180px' }} />
              <col style={{ width: '130px' }} />
              <col style={{ width: '150px' }} />
            </colgroup>
            
            {/* Table Header */}
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700/50">
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Kompaniya
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mamlakat
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Buyurtmalar
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Chegirmali
                </th>
                <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Chegirma %
                </th>
                <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Chegirma summasi
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Segment
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="w-36 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <div className="w-10 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <div className="w-10 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end">
                        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <div className="w-28 h-7 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-500 dark:text-gray-400">
                    Mijozlar topilmadi
                  </td>
                </tr>
              ) : (
                filteredData.map((customer: DiscountBehaviorCustomer, index: number) => {
                  const discountPct = Number(customer.discount_percentage) || 0;
                  
                  return (
                    <tr 
                      key={index} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-150"
                    >
                      {/* Company Name */}
                      <td className="px-4 py-4">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {customer.company_name}
                        </span>
                      </td>

                      {/* Country */}
                      <td className="px-4 py-4">
                        <span className="text-gray-600 dark:text-gray-300">
                          {customer.country}
                        </span>
                      </td>

                      {/* Total Orders */}
                      <td className="px-4 py-4 text-center">
                        <span className="font-medium text-gray-700 dark:text-gray-300 font-mono">
                          {formatNumber(customer.total_orders)}
                        </span>
                      </td>

                      {/* Orders with Discount */}
                      <td className="px-4 py-4 text-center">
                        <span className="font-medium text-gray-700 dark:text-gray-300 font-mono">
                          {formatNumber(customer.orders_with_discount)}
                        </span>
                      </td>

                      {/* Discount Percentage */}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(discountPct, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 font-mono w-[50px] text-right">
                            {formatPercent(discountPct)}
                          </span>
                        </div>
                      </td>

                      {/* Total Discount Value */}
                      <td className="px-4 py-4 text-right">
                        <span className="font-bold text-orange-500 font-mono">
                          {formatCurrency(customer.total_discount_value)}
                        </span>
                      </td>

                      {/* Segment */}
                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          {getSegmentBadge(customer.behavior_segment)}
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
        {!loading && filteredData.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{filteredData.length} ta mijoz ko'rsatilmoqda</span>
              <span className="font-mono text-xs">GET /api/v1/analytics/customers/discount-behavior</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}