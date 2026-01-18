import { Building, DollarSign, Package, TrendingUp } from 'lucide-react';
import { Card, Table, ErrorState } from '@/components/ui';
import { BarChart, PieChart } from '@/components/charts';
import { useTheme } from '@/contexts';
import { useSupplierPerformance } from '@/hooks';
import { cn } from '@/utils/helpers';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/formatters';
import { CHART_COLORS } from '@/utils/constants';
import type { SupplierPerformance as SupplierPerformanceType } from '@/types';


export function PerformancePage() {
  const { theme } = useTheme();
  const { data, loading, error, refetch } = useSupplierPerformance(10); // default minOrders=10

  // Chart data
  const pieData = data?.slice(0, 8).map((d, idx) => ({
    name: (d.company_name || 'Noma\'lum').length > 20 ? (d.company_name || 'Noma\'lum').slice(0, 20) + '...' : (d.company_name || 'Noma\'lum'),
    value: d.total_revenue,
    color: CHART_COLORS[idx % CHART_COLORS.length],
  })) || [];

  const barData = data?.slice(0, 10).map((d) => ({
    name: (d.company_name || 'Noma\'lum').length > 15 ? (d.company_name || 'Noma\'lum').slice(0, 15) + '...' : (d.company_name || 'Noma\'lum'),
    value: d.total_revenue,
    products: d.product_count,
  })) || [];

  // Summary
  const totalRevenue = data?.reduce((sum, d) => sum + d.total_revenue, 0) || 0;
  const totalProducts = data?.reduce((sum, d) => sum + d.product_count, 0) || 0;
  const topSupplier = data?.[0];

  const columns = [
    {
      key: 'supplier_id',
      header: 'ID',
      render: (value: unknown) => (
        <span className="text-sm font-mono">#{value as number}</span>
      ),
    },
    {
      key: 'company_name',
      header: 'Kompaniya',
      render: (value: unknown) => (
        <div className="flex items-center gap-2">
          <Building size={14} className="text-primary-500" />
          <span className="font-medium">{value as string}</span>
        </div>
      ),
    },
    {
      key: 'contact_name',
      header: 'Aloqa',
      render: (value: unknown) => (value as string) || '-',
    },
    {
      key: 'country',
      header: 'Mamlakat',
    },
    {
      key: 'product_count',
      header: 'Mahsulotlar',
      align: 'center' as const,
      render: (value: unknown) => formatNumber(value as number),
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
      key: 'percentage_of_total',
      header: 'Ulushi',
      align: 'center' as const,
      render: (value: unknown) => (
        <div className="flex items-center gap-2 justify-center">
          <div className="w-14 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full"
              style={{ width: `${Math.min((value as number) * 5, 100)}%` }}
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={cn(
            'text-2xl font-bold',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Yetkazib beruvchilar Samaradorligi
          </h1>
          <p className={cn(
            'text-sm mt-1',
            theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
          )}>
            Ta'minotchilar bo'yicha savdo tahlili
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Building className="text-primary-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Yetkazib beruvchilar
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {data?.length || 0}
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
                Mahsulotlar
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {formatNumber(totalProducts)}
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
                Top ta'minotchi
              </p>
              <p className={cn('text-sm font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {topSupplier?.company_name || '-'}
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
            <div className="h-[300px] skeleton rounded-lg" />
          ) : (
            <PieChart data={pieData} donut height={300} />
          )}
        </Card>

        <Card className="p-6">
          <h3 className={cn(
            'text-lg font-semibold mb-4',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            TOP 10 ta'minotchilar
          </h3>
          {loading ? (
            <div className="h-[300px] skeleton rounded-lg" />
          ) : (
            <BarChart
              data={barData}
              xKey="name"
              yKey="value"
              horizontal
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
            Barcha ta'minotchilar
          </h3>
        </div>
        <Table<SupplierPerformanceType>
          columns={columns}
          data={data || []}
          loading={loading}
        />
      </Card>
    </div>
  );
}
