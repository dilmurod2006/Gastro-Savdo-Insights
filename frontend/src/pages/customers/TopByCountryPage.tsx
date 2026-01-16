
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

  // Professional PieChart: TOP 6 + "Boshqalar" guruhi
  const pieChartData = (() => {
    if (!data || data.length === 0) return [];
    
    // Sort by revenue descending
    const sorted = [...data].sort((a, b) => b.total_revenue - a.total_revenue);
    
    if (sorted.length <= 7) {
      return sorted.map((item, index) => ({
        name: item.country,
        value: item.total_revenue,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }));
    }
    
    // TOP 6 + Others
    const top6 = sorted.slice(0, 6);
    const others = sorted.slice(6);
    const othersTotal = others.reduce((sum, item) => sum + item.total_revenue, 0);
    
    return [
      ...top6.map((item, index) => ({
        name: item.country,
        value: item.total_revenue,
        color: CHART_COLORS[index % CHART_COLORS.length],
      })),
      {
        name: `Boshqalar (${others.length})`,
        value: othersTotal,
        color: '#6B7280', // Gray for others
      }
    ];
  })();

  const barData = data?.slice(0, 10).map((item) => ({
    name: item.country,
    revenue: item.total_revenue,
    customers: item.customer_count,
  })) || [];

  // Top stats
  const totalRevenue = data?.reduce((sum, c) => sum + c.total_revenue, 0) || 0;
  const totalCustomers = data?.reduce((sum, c) => sum + c.customer_count, 0) || 0;
  const totalOrders = data?.reduce((sum, c) => sum + c.total_orders, 0) || 0;

  // Add revenue share percentage to data
  const enrichedData = data?.map((item, index) => ({
    ...item,
    revenue_share: totalRevenue > 0 ? (item.total_revenue / totalRevenue) * 100 : 0,
    rank: index + 1,
  })) || [];

  const columns = [
    {
      key: 'rank',
      header: '#',
      width: '50px',
      align: 'center' as const,
      render: (value: unknown) => (
        <span className="text-xs font-bold text-slate-400">{value as number}</span>
      ),
    },
    {
      key: 'country',
      header: 'Mamlakat',
      render: (value: unknown, row: unknown) => {
        const item = row as typeof enrichedData[0];
        return (
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-primary-500" />
            <span className="font-medium">{value as string}</span>
          </div>
        );
      },
    },
    {
      key: 'top_customer',
      header: 'Eng yaxshi mijoz',
      render: (value: unknown) => (
        <span className="text-sm text-slate-300">{value as string}</span>
      ),
    },
    {
      key: 'total_orders',
      header: 'Buyurtmalar',
      align: 'center' as const,
      render: (value: unknown) => (
        <span className="font-medium">{formatNumber(value as number)}</span>
      ),
    },
    {
      key: 'total_revenue',
      header: 'Jami daromad',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="font-semibold text-green-500">
          {formatCurrency(value as number)}
        </span>
      ),
    },
    {
      key: 'avg_order_value',
      header: "O'rtacha buyurtma",
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="text-slate-300">{formatCurrency(value as number)}</span>
      ),
    },
    {
      key: 'revenue_share',
      header: 'Ulushi',
      align: 'right' as const,
      render: (value: unknown) => {
        const percent = Number(value);
        let colorClass = 'text-slate-400';
        if (percent >= 15) colorClass = 'text-green-400 font-semibold';
        else if (percent >= 10) colorClass = 'text-blue-400 font-medium';
        else if (percent >= 5) colorClass = 'text-yellow-400';
        
        return (
          <div className="flex items-center justify-end gap-2">
            <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
            <span className={colorClass}>{percent.toFixed(1)}%</span>
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
          Har Bir Mamlakat Bo'yicha Eng Yaxshi Mijoz
        </h1>
        <p className={cn(
          'text-sm mt-1',
          theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
        )}>
          Har bir davlat bo'yicha eng ko'p xarid qilgan mijozlar tahlili
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
                TOP mijozlar
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {data?.length || 0}
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
            <div className="h-75 skeleton rounded-lg" />
          ) : (
            <PieChart data={pieChartData} donut height={300} showLabels />
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
          'px-6 py-4 border-b flex items-center justify-between',
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        )}>
          <div>
            <h3 className={cn(
              'text-lg font-semibold',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Barcha mamlakatlar
            </h3>
            <p className={cn(
              'text-sm mt-0.5',
              theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
            )}>
              Har bir mamlakat uchun eng yaxshi mijoz va daromad ulushi
            </p>
          </div>
          <div className={cn(
            'text-right',
            theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
          )}>
            <p className="text-xs">Jami mamlakatlar</p>
            <p className="text-xl font-bold text-primary-500">{enrichedData.length}</p>
          </div>
        </div>
        <Table
          columns={columns}
          data={enrichedData}
          loading={loading}
        />
      </Card>
    </div>
  );
}
