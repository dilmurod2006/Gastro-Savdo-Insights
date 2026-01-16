import { useState } from 'react';
import { MapPin, DollarSign, Package, Users } from 'lucide-react';
import { Card, Table, Select, ErrorState } from '@/components/ui';
import { BarChart, PieChart } from '@/components/charts';
import { useTheme } from '@/contexts';
import { useTerritoryPerformance } from '@/hooks';
import { cn } from '@/utils/helpers';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/formatters';
import { CHART_COLORS } from '@/utils/constants';
import type { TerritoryPerformance } from '@/types';

const YEAR_OPTIONS = [
  { value: '', label: 'Barcha yillar' },
  { value: 2024, label: '2024' },
  { value: 2023, label: '2023' },
  { value: 2022, label: '2022' },
];

export function TerritoryPage() {
  const { theme } = useTheme();
  const [year, setYear] = useState<number | ''>('');
  const { data, loading, error, refetch } = useTerritoryPerformance();

  // Chart data (safe checks)
  const pieData = Array.isArray(data)
    ? data.map((d, idx) => ({
        name: d.region,
        value: d.total_revenue,
        color: CHART_COLORS[idx % CHART_COLORS.length],
      }))
    : [];

  const barData = Array.isArray(data)
    ? data.slice(0, 10).map((d) => ({
        name: d.region.length > 15 ? d.region.slice(0, 15) + '...' : d.region,
        value: d.total_revenue,
      }))
    : [];

  // Summary
  const totalRevenue = Array.isArray(data)
    ? data.reduce((sum, d) => sum + d.total_revenue, 0)
    : 0;
  const totalOrders = Array.isArray(data)
    ? data.reduce((sum, d) => sum + d.total_orders, 0)
    : 0;
  const topTerritory = Array.isArray(data) && data.length > 0 ? data[0] : undefined;

  const columns = [
    {
      key: 'territory_id',
      header: 'ID',
      render: (value: unknown) => (
        <span className="text-sm font-mono">#{value as number}</span>
      ),
    },
    {
      key: 'region',
      header: 'Hudud',
      render: (value: unknown) => (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-primary-500" />
          <span className="font-medium">{value as string}</span>
        </div>
      ),
    },
    {
      key: 'total_orders',
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
              style={{ width: `${Math.min(value as number, 100)}%` }}
            />
          </div>
          <span className="text-sm">{formatPercent(value as number)}</span>
        </div>
      ),
    },
  ];

  if (error) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={cn(
            'text-2xl font-bold',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Hududiy Samaradorlik
          </h1>
          <p className={cn(
            'text-sm mt-1',
            theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
          )}>
            Savdo hududlari bo'yicha tahlil
          </p>
        </div>
        <Select
          options={YEAR_OPTIONS}
          value={year}
          onChange={(v) => setYear(v === '' ? '' : Number(v))}
          className="w-36"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <MapPin className="text-primary-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Hududlar
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {Array.isArray(data) ? data.length : 0}
              </p>
            </div>
          </div>
        </Card>
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
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Users className="text-purple-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Top hudud
              </p>
              <p className={cn('text-lg font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {topTerritory?.region || '-'}
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
            Daromad taqsimoti
          </h3>
          {loading ? (
            <div className="h-75 skeleton rounded-lg" />
          ) : (
            <PieChart data={pieData} donut height={300} />
          )}
        </Card>

        <Card className="p-6">
          <h3 className={cn(
            'text-lg font-semibold mb-4',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            TOP 10 hududlar
          </h3>
          {loading ? (
            <div className="h-75 skeleton rounded-lg" />
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
            Barcha hududlar
          </h3>
        </div>
        <Table<TerritoryPerformance>
          columns={columns}
          data={Array.isArray(data) ? data : []}
          loading={loading}
        />
      </Card>
    </div>
  );
}
