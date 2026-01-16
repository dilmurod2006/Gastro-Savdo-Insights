import { Globe, Tag, DollarSign, ShoppingCart } from 'lucide-react';
import { Card, Table, ErrorState } from '@/components/ui';
import { BarChart, PieChart, Treemap } from '@/components/charts';
import { useTheme } from '@/contexts';
import { useCountryBreakdown } from '@/hooks';
import { cn } from '@/utils/helpers';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/formatters';
import { CHART_COLORS } from '@/utils/constants';
import type { CategoryCountryBreakdown } from '@/types';

export function CountryBreakdownPage() {
  const { theme } = useTheme();
  const { data, loading, error, refetch } = useCountryBreakdown();

  // Group by category for treemap
  const categoryGroups = data
    ? Object.entries(
        data.reduce<Record<string, number>>((acc, d) => {
          if (!acc[d.category_name]) acc[d.category_name] = 0;
          acc[d.category_name] += d.total_revenue;
          return acc;
        }, {})
      )
        .map(([name, value], idx) => ({
          name,
          value,
          color: CHART_COLORS[idx % CHART_COLORS.length],
        }))
        .sort((a, b) => b.value - a.value)
    : [];

  // Group by country
  const countryGroups = data
    ? Object.entries(
        data.reduce<Record<string, number>>((acc, d) => {
          if (!acc[d.country]) acc[d.country] = 0;
          acc[d.country] += d.total_revenue;
          return acc;
        }, {})
      )
        .map(([name, value], idx) => ({
          name,
          value,
          color: CHART_COLORS[idx % CHART_COLORS.length],
        }))
        .sort((a, b) => b.value - a.value)
    : [];

  // Summary
  const totalRevenue = data?.reduce((sum: number, d) => sum + d.total_revenue, 0) || 0;
  const totalOrders = data?.reduce((sum: number, d) => sum + d.order_count, 0) || 0;
  const uniqueCategories = new Set(data?.map((d) => d.category_name) || []).size;
  const uniqueCountries = new Set(data?.map((d) => d.country) || []).size;

  const tableColumns = [
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
      key: 'country',
      header: 'Mamlakat',
      render: (value: unknown) => (
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-blue-500" />
          <span>{value as string}</span>
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
      key: 'category_percentage',
      header: 'Kat. ulushi',
      align: 'center' as const,
      render: (value: unknown) => (
        <div className="flex items-center gap-2 justify-center">
          <div className="w-12 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full"
              style={{ width: `${value as number}%` }}
            />
          </div>
          <span className="text-xs">{formatPercent(value as number)}</span>
        </div>
      ),
    },
    {
      key: 'country_percentage',
      header: 'Mam. ulushi',
      align: 'center' as const,
      render: (value: unknown) => (
        <div className="flex items-center gap-2 justify-center">
          <div className="w-12 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${value as number}%` }}
            />
          </div>
          <span className="text-xs">{formatPercent(value as number)}</span>
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
      <div>
        <h1 className={cn(
          'text-2xl font-bold',
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          Mamlakat bo'yicha Kategoriyalar
        </h1>
        <p className={cn(
          'text-sm mt-1',
          theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
        )}>
          Geografik joylashuv bo'yicha kategoriya tahlili
        </p>
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
                {uniqueCategories}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Globe className="text-blue-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Mamlakatlar
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {uniqueCountries}
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
              <ShoppingCart className="text-purple-600" size={20} />
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
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className={cn(
            'text-lg font-semibold mb-4',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Kategoriyalar taqsimoti
          </h3>
          {loading ? (
            <div className="h-[300px] skeleton rounded-lg" />
          ) : (
            <PieChart data={categoryGroups.slice(0, 8)} donut height={300} />
          )}
        </Card>

        <Card className="p-6">
          <h3 className={cn(
            'text-lg font-semibold mb-4',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Mamlakatlar taqsimoti
          </h3>
          {loading ? (
            <div className="h-[300px] skeleton rounded-lg" />
          ) : (
            <BarChart
              data={countryGroups.slice(0, 10)}
              xKey="name"
              yKey="value"
              horizontal
              colorByValue
              height={300}
            />
          )}
        </Card>
      </div>

      {/* Treemap */}
      <Card className="p-6">
        <h3 className={cn(
          'text-lg font-semibold mb-4',
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          Daromad xaritasi
        </h3>
        {loading ? (
          <div className="h-[300px] skeleton rounded-lg" />
        ) : (
          <Treemap data={categoryGroups} height={300} />
        )}
      </Card>

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
        <Table<CategoryCountryBreakdown>
          columns={tableColumns}
          data={data || []}
          loading={loading}
        />
      </Card>
    </div>
  );
}
