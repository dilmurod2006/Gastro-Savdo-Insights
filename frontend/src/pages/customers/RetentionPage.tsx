import { useMemo } from 'react';
import { UserCheck, UserX, Calendar, TrendingUp, Clock, Users } from 'lucide-react';
import { Card, Table, Badge, ErrorState } from '@/components/ui';
import { PieChart, BarChart } from '@/components/charts';
import { useTheme } from '@/contexts';
import { useRetentionAnalysis } from '@/hooks';
import { cn } from '@/utils/helpers';
import { formatDate } from '@/utils/formatters';
import { CHART_COLORS } from '@/utils/constants';

export function RetentionPage() {
  const { theme } = useTheme();
  const { data, loading, error, refetch } = useRetentionAnalysis();

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

  // Buyer type distribution by original type
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
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const columns = [
    {
      key: 'company_name',
      header: 'Kompaniya',
      render: (value: unknown) => (
        <span className="font-medium text-white">{value as string}</span>
      ),
    },
    {
      key: 'country',
      header: 'Mamlakat',
      render: (value: unknown) => (
        <span className="text-slate-300">{value as string}</span>
      ),
    },
    {
      key: 'total_orders',
      header: 'Buyurtmalar',
      align: 'center' as const,
      render: (value: unknown) => {
        const orders = Number(value) || 0;
        let colorClass = 'text-slate-400';
        if (orders >= 20) colorClass = 'text-green-400 font-semibold';
        else if (orders >= 10) colorClass = 'text-blue-400 font-medium';
        else if (orders >= 5) colorClass = 'text-yellow-400';
        return <span className={colorClass}>{orders}</span>;
      },
    },
    {
      key: 'first_order_date',
      header: 'Birinchi buyurtma',
      render: (value: unknown) => (
        <span className="text-sm text-slate-400">{formatDate(value as string)}</span>
      ),
    },
    {
      key: 'last_order_date',
      header: 'Oxirgi buyurtma',
      render: (value: unknown) => (
        <span className="text-sm text-slate-400">{formatDate(value as string)}</span>
      ),
    },
    {
      key: 'lifespan_days',
      header: 'Faollik davri',
      align: 'center' as const,
      render: (value: unknown) => {
        const days = Number(value) || 0;
        let colorClass = 'text-red-400';
        if (days >= 365) colorClass = 'text-green-400';
        else if (days >= 180) colorClass = 'text-blue-400';
        else if (days >= 90) colorClass = 'text-yellow-400';
        return (
          <div className="flex items-center justify-center gap-1">
            <span className={cn('font-medium', colorClass)}>{days}</span>
            <span className="text-xs text-slate-500">kun</span>
          </div>
        );
      },
    },
    {
      key: 'avg_days_between_orders',
      header: "O'rtacha interval",
      align: 'center' as const,
      render: (value: unknown) => {
        const days = Math.round(Number(value) || 0);
        return (
          <div className="flex items-center justify-center gap-1">
            <span className="font-medium">{days}</span>
            <span className="text-xs text-slate-500">kun</span>
          </div>
        );
      },
    },
    {
      key: 'original_buyer_type',
      header: 'Xaridor turi',
      align: 'center' as const,
      render: (value: unknown) => {
        const type = value as string;
        let variant: 'success' | 'warning' | 'info' | 'danger' = 'info';
        if (type?.includes('Frequent')) variant = 'success';
        else if (type?.includes('Regular')) variant = 'info';
        else if (type?.includes('Occasional')) variant = 'warning';
        else if (type?.includes('One-Time')) variant = 'danger';
        return (
          <Badge variant={variant}>
            {type || 'N/A'}
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
      <div>
        <h1 className={cn(
          'text-2xl font-bold',
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          Mijoz Retention Tahlili
        </h1>
        <p className={cn(
          'text-sm mt-1',
          theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
        )}>
          Mijozlarni saqlab qolish va qayta xarid tahlili
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <Users className="text-primary-500" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Jami mijozlar
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {stats.totalCustomers}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <UserCheck className="text-green-500" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Qayta xaridorlar
              </p>
              <p className="text-xl font-bold text-green-500">
                {stats.repeatCustomers}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <UserX className="text-yellow-500" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Bir martali
              </p>
              <p className="text-xl font-bold text-yellow-500">
                {stats.oneTimeCustomers}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="text-blue-500" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Retention rate
              </p>
              <p className="text-xl font-bold text-blue-500">
                {stats.retentionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Calendar className="text-purple-500" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                O'rtacha faollik
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {stats.avgLifespan} kun
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Clock className="text-orange-500" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                O'rtacha interval
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {stats.avgOrderFrequency} kun
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className={cn(
            'text-lg font-semibold mb-4',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Xaridor turi taqsimoti
          </h3>
          {loading ? (
            <div className="h-75 skeleton rounded-lg" />
          ) : buyerTypeDistribution.length > 0 ? (
            <PieChart data={buyerTypeDistribution} donut height={300} showLabels />
          ) : (
            <div className="h-75 flex items-center justify-center text-slate-400">
              Ma'lumot topilmadi
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className={cn(
            'text-lg font-semibold mb-4',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Faollik davri taqsimoti
          </h3>
          {loading ? (
            <div className="h-75 skeleton rounded-lg" />
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
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className={cn(
            'text-lg font-semibold',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Retention ko'rsatkichi
          </h3>
          <span className="text-2xl font-bold text-green-500">
            {stats.retentionRate.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-1000"
            style={{ width: `${stats.retentionRate}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className="text-slate-400">
            {stats.repeatCustomers} qayta xaridorlar
          </span>
          <span className="text-slate-400">
            {stats.oneTimeCustomers} bir martali
          </span>
        </div>
      </Card>

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
              Faollik davri va buyurtmalar tarixi
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success">Frequent</Badge>
            <Badge variant="info">Regular</Badge>
            <Badge variant="warning">Occasional</Badge>
          </div>
        </div>
        <Table
          columns={columns}
          data={data || []}
          loading={loading}
        />
      </Card>
    </div>
  );
}
