
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { Card, Table, Badge, ErrorState } from '@/components/ui';
import { BarChart, LineChart } from '@/components/charts';
import { useTheme } from '@/contexts';
import { useYoYGrowth } from '@/hooks';
import { cn } from '@/utils/helpers';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import type { YoYGrowth } from '@/types';

const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

export function YoYGrowthPage() {
  const { theme } = useTheme();
  const { data, loading, error, refetch } = useYoYGrowth();

  // Process chart data
  const chartData = data?.map((d) => ({
    name: MONTHS[d.month - 1],
    year: d.year,
    current: d.current_year_sales,
    previous: d.previous_year_sales,
    growth: d.growth_rate || 0,
  })) || [];

  // Growth rate chart
  const growthRates = data?.slice(-12).map((d) => ({
    name: `${d.year}/${MONTHS[d.month - 1]}`,
    value: d.growth_rate || 0,
    positive: (d.growth_rate || 0) >= 0,
  })) || [];

  // Summary stats
  const latestPeriod = data?.[data.length - 1];
  const avgGrowth = data?.length
    ? data.filter((d) => d.growth_rate !== null).reduce((s, d) => s + (d.growth_rate || 0), 0) / data.filter((d) => d.growth_rate !== null).length
    : 0;

  const totalCurrentYear = data?.reduce((sum, d) => sum + d.current_year_sales, 0) || 0;

  const columns = [
    {
      key: 'year',
      header: 'Yil',
      render: (value: unknown) => (
        <span className="font-semibold">{value as number}</span>
      ),
    },
    {
      key: 'month',
      header: 'Oy',
      align: 'center' as const,
      render: (value: unknown) => MONTHS[(value as number) - 1],
    },
    {
      key: 'current_year_sales',
      header: 'Joriy yil',
      align: 'right' as const,
      render: (value: unknown) => formatCurrency(value as number),
    },
    {
      key: 'previous_year_sales',
      header: 'Oldingi yil',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="text-gray-500">
          {value ? formatCurrency(value as number) : '-'}
        </span>
      ),
    },
    {
      key: 'absolute_difference',
      header: 'Farq',
      align: 'right' as const,
      render: (value: unknown) => {
        if (value === null) return '-';
        const diff = value as number;
        return (
          <span className={diff >= 0 ? 'text-green-600' : 'text-red-600'}>
            {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
          </span>
        );
      },
    },
    {
      key: 'growth_rate',
      header: "O'sish",
      align: 'center' as const,
      render: (value: unknown) => {
        if (value === null) return '-';
        const growth = value as number;
        const isPositive = growth >= 0;
        return (
          <div className="flex items-center justify-center gap-1">
            {isPositive ? (
              <TrendingUp size={14} className="text-green-600" />
            ) : (
              <TrendingDown size={14} className="text-red-600" />
            )}
            <Badge variant={isPositive ? 'success' : 'danger'}>
              {isPositive ? '+' : ''}{formatPercent(growth)}
            </Badge>
          </div>
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
          Yillik O'sish Tahlili (YoY)
        </h1>
        <p className={cn(
          'text-sm mt-1',
          theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
        )}>
          Yilma-yil savdo dinamikasi
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
                Joriy yil savdosi
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {formatCurrency(totalCurrentYear)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              avgGrowth >= 0
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
            )}>
              {avgGrowth >= 0 ? (
                <TrendingUp className="text-green-600" size={20} />
              ) : (
                <TrendingDown className="text-red-600" size={20} />
              )}
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                O'rtacha o'sish
              </p>
              <p className={cn(
                'text-xl font-bold',
                avgGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {avgGrowth >= 0 ? '+' : ''}{formatPercent(avgGrowth)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Percent className="text-blue-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Oxirgi oy o'sishi
              </p>
              <p className={cn(
                'text-xl font-bold',
                (latestPeriod?.growth_rate || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {latestPeriod?.growth_rate != null
                  ? `${latestPeriod.growth_rate >= 0 ? '+' : ''}${formatPercent(latestPeriod.growth_rate)}`
                  : '-'}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Davrlar
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {data?.length || 0}
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
            Savdo trendi
          </h3>
          {loading ? (
            <div className="h-75 skeleton rounded-lg" />
          ) : (
            <LineChart
              data={chartData.slice(-24)}
              xKey="name"
              lines={[{ dataKey: 'current', color: '#3b82f6', name: 'Joriy yil' }]}
              height={300}
            />
          )}
        </Card>

        <Card className="p-6">
          <h3 className={cn(
            'text-lg font-semibold mb-4',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            O'sish darajasi
          </h3>
          {loading ? (
            <div className="h-75 skeleton rounded-lg" />
          ) : (
            <BarChart
              data={growthRates}
              xKey="name"
              yKey="value"
              formatAsAmount={false}
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
        <Table<YoYGrowth>
          columns={columns}
          data={data || []}
          loading={loading}
        />
      </Card>
    </div>
  );
}
