import { useMemo, useState } from 'react';
import { Card, Table, Badge, ErrorState, Button } from '@/components/ui';
import { PieChart } from '@/components/charts';
import { useTheme } from '@/contexts';
import { useRFMSegmentation } from '@/hooks';
import { cn } from '@/utils/helpers';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { CHART_COLORS } from '@/utils/constants';
import { Crown, Users, TrendingUp, UserPlus, AlertTriangle, UserX, Download } from 'lucide-react';
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
  const { theme } = useTheme();
  const { data, loading, error, refetch } = useRFMSegmentation();

  // Get unique segments for filter
  const segments = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.map(d => d.segment))).sort();
  }, [data]);

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

  const columns = [
    {
      key: 'company_name',
      header: 'Kompaniya',
      render: (value: unknown) => (
        <span className="font-medium text-white">{value as string}</span>
      ),
    },
    {
      key: 'recency_days',
      header: 'Recency (kun)',
      align: 'center' as const,
      render: (value: unknown) => {
        const days = Number(value) || 0;
        let colorClass = 'text-green-400';
        if (days > 60) colorClass = 'text-red-400';
        else if (days > 30) colorClass = 'text-yellow-400';
        return <span className={cn('font-medium', colorClass)}>{days}</span>;
      },
    },
    {
      key: 'frequency',
      header: 'Frequency',
      align: 'center' as const,
      render: (value: unknown) => (
        <span className="font-medium">{formatNumber(value as number)}</span>
      ),
    },
    {
      key: 'monetary',
      header: 'Monetary',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="font-semibold text-green-500">{formatCurrency(value as number)}</span>
      ),
    },
    {
      key: 'rfm_score',
      header: 'RFM Score',
      align: 'center' as const,
      render: (_value: unknown, row: unknown) => {
        const customer = row as RFMCustomer;
        return (
          <div className="flex items-center justify-center gap-1">
            <span className="w-6 h-6 rounded bg-green-500/20 text-green-400 text-xs flex items-center justify-center font-bold">
              {customer.r_score}
            </span>
            <span className="w-6 h-6 rounded bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold">
              {customer.f_score}
            </span>
            <span className="w-6 h-6 rounded bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center font-bold">
              {customer.m_score}
            </span>
          </div>
        );
      },
    },
    {
      key: 'segment',
      header: 'Segment',
      align: 'center' as const,
      render: (value: unknown) => {
        const segment = value as string;
        return (
          <Badge
            variant={
              segment === 'Champions' ? 'success' :
              segment === 'Lost' || segment === 'Hibernating' ? 'danger' :
              segment === 'At Risk' || segment === 'Need Attention' ? 'warning' :
              'info'
            }
          >
            {segment}
          </Badge>
        );
      },
    },
  ];

  if (error) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className={cn(
          'text-2xl font-bold',
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          RFM Segmentatsiya
        </h1>
        <p className={cn(
          'text-sm mt-1',
          theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
        )}>
          Mijozlarni Recency, Frequency, Monetary asosida segmentlash
        </p>
      </div>
      
      <div className="flex items-center gap-2">
           <select
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
          >
            <option value="all">Barcha Segmentlar</option>
            {segments.map(segment => (
              <option key={segment} value={segment}>{segment}</option>
            ))}
          </select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
      </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className={cn('text-sm', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Jami mijozlar
              </p>
              <p className={cn('text-2xl font-bold mt-1', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {formatNumber(totalCustomers)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Users className="text-primary-500" size={24} />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className={cn('text-sm', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Jami daromad
              </p>
              <p className="text-2xl font-bold mt-1 text-green-500">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="text-green-500" size={24} />
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className={cn('text-sm', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                O'rtacha RFM ball
              </p>
              <p className={cn('text-2xl font-bold mt-1', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {avgRFM.toFixed(1)} / 5
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Crown className="text-purple-500" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Segment Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {segmentStats.slice(0, 5).map((seg) => {
          const Icon = seg.icon;
          return (
            <Card key={seg.name} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${seg.color}20` }}
                >
                  <Icon size={20} style={{ color: seg.color }} />
                </div>
                <span 
                  className="text-2xl font-bold"
                  style={{ color: seg.color }}
                >
                  {seg.count}
                </span>
              </div>
              <p className={cn(
                'text-sm font-medium truncate',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                {seg.name}
              </p>
              <p className={cn(
                'text-xs mt-0.5',
                theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
              )}>
                {formatCurrency(seg.revenue)}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card className="p-6">
          <h3 className={cn(
            'text-lg font-semibold mb-4',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Segment taqsimoti
          </h3>
          {loading ? (
            <div className="h-75 skeleton rounded-lg" />
          ) : pieChartData.length > 0 ? (
            <PieChart
              data={pieChartData}
              donut
              height={300}
              showLabels
            />
          ) : (
            <div className="h-75 flex items-center justify-center text-slate-400">
              Ma'lumot topilmadi
            </div>
          )}
        </Card>

        {/* Segment Details */}
        <Card className="p-6">
          <h3 className={cn(
            'text-lg font-semibold mb-4',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Segment tafsilotlari
          </h3>
          <div className="space-y-3">
            {segmentStats.map((seg) => {
              const percentage = totalCustomers > 0 ? (seg.count / totalCustomers) * 100 : 0;
              return (
                <div key={seg.name} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        'text-sm font-medium truncate',
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      )}>
                        {seg.name}
                      </span>
                      <span className={cn(
                        'text-sm font-semibold ml-2',
                        theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                      )}>
                        {seg.count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: seg.color 
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className={cn(
          'px-6 py-4 border-b flex items-center justify-between',
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        )}>
          <div>
            <h3 className={cn(
              'text-lg font-semibold',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Mijozlar ro'yxati
            </h3>
            <p className={cn(
              'text-sm mt-0.5',
              theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
            )}>
              RFM ballari va segmentlar bilan
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-green-500/20 text-green-400 flex items-center justify-center font-bold">R</span>
              <span className="text-slate-400">Recency</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">F</span>
              <span className="text-slate-400">Frequency</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">M</span>
              <span className="text-slate-400">Monetary</span>
            </div>
          </div>
        </div>
        <Table
          columns={columns}
          data={filteredData || []}
          loading={loading}
        />
      </Card>
    </div>
  );
}
