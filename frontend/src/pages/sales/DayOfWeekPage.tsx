
import { Calendar, DollarSign, Package, TrendingUp } from 'lucide-react';
import { Card, Table, Badge, ErrorState } from '@/components/ui';
import { BarChart, RadarChart } from '@/components/charts';
import { useTheme } from '@/contexts';
import { useDayOfWeek } from '@/hooks';
import { cn } from '@/utils/helpers';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/formatters';
import type { DayOfWeekPattern } from '@/types';

const DAY_NAMES: Record<number, string> = {
  1: 'Dushanba',
  2: 'Seshanba',
  3: 'Chorshanba',
  4: 'Payshanba',
  5: 'Juma',
  6: 'Shanba',
  7: 'Yakshanba',
};

const DAY_SHORT: Record<number, string> = {
  1: 'Du',
  2: 'Se',
  3: 'Cho',
  4: 'Pa',
  5: 'Ju',
  6: 'Sha',
  7: 'Ya',
};

export function DayOfWeekPage() {
  const { theme } = useTheme();
  const { data, loading, error, refetch } = useDayOfWeek();

  // Normalize API data: parse numbers, fill missing days
  const apiData = (data || []).map((d) => ({
    day_of_week: d.day_of_week,
    day_name: d.day_name,
    total_orders: d.total_orders ?? d.order_count ?? 0,
    order_count: d.total_orders ?? d.order_count ?? 0,
    unique_customers: d.unique_customers ?? 0,
    total_revenue: typeof d.total_revenue === 'string' ? parseFloat(d.total_revenue) : (d.total_revenue ?? 0),
    avg_order_value: typeof d.avg_order_value === 'string' ? parseFloat(d.avg_order_value) : (d.avg_order_value ?? 0),
    order_percentage: typeof d.order_percentage === 'string' ? parseFloat(d.order_percentage) : (d.order_percentage ?? 0),
    percentage_of_total: typeof d.order_percentage === 'string' ? parseFloat(d.order_percentage) : (d.percentage_of_total ?? 0),
    revenue_rank: d.revenue_rank ?? 0,
  }));

  // Ensure all 7 days are present (1-7), fill missing with zeros
  const allDays = Array.from({ length: 7 }, (_, i) => i + 1);
  const sortedData = allDays.map((dow) =>
    apiData.find((d) => d.day_of_week === dow) || {
      day_of_week: dow,
      day_name: DAY_NAMES[dow],
      total_orders: 0,
      order_count: 0,
      unique_customers: 0,
      total_revenue: 0,
      avg_order_value: 0,
      order_percentage: 0,
      percentage_of_total: 0,
      revenue_rank: 0,
    }
  );

  // Chart data
  const barData = sortedData.map((d) => ({
    name: DAY_SHORT[d.day_of_week],
    fullName: DAY_NAMES[d.day_of_week],
    value: d.total_revenue,
    orders: d.order_count,
  }));

  const radarData = sortedData.map((d) => ({
    subject: DAY_SHORT[d.day_of_week],
    revenue: d.percentage_of_total,
  }));

  // Summary
  const totalRevenue = sortedData.reduce((sum, d) => sum + d.total_revenue, 0);
  const totalOrders = sortedData.reduce((sum, d) => sum + d.order_count, 0);
  // Find best and worst day (do not allow both to be the same day)
  let bestDay = sortedData[0];
  let worstDay = sortedData[0];
  sortedData.forEach((d) => {
    if (d.total_revenue > bestDay.total_revenue) bestDay = d;
    if (d.total_revenue < worstDay.total_revenue) worstDay = d;
  });
  // If best and worst are the same (all zeros), only show best
  const showWorst = bestDay.day_of_week !== worstDay.day_of_week;

  const columns = [
    {
      key: 'day_of_week',
      header: 'Kun',
      render: (value: unknown) => (
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold',
            theme === 'dark' ? 'bg-primary-900/30 text-primary-400' : 'bg-primary-100 text-primary-700'
          )}>
            {DAY_SHORT[value as number]}
          </div>
          <span className="font-medium">{DAY_NAMES[value as number]}</span>
        </div>
      ),
    },
    {
      key: 'order_count',
      header: 'Buyurtmalar',
      align: 'center' as const,
      render: (value: unknown) => formatNumber(value as number),
    },
    {
      key: 'total_revenue',
      header: 'Daromad',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(value as number)}
        </span>
      ),
    },
    {
      key: 'avg_order_value',
      header: "O'rtacha",
      align: 'right' as const,
      render: (value: unknown) => formatCurrency(value as number),
    },
    {
      key: 'percentage_of_total',
      header: 'Ulushi',
      align: 'center' as const,
      render: (value: unknown) => (
        <div className="flex items-center gap-2 justify-center">
          <div className="w-16 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full"
              style={{ width: `${value as number}%` }}
            />
          </div>
          <span className="text-sm">{formatPercent(value as number)}</span>
        </div>
      ),
    },
    {
      key: 'day_of_week',
      header: 'Status',
      align: 'center' as const,
      render: (_value: unknown, row: DayOfWeekPattern) => {
        const isBest = bestDay && row.day_of_week === bestDay.day_of_week;
        const isWorst = showWorst && worstDay && row.day_of_week === worstDay.day_of_week;
        if (isBest) return <Badge variant="success">Eng yaxshi</Badge>;
        if (isWorst) return <Badge variant="danger">Eng past</Badge>;
        return null;
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
          Hafta Kunlari Tahlili
        </h1>
        <p className={cn(
          'text-sm mt-1',
          theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
        )}>
          Savdo kunlar kesimida
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <DollarSign className="text-green-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Jami daromad
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Package className="text-blue-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Jami buyurtmalar
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {formatNumber(totalOrders)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Eng yaxshi kun
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {bestDay ? DAY_NAMES[bestDay.day_of_week] : '-'}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Calendar className="text-orange-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Eng past kun
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {worstDay ? DAY_NAMES[worstDay.day_of_week] : '-'}
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
            Kunlik daromad
          </h3>
          {loading ? (
            <div className="h-[300px] skeleton rounded-lg" />
          ) : (
            <BarChart
              data={barData}
              xKey="name"
              yKey="value"
              colorByValue
              height={300}
            />
          )}
        </Card>

        <Card className="p-6">
          <h3 className={cn(
            'text-lg font-semibold mb-4',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Haftalik profil
          </h3>
          {loading ? (
            <div className="h-75 skeleton rounded-lg" />
          ) : (
            <RadarChart
              data={radarData}
              angleKey="subject"
              radars={[{ dataKey: 'revenue', color: '#3b82f6', name: 'Savdo' }]}
              height={300}
            />
          )}
        </Card>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className={cn(
          'px-6 py-4 border-b',
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        )}>
          <h3 className={cn(
            'text-lg font-semibold',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Batafsil ma'lumotlar
          </h3>
        </div>
        <Table<DayOfWeekPattern>
          columns={columns}
          data={sortedData}
          loading={loading}
        />
      </Card>
    </div>
  );
}
