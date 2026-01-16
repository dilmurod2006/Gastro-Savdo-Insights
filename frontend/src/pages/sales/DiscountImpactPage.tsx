
import { Percent, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { Card, Table, Badge, ErrorState } from '@/components/ui';
import { PieChart } from '@/components/charts';
import { useTheme } from '@/contexts';
import { useDiscountImpact } from '@/hooks';
import { cn } from '@/utils/helpers';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/formatters';
import type { DiscountImpact } from '@/types';

export function DiscountImpactPage() {
  const { theme } = useTheme();
  const { data, loading, error, refetch } = useDiscountImpact();

  // Summary
  const withDiscount = data?.find((d) => d.has_discount);
  const withoutDiscount = data?.find((d) => !d.has_discount);

  const pieData = data?.map((d) => ({
    name: d.has_discount ? 'Chegirmali' : 'Chegirmasiz',
    value: d.total_revenue,
    color: d.has_discount ? '#f59e0b' : '#10b981',
  })) || [];

  const columns = [
    {
      key: 'has_discount',
      header: 'Turi',
      render: (value: unknown) => (
        <Badge variant={value ? 'warning' : 'success'}>
          {value ? 'Chegirmali' : 'Chegirmasiz'}
        </Badge>
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
      header: "O'rtacha buyurtma",
      align: 'right' as const,
      render: (value: unknown) => formatCurrency(value as number),
    },
    {
      key: 'total_discount_given',
      header: 'Chegirma summasi',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="text-orange-600">
          {formatCurrency(value as number)}
        </span>
      ),
    },
    {
      key: 'avg_discount_percent',
      header: "O'rtacha chegirma %",
      align: 'center' as const,
      render: (value: unknown) => formatPercent(value as number),
    },
  ];

  if (error) {
    return <ErrorState onRetry={refetch} />;
  }

  const totalRevenue = (withDiscount?.total_revenue || 0) + (withoutDiscount?.total_revenue || 0);
  const totalDiscount = withDiscount?.total_discount_given || 0;
  const discountPercent = totalRevenue ? (totalDiscount / totalRevenue) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className={cn(
          'text-2xl font-bold',
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          Chegirma Ta'siri
        </h1>
        <p className={cn(
          'text-sm mt-1',
          theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
        )}>
          Chegirmalarning savdoga ta'siri tahlili
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
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Percent className="text-orange-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Jami chegirma
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {formatCurrency(totalDiscount)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <ShoppingCart className="text-blue-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Chegirmali buyurtmalar
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {formatNumber(withDiscount?.total_orders || 0)}
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
                Chegirma ulushi
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {formatPercent(discountPercent)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <h3 className={cn(
              'text-lg font-semibold',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Chegirmali buyurtmalar
            </h3>
          </div>
        {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-8 rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>
                  Buyurtmalar soni
                </span>
                <span className={cn('font-semibold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  {formatNumber(withDiscount?.total_orders || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>
                  Jami daromad
                </span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(withDiscount?.total_revenue || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>
                  O'rtacha buyurtma
                </span>
                <span className={cn('font-semibold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  {formatCurrency(withDiscount?.avg_order_value || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>
                  O'rtacha chegirma
                </span>
                <span className="font-semibold text-orange-600">
                  {formatPercent(withDiscount?.avg_discount_percent || 0)}
                </span>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <h3 className={cn(
              'text-lg font-semibold',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Chegirmasiz buyurtmalar
            </h3>
          </div>
        {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-8 rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>
                  Buyurtmalar soni
                </span>
                <span className={cn('font-semibold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  {formatNumber(withoutDiscount?.total_orders || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>
                  Jami daromad
                </span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(withoutDiscount?.total_revenue || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>
                  O'rtacha buyurtma
                </span>
                <span className={cn('font-semibold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  {formatCurrency(withoutDiscount?.avg_order_value || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>
                  O'rtacha chegirma
                </span>
                <span className={cn('font-semibold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  0%
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Chart */}
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
        <Table<DiscountImpact>
          columns={columns}
          data={data || []}
          loading={loading}
        />
      </Card>
    </div>
  );
}
