import { useMemo, useState } from 'react';
import { Card, Button } from '@/components/ui';
import { PieChart } from '@/components/charts';
import { useRFMSegmentation } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/helpers';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { CHART_COLORS } from '@/utils/constants';
import { Crown, Users, TrendingUp, UserPlus, AlertTriangle, UserX, Download, ArrowLeft, Filter, X } from 'lucide-react';
import type { RFMCustomer } from '@/types';

// Segment configuration with icons
const SEGMENT_CONFIG: Record<string, { color: string; icon: React.ElementType; description: string }> = {
  'Champions': { color: '#10b981', icon: Crown, description: 'Eng yaxshi mijozlar' },
  'Loyal Customers': { color: '#3b82f6', icon: Users, description: 'Sodiq mijozlar' },
  'Potential Loyalist': { color: '#8b5cf6', icon: TrendingUp, description: 'Potentsial sodiq' },
  'New Customers': { color: '#6366f1', icon: UserPlus, description: 'Yangi mijozlar' },
  'Promising': { color: '#14b8a6', icon: TrendingUp, description: 'Istiqbolli' },
  'Need Attention': { color: '#f59e0b', icon: AlertTriangle, description: "E'tibor kerak" },
  'At Risk': { color: '#f97316', icon: AlertTriangle, description: 'Xavf ostida' },
  'Hibernating': { color: '#ef4444', icon: UserX, description: 'Uyquda' },
  'Lost': { color: '#dc2626', icon: UserX, description: "Yo'qotilgan" },
};

