import { useMemo, useState } from 'react';
import { UserCheck, UserX, Calendar, TrendingUp, Clock, Users, ArrowLeft, Filter, X } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { PieChart, BarChart } from '@/components/charts';
import { useRetentionAnalysis } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/helpers';
import { formatDate } from '@/utils/formatters';
import { CHART_COLORS } from '@/utils/constants';

// Buyer type configuration
const BUYER_TYPE_CONFIG: Record<string, { color: string; variant: 'success' | 'warning' | 'info' | 'danger' }> = {
  'Frequent Buyer': { color: '#10b981', variant: 'success' },
  'Regular Buyer': { color: '#3b82f6', variant: 'info' },
  'Occasional Buyer': { color: '#f59e0b', variant: 'warning' },
  'One-Time Buyer': { color: '#ef4444', variant: 'danger' },
};

export function RetentionPage() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useRetentionAnalysis();

  // Get unique buyer types
  const buyerTypes = useMemo(() => {
    if (!data) return [];
    const types = new Set(data.map((c: any) => c.original_buyer_type).filter(Boolean));
    return Array.from(types).sort();
  }, [data]);

  const [selectedBuyerType, setSelectedBuyerType] = useState<string>('all');

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (selectedBuyerType === 'all') return data;
    return data.filter((item: any) => item.original_buyer_type === selectedBuyerType);
  }, [data, selectedBuyerType]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalCustomers: 0,
        repeatCustomers: 0,
        oneTimeCustomers: 0,
        avgLifespan: 0,
        avgOrderFrequency: 0,
        retentionRate: 0,
      };
    }

    const repeat = data.filter((c) => c.buyer_type === 'repeat');
    const oneTime = data.filter((c) => c.buyer_type === 'one_time');
    const totalLifespan = data.reduce((sum, c) => sum + (c.lifespan_days || 0), 0);
    const avgDaysBetween = data.reduce((sum, c) => sum + ((c as any).avg_days_between_orders || 0), 0);

    return {
      totalCustomers: data.length,
      repeatCustomers: repeat.length,
      oneTimeCustomers: oneTime.length,
      avgLifespan: Math.round(totalLifespan / data.length),
      avgOrderFrequency: data.length > 0 ? Math.round(avgDaysBetween / data.length) : 0,
      retentionRate: data.length > 0 ? (repeat.length / data.length) * 100 : 0,
    };
  }, [data]);

  // Lifespan distribution
  const lifespanGroups = useMemo(() => {
    if (!data) return [];
    return [
      { name: '0-30 kun', value: data.filter((c) => c.lifespan_days <= 30).length, color: CHART_COLORS[0] },
      { name: '31-90 kun', value: data.filter((c) => c.lifespan_days > 30 && c.lifespan_days <= 90).length, color: CHART_COLORS[1] },
      { name: '91-180 kun', value: data.filter((c) => c.lifespan_days > 90 && c.lifespan_days <= 180).length, color: CHART_COLORS[2] },
      { name: '181-365 kun', value: data.filter((c) => c.lifespan_days > 180 && c.lifespan_days <= 365).length, color: CHART_COLORS[3] },
      { name: '365+ kun', value: data.filter((c) => c.lifespan_days > 365).length, color: CHART_COLORS[4] },
    ];
  }, [data]);

  // Buyer type distribution
  const buyerTypeDistribution = useMemo(() => {
    if (!data) return [];
    const grouped: Record<string, number> = {};
    data.forEach((c) => {
      const type = (c as any).original_buyer_type || 'Unknown';
      grouped[type] = (grouped[type] || 0) + 1;
    });
    return Object.entries(grouped)
      .map(([name, value], index) => ({
        name,
        value,
        color: BUYER_TYPE_CONFIG[name]?.color || CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  // Get order count color
  const getOrderCountColor = (orders: number) => {
    if (orders >= 20) return 'text-emerald-400 font-semibold';
    if (orders >= 10) return 'text-blue-400 font-medium';
    if (orders >= 5) return 'text-yellow-400';
    return 'text-gray-400';
  };

  // Get lifespan color
  const getLifespanColor = (days: number) => {
    if (days >= 365) return 'text-emerald-400';
    if (days >= 180) return 'text-blue-400';
    if (days >= 90) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Get buyer type badge
  const getBuyerTypeBadge = (type: string) => {
    const config = BUYER_TYPE_CONFIG[type];
    if (!config) {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-500/15 text-gray-400 border border-gray-500/30">
          {type || 'N/A'}
        </span>
      );
    }

    return (
      <span 
        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border"
        style={{ 
          backgroundColor: `${config.color}15`,
          color: config.color,
          borderColor: `${config.color}30`
        }}
      >
        {type}
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
              Mijoz Retention Tahlili
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              Mijozlarni saqlab qolish va qayta xarid tahlili
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-500/20">
              <Users className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Jami mijozlar
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {stats.totalCustomers}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20">
              <UserCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Qayta xaridorlar
              </p>
              <p className="text-xl font-bold text-emerald-500 mt-0.5">
                {stats.repeatCustomers}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-yellow-500/20">
              <UserX className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Bir martali
              </p>
              <p className="text-xl font-bold text-yellow-500 mt-0.5">
                {stats.oneTimeCustomers}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Retention rate
              </p>
              <p className="text-xl font-bold text-blue-500 mt-0.5">
                {stats.retentionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20">
              <Calendar className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                O'rtacha faollik
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {stats.avgLifespan} <span className="text-sm font-normal text-gray-500">kun</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                O'rtacha interval
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
                {stats.avgOrderFrequency} <span className="text-sm font-normal text-gray-500">kun</span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border border-gray-200 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Xaridor turi taqsimoti
          </h3>
          {loading ? (
            <div className="h-[300px] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ) : buyerTypeDistribution.length > 0 ? (
            <PieChart data={buyerTypeDistribution} donut height={300} showLabels />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Ma'lumot topilmadi
            </div>
          )}
        </Card>

        <Card className="p-6 border border-gray-200 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Faollik davri taqsimoti
          </h3>
          {loading ? (
            <div className="h-[300px] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ) : (
            <BarChart
              data={lifespanGroups}
              xKey="name"
              yKey="value"
              formatAsAmount={false}
              height={300}
              colorByValue
            />
          )}
        </Card>
      </div>

      {/* Retention Rate Visual */}
      <Card className="p-6 border border-gray-200 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Retention ko'rsatkichi
          </h3>
          <span className="text-2xl font-bold text-emerald-500">
            {stats.retentionRate.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
            style={{ width: `${stats.retentionRate}%` }}
          />
        </div>
        <div className="flex justify-between mt-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-gray-600 dark:text-gray-400">
              {stats.repeatCustomers} qayta xaridorlar
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              {stats.oneTimeCustomers} bir martali
            </span>
          </div>
        </div>
      </Card>

      {/* Filter Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Xaridor turi bo'yicha filtr
            </span>
          </div>
          {selectedBuyerType !== 'all' && (
            <button
              onClick={() => setSelectedBuyerType('all')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-3 h-3" />
              Filtrni tozalash
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* All Types Button */}
          <button
            onClick={() => setSelectedBuyerType('all')}
            className={cn(
              "px-4 py-2.5 rounded-xl border-2 transition-all duration-200 flex items-center gap-2",
              selectedBuyerType === 'all'
                ? "border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400 shadow-lg shadow-primary-500/20"
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/50"
            )}
          >
            <Users className="w-4 h-4" />
            <span className="font-medium">Barchasi</span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-bold",
              selectedBuyerType === 'all' 
                ? "bg-primary-500/20 text-primary-600 dark:text-primary-400" 
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            )}>
              {stats.totalCustomers}
            </span>
          </button>

          {/* Buyer Type Buttons */}
          {buyerTypeDistribution.map((type) => {
            const isSelected = selectedBuyerType === type.name;
            const config = BUYER_TYPE_CONFIG[type.name];
            const color = config?.color || '#6B7280';
            
            return (
              <button
                key={type.name}
                onClick={() => setSelectedBuyerType(isSelected ? 'all' : type.name)}
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
                <span className="font-medium">{type.name}</span>
                <span 
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: isSelected ? `${color}20` : undefined,
                    color: isSelected ? color : undefined,
                  }}
                >
                  {type.value}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filter Badge */}
      {selectedBuyerType !== 'all' && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">Faol filtr:</span>
          {getBuyerTypeBadge(selectedBuyerType)}
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
              Mijozlar ro'yxati
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedBuyerType === 'all' 
                ? 'Faollik davri va buyurtmalar tarixi' 
                : `${selectedBuyerType} — ${filteredData.length} ta mijoz`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {Object.entries(BUYER_TYPE_CONFIG).slice(0, 2).map(([type, config]) => (
              <span 
                key={type}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium"
                style={{ 
                  backgroundColor: `${config.color}15`,
                  color: config.color,
                }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                {type.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: '1100px' }}>
            <colgroup>
              <col style={{ width: '180px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '100px' }} />
              <col style={{ width: '130px' }} />
              <col style={{ width: '130px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '120px' }} />
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
                  Birinchi buyurtma
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Oxirgi buyurtma
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Faollik davri
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  O'rtacha interval
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Xaridor turi
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <div className="w-24 h-7 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-gray-500 dark:text-gray-400">
                    Mijozlar topilmadi
                  </td>
                </tr>
              ) : (
                filteredData.map((customer: any, index: number) => (
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

                    {/* Orders */}
                    <td className="px-4 py-4 text-center">
                      <span className={cn('font-mono', getOrderCountColor(customer.total_orders || 0))}>
                        {customer.total_orders || 0}
                      </span>
                    </td>

                    {/* First Order */}
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(customer.first_order_date)}
                      </span>
                    </td>

                    {/* Last Order */}
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(customer.last_order_date)}
                      </span>
                    </td>

                    {/* Lifespan */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className={cn('font-medium font-mono', getLifespanColor(customer.lifespan_days || 0))}>
                          {customer.lifespan_days || 0}
                        </span>
                        <span className="text-xs text-gray-500">kun</span>
                      </div>
                    </td>

                    {/* Avg Interval */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300 font-mono">
                          {Math.round(customer.avg_days_between_orders || 0)}
                        </span>
                        <span className="text-xs text-gray-500">kun</span>
                      </div>
                    </td>

                    {/* Buyer Type */}
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        {getBuyerTypeBadge(customer.original_buyer_type)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && filteredData.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{filteredData.length} ta mijoz ko'rsatilmoqda</span>
              <span className="font-mono text-xs">GET /api/v1/analytics/customers/retention</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}