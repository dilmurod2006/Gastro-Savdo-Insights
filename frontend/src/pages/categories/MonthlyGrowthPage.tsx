import { useState } from 'react';
import { TrendingUp, TrendingDown, Tag, DollarSign } from 'lucide-react';
import { Card, Table, Badge, Select, ErrorState } from '@/components/ui';
import { AreaChart } from '@/components/charts';
import { useTheme } from '@/contexts';
import { useMonthlyGrowth } from '@/hooks';
import { cn } from '@/utils/helpers';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import { CHART_COLORS } from '@/utils/constants';
import type { CategoryMonthlyGrowth } from '@/types';

const YEAR_OPTIONS = [
  { value: '', label: 'Barcha yillar' },
  { value: 2024, label: '2024' },
  { value: 2023, label: '2023' },
  { value: 2022, label: '2022' },
];

const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

export function MonthlyGrowthPage() {
  const { theme } = useTheme();
  const [year, setYear] = useState<number | ''>('');
  const { data, loading, error, refetch } = useMonthlyGrowth();

  // Get unique categories
  const categories = data
    ? [...new Set(data.map((d) => d.category_name))]
    : [];

  // Monthly data for line chart
  const monthlyData = MONTHS.map((month, idx) => {
    const monthNum = idx + 1;
    const result: Record<string, unknown> = { name: month };
    categories.slice(0, 5).forEach((cat) => {
      const catData = data?.find((d) => d.category_name === cat && d.month === monthNum);
      result[cat] = catData?.monthly_revenue || 0;
    });
    return result;
  });

  // Category totals for summary
  const categoryTotals = categories.map((cat) => {
    const catData = data?.filter((d) => d.category_name === cat) || [];
    const total = catData.reduce((sum, d) => sum + d.monthly_revenue, 0);
    const avgGrowth = catData.length
      ? catData.filter((d) => d.growth_rate !== null).reduce((s, d) => s + (d.growth_rate || 0), 0) / catData.filter((d) => d.growth_rate !== null).length
      : 0;
    return { name: cat, total, avgGrowth };
  }).sort((a, b) => b.total - a.total);

  const topCategory = categoryTotals[0];
  const totalRevenue = categoryTotals.reduce((sum, c) => sum + c.total, 0);

  const columns = [
    {
      key: 'category_name',
      header: 'Kategoriya',
      render: (value: unknown) => (
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-primary-500" />
          <span className="font-medium">{value as string}</span>
        </div>
      ),
    },
    {
      key: 'month',
      header: 'Oy',
      align: 'center' as const,
      render: (value: unknown, row: CategoryMonthlyGrowth) => (
        <span>{`${MONTHS[(value as number) - 1]} ${row.year}`}</span>
      ),
    },
    {
      key: 'monthly_revenue',
      header: 'Daromad',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(value as number)}
        </span>
      ),
    },
    {
      key: 'previous_month_revenue',
      header: 'Oldingi oy',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="text-gray-500">
          {value ? formatCurrency(value as number) : '-'}
        </span>
      ),
    },
    {
      key: 'growth_rate',
      header: "O'sish",
      align: 'center' as const,
      render: (value: unknown) => {
        if (value === null || value === undefined) return '-';
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
    {
      key: 'running_total',
      header: "Jamlangan",
      align: 'right' as const,
      render: (value: unknown) => formatCurrency(value as number),
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
            Oylik O'sish Tahlili
          </h1>
          <p className={cn(
            'text-sm mt-1',
            theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
          )}>
            Kategoriyalar bo'yicha oylik dinamika
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
              <Tag className="text-primary-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Kategoriyalar
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {categories.length}
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
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Top kategoriya
              </p>
              <p className={cn('text-lg font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {topCategory?.name || '-'}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              (topCategory?.avgGrowth || 0) >= 0
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
            )}>
              {(topCategory?.avgGrowth || 0) >= 0 ? (
                <TrendingUp className="text-green-600" size={20} />
              ) : (
                <TrendingDown className="text-red-600" size={20} />
              )}
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Top o'sish
              </p>
              <p className={cn(
                'text-xl font-bold',
                (topCategory?.avgGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {topCategory ? formatPercent(topCategory.avgGrowth) : '-'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Line Chart */}
      <Card className="p-6">
        <h3 className={cn(
          'text-lg font-semibold mb-4',
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          Oylik trend (TOP 5)
        </h3>
        {loading ? (
          <div className="h-87.5 skeleton rounded-lg" />
        ) : (
          <AreaChart
            data={monthlyData}
            xKey="name"
            areas={categories.slice(0, 5).map((cat, idx) => ({
              dataKey: cat,
              name: cat,
              color: CHART_COLORS[idx % CHART_COLORS.length],
            }))}
            showLegend
            stacked
            height={350}
          />
        )}
      </Card>

      {/* Category Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryTotals.slice(0, 6).map((cat, idx) => (
          <Card key={cat.name} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                />
                <h4 className={cn(
                  'font-semibold',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {cat.name}
                </h4>
              </div>
              <Badge variant={cat.avgGrowth >= 0 ? 'success' : 'danger'}>
                {cat.avgGrowth >= 0 ? '+' : ''}{formatPercent(cat.avgGrowth)}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(cat.total)}
            </p>
            <div className="mt-2 w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(cat.total / totalRevenue) * 100}%`,
                  backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                }}
              />
            </div>
          </Card>
        ))}
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
        <Table<CategoryMonthlyGrowth>
          columns={columns}
          data={data || []}
          loading={loading}
        />
      </Card>
    </div>
  );
}
