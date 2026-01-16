
import { Globe, DollarSign, Users, ShoppingCart } from 'lucide-react';
import { Card, Table, ErrorState } from '@/components/ui';
import { BarChart, PieChart } from '@/components/charts';
import { useTheme } from '@/contexts';
import { useTopByCountry } from '@/hooks';
import { cn } from '@/utils/helpers';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { CHART_COLORS } from '@/utils/constants';
import type { TopCustomerByCountry } from '@/types';

export function TopByCountryPage() {
  const { theme } = useTheme();
  const { data, loading, error, refetch } = useTopByCountry();

  const chartData = data?.map((item, index) => ({
    name: item.country,
    value: item.total_revenue,
    color: CHART_COLORS[index % CHART_COLORS.length],
  })) || [];

  const barData = data?.slice(0, 10).map((item) => ({
    name: item.country,
    revenue: item.total_revenue,
    customers: item.customer_count,
  })) || [];

  // Top stats
  const totalRevenue = data?.reduce((sum, c) => sum + c.total_revenue, 0) || 0;
  const totalCustomers = data?.reduce((sum, c) => sum + c.customer_count, 0) || 0;
  const totalOrders = data?.reduce((sum, c) => sum + c.total_orders, 0) || 0;

  const columns = [
    {
      key: 'country',
      header: 'Mamlakat',
      render: (value: unknown) => (
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-primary-500" />
          <span className="font-medium">{value as string}</span>
        </div>
      ),
    },
    {
      key: 'customer_count',
      header: 'Mijozlar',
      align: 'center' as const,
      render: (value: unknown) => formatNumber(value as number),
    },
    {
      key: 'total_orders',
      header: 'Buyurtmalar',
      align: 'center' as const,
      render: (value: unknown) => formatNumber(value as number),
    },
    {
      key: 'total_revenue',
      header: 'Jami daromad',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(value as number)}
        </span>
      ),
    },
    {
      key: 'avg_order_value',
      header: "O'rtacha buyurtma",
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
      <div>
        <h1 className={cn(
          'text-2xl font-bold',
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          Mamlakatlar bo'yicha Mijozlar
        </h1>
        <p className={cn(
          'text-sm mt-1',
          theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
        )}>
          Geografik joylashuv bo'yicha mijoz tahlili
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Globe className="text-primary-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Mamlakatlar
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
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Users className="text-purple-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Jami mijozlar
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {formatNumber(totalCustomers)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <ShoppingCart className="text-orange-600" size={20} />
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
            Daromad taqsimoti
          </h3>
          {loading ? (
            <div className="h-[300px] skeleton rounded-lg" />
          ) : (
            <PieChart data={chartData} donut height={300} />
          )}
        </Card>

        <Card className="p-6">
          <h3 className={cn(
            'text-lg font-semibold mb-4',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            TOP 10 mamlakatlar
          </h3>
          {loading ? (
            <div className="h-[300px] skeleton rounded-lg" />
          ) : (
            <BarChart
              data={barData}
              xKey="name"
              yKey="revenue"
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
            Barcha mamlakatlar
          </h3>
        </div>
        <Table<TopCustomerByCountry>
          columns={columns}
          data={data || []}
          loading={loading}
        />
      </Card>
    </div>
  );
}
