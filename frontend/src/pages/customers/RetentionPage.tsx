
import { UserCheck, UserX, Calendar, DollarSign } from 'lucide-react';
import { Card, Table, Badge, ErrorState } from '@/components/ui';
import { PieChart, BarChart } from '@/components/charts';
import { useTheme } from '@/contexts';
import { useRetentionAnalysis } from '@/hooks';
import { cn } from '@/utils/helpers';
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters';
import type { RetentionCustomer } from '@/types';

export function RetentionPage() {
  const { theme } = useTheme();
  const { data, loading, error, refetch } = useRetentionAnalysis();

  // Calculate summary
  const oneTime = data?.filter((c) => c.buyer_type === 'one_time') || [];
  const repeat = data?.filter((c) => c.buyer_type === 'repeat') || [];

  const pieData = [
    { name: 'Qayta xaridorlar', value: repeat.length, color: '#10b981' },
    { name: 'Bir martali', value: oneTime.length, color: '#f59e0b' },
  ];

  // Lifespan distribution
  const lifespanGroups = data
    ? [
        { name: '0-30 kun', value: data.filter((c) => c.lifespan_days <= 30).length },
        { name: '31-90 kun', value: data.filter((c) => c.lifespan_days > 30 && c.lifespan_days <= 90).length },
        { name: '91-180 kun', value: data.filter((c) => c.lifespan_days > 90 && c.lifespan_days <= 180).length },
        { name: '181-365 kun', value: data.filter((c) => c.lifespan_days > 180 && c.lifespan_days <= 365).length },
        { name: '365+ kun', value: data.filter((c) => c.lifespan_days > 365).length },
      ]
    : [];

  const repeatRevenue = repeat.reduce((sum, c) => sum + c.total_revenue, 0);

  const columns = [
    {
      key: 'company_name',
      header: 'Kompaniya',
      render: (value: unknown) => (
        <span className="font-medium">{value as string}</span>
      ),
    },
    {
      key: 'country',
      header: 'Mamlakat',
    },
    {
      key: 'first_order_date',
      header: 'Birinchi buyurtma',
      render: (value: unknown) => formatDate(value as string),
    },
    {
      key: 'last_order_date',
      header: 'Oxirgi buyurtma',
      render: (value: unknown) => formatDate(value as string),
    },
    {
      key: 'lifespan_days',
      header: 'Faollik davri',
      align: 'center' as const,
      render: (value: unknown) => `${formatNumber(value as number)} kun`,
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
      render: (value: unknown) => formatCurrency(value as number),
    },
    {
      key: 'buyer_type',
      header: 'Turi',
      align: 'center' as const,
      render: (value: unknown) => (
        <Badge variant={value === 'repeat' ? 'success' : 'warning'}>
          {value === 'repeat' ? 'Qayta' : 'Bir martali'}
        </Badge>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <UserCheck className="text-green-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Qayta xaridorlar
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {repeat.length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <UserX className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Bir martali
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {oneTime.length}
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
                Qayta xarid daromadi
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {formatCurrency(repeatRevenue)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Calendar className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                O'rtacha lifespan
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {data ? Math.round(data.reduce((s, c) => s + c.lifespan_days, 0) / data.length) : 0} kun
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
            <div className="h-[280px] skeleton rounded-lg" />
          ) : (
            <PieChart data={pieData} donut height={280} />
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
            <div className="h-[280px] skeleton rounded-lg" />
          ) : (
            <BarChart
              data={lifespanGroups}
              xKey="name"
              yKey="value"
              formatAsAmount={false}
              height={280}
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
            Mijozlar ro'yxati
          </h3>
        </div>
        <Table<RetentionCustomer>
          columns={columns}
          data={data || []}
          loading={loading}
        />
      </Card>
    </div>
  );
}