export function RFMSegmentationPage() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useRFMSegmentation();

  const [selectedSegment, setSelectedSegment] = useState<string>('all');

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (selectedSegment === 'all') return data;
    return data.filter(item => item.segment === selectedSegment);
  }, [data, selectedSegment]);

  // Calculate segment statistics
  const segmentStats = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const grouped: Record<string, { count: number; revenue: number }> = {};
    
    data.forEach((customer) => {
      const seg = customer.segment || 'Unknown';
      if (!grouped[seg]) {
        grouped[seg] = { count: 0, revenue: 0 };
      }
      grouped[seg].count++;
      grouped[seg].revenue += customer.monetary || 0;
    });

    return Object.entries(grouped)
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        revenue: stats.revenue,
        color: SEGMENT_CONFIG[name]?.color || '#6B7280',
        icon: SEGMENT_CONFIG[name]?.icon || Users,
        description: SEGMENT_CONFIG[name]?.description || name,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [data]);

  // PieChart data
  const pieChartData = segmentStats.map((seg, index) => ({
    name: seg.name,
    value: seg.count,
    color: seg.color || CHART_COLORS[index % CHART_COLORS.length],
  }));

  // Total stats
  const totalCustomers = data?.length || 0;
  const totalRevenue = data?.reduce((sum, c) => sum + (c.monetary || 0), 0) || 0;
  const avgRFM = data?.length 
    ? data.reduce((sum, c) => sum + c.r_score + c.f_score + c.m_score, 0) / (data.length * 3)
    : 0;

  // Get recency color
  const getRecencyColor = (days: number) => {
    if (days > 60) return 'text-red-400';
    if (days > 30) return 'text-yellow-400';
    return 'text-emerald-400';
  };

  // Get segment badge
  const getSegmentBadge = (segment: string) => {
    const config = SEGMENT_CONFIG[segment];
    if (!config) {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-500/15 text-gray-400 border border-gray-500/30">
          {segment}
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              RFM Segmentatsiya
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              Mijozlarni Recency, Frequency, Monetary asosida segmentlash
            </p>
          </div>
        </div>
      
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Jami mijozlar
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatNumber(totalCustomers)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-primary-500/20">
              <Users className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </Card>
        <Card className="p-5 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Jami daromad
              </p>
              <p className="text-2xl font-bold text-emerald-500 mt-1">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
        </Card>
        <Card className="p-5 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                O'rtacha RFM ball
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {avgRFM.toFixed(1)} / 5
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Crown className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Segment Filter Cards */}
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
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-3">
          {/* All Segments Card */}
          <button
            onClick={() => setSelectedSegment('all')}
            className={cn(
              "p-4 rounded-xl border-2 transition-all duration-200 text-left",
              selectedSegment === 'all'
                ? "border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/50"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                selectedSegment === 'all' ? "bg-primary-500/20" : "bg-gray-100 dark:bg-gray-700"
              )}>
                <Users className={cn(
                  "w-4 h-4",
                  selectedSegment === 'all' ? "text-primary-500" : "text-gray-500"
                )} />
              </div>
              <span className={cn(
                "text-lg font-bold",
                selectedSegment === 'all' ? "text-primary-500" : "text-gray-900 dark:text-white"
              )}>
                {totalCustomers}
              </span>
            </div>
            <p className={cn(
              "text-xs font-medium truncate",
              selectedSegment === 'all' ? "text-primary-600 dark:text-primary-400" : "text-gray-600 dark:text-gray-400"
            )}>
              Barchasi
            </p>
          </button>

          {/* Segment Cards */}
          {segmentStats.map((seg) => {
            const Icon = seg.icon;
            const isSelected = selectedSegment === seg.name;
            
            return (
              <button
                key={seg.name}
                onClick={() => setSelectedSegment(isSelected ? 'all' : seg.name)}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all duration-200 text-left",
                  isSelected
                    ? "shadow-lg"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/50"
                )}
                style={{
                  borderColor: isSelected ? seg.color : undefined,
                  backgroundColor: isSelected ? `${seg.color}10` : undefined,
                  boxShadow: isSelected ? `0 10px 25px -5px ${seg.color}30` : undefined,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${seg.color}20` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: seg.color }} />
                  </div>
                  <span 
                    className="text-lg font-bold"
                    style={{ color: isSelected ? seg.color : undefined }}
                  >
                    {seg.count}
                  </span>
                </div>
                <p 
                  className="text-xs font-medium truncate"
                  style={{ color: isSelected ? seg.color : undefined }}
                  title={seg.name}
                >
                  {seg.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filter Badge */}
      {selectedSegment !== 'all' && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">Faol filtr:</span>
          <span 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border"
            style={{ 
              backgroundColor: `${SEGMENT_CONFIG[selectedSegment]?.color || '#6B7280'}15`,
              color: SEGMENT_CONFIG[selectedSegment]?.color || '#6B7280',
              borderColor: `${SEGMENT_CONFIG[selectedSegment]?.color || '#6B7280'}30`
            }}
          >
            {(() => {
              const Icon = SEGMENT_CONFIG[selectedSegment]?.icon || Users;
              return <Icon className="w-3.5 h-3.5" />;
            })()}
            {selectedSegment}
            <button 
              onClick={() => setSelectedSegment('all')}
              className="ml-1 hover:opacity-70 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            — {filteredData.length} ta mijoz
          </span>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card className="p-6 border border-gray-200 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Segment taqsimoti
          </h3>
          {loading ? (
            <div className="h-[300px] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ) : pieChartData.length > 0 ? (
            <PieChart
              data={pieChartData}
              donut
              height={300}
              showLabels
            />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              Ma'lumot topilmadi
            </div>
          )}
        </Card>

        {/* Segment Details */}
        <Card className="p-6 border border-gray-200 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Segment tafsilotlari
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {segmentStats.map((seg) => {
              const percentage = totalCustomers > 0 ? (seg.count / totalCustomers) * 100 : 0;
              const isSelected = selectedSegment === seg.name;
              
              return (
                <button
                  key={seg.name}
                  onClick={() => setSelectedSegment(isSelected ? 'all' : seg.name)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200",
                    isSelected 
                      ? "bg-gray-100 dark:bg-gray-700/50" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/30"
                  )}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "text-sm font-medium truncate",
                        isSelected ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
                      )}>
                        {seg.name}
                      </span>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 ml-2">
                        {seg.count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: seg.color 
                        }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="overflow-hidden border border-gray-200 dark:border-gray-700/50 shadow-sm p-0">
        {/* Table Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Mijozlar ro'yxati
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedSegment === 'all' 
                ? 'Barcha segmentlar bo\'yicha' 
                : `${selectedSegment} segmenti`} — {filteredData.length} ta mijoz
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">R</span>
              <span className="text-gray-500 dark:text-gray-400">Recency</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">F</span>
              <span className="text-gray-500 dark:text-gray-400">Frequency</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[10px]">M</span>
              <span className="text-gray-500 dark:text-gray-400">Monetary</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: '900px' }}>
            <colgroup>
              <col style={{ width: '220px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '150px' }} />
              <col style={{ width: '140px' }} />
              <col style={{ width: '150px' }} />
            </colgroup>
            
            {/* Table Header */}
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700/50">
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Kompaniya
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Recency (kun)
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Frequency
                </th>
                <th className="px-4 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Monetary
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  RFM Ball
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
                      <div className="flex justify-end">
                        <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-1">
                        <div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="w-7 h-7 bg-gray-200 dark:bg-gray-700 rounded" />
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
                  <td colSpan={6} className="px-4 py-16 text-center text-gray-500 dark:text-gray-400">
                    Mijozlar topilmadi
                  </td>
                </tr>
              ) : (
                filteredData.map((customer, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-150"
                  >
                    <td className="px-4 py-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {customer.company_name}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={cn('font-medium font-mono', getRecencyColor(customer.recency_days || 0))}>
                        {customer.recency_days || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-medium text-gray-700 dark:text-gray-300 font-mono">
                        {formatNumber(customer.frequency)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-bold text-emerald-500 font-mono">
                        {formatCurrency(customer.monetary)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <span className="w-7 h-7 rounded bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">
                          {customer.r_score}
                        </span>
                        <span className="w-7 h-7 rounded bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold">
                          {customer.f_score}
                        </span>
                        <span className="w-7 h-7 rounded bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center font-bold">
                          {customer.m_score}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        {getSegmentBadge(customer.segment)}
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
              <span className="font-mono text-xs">GET /api/v1/analytics/customers/rfm-segmentation</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}