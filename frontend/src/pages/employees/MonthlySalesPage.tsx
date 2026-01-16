import { useState } from 'react';
import { TrendingUp, DollarSign, Package, Users } from 'lucide-react';
import { Card, Table, Select, ErrorState } from '@/components/ui';
import { BarChart, LineChart } from '@/components/charts';
import { useTheme } from '@/contexts';
import { useMonthlySales } from '@/hooks';
import { cn } from '@/utils/helpers';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import type { EmployeeMonthlySales } from '@/types';

const YEAR_OPTIONS = [
  { value: 2024, label: '2024' },
  { value: 2023, label: '2023' },
  { value: 2022, label: '2022' },
  { value: 2021, label: '2021' },
];

const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

export function MonthlySalesPage() {
  const { theme } = useTheme();
  const [year, setYear] = useState(2024);
  const { data, loading, error, refetch } = useMonthlySales();

  // Top employees by total sales
  const employeeTotals = data
    ? Object.entries(
        data.reduce((acc, item) => {
          const name = `${item.first_name} ${item.last_name}`;
          acc[name] = (acc[name] || 0) + item.total_sales;
          return acc;
        }, {} as Record<string, number>)
      )
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
    : [];

  const totalSales = employeeTotals.reduce((sum, e) => sum + e.total, 0);
  const totalOrders = data?.reduce((sum, e) => sum + e.total_orders, 0) || 0;
  const avgOrderValue = data?.length
    ? data.reduce((sum, e) => sum + e.avg_order_value, 0) / data.length
    : 0;

  const columns = [
    {
      key: 'employee_id',
      header: 'ID',
      render: (value: unknown) => (
        <span className="text-sm font-mono">#{value as number}</span>
      ),
    },
    {
      key: 'first_name',
      header: 'Xodim',
      render: (_value: unknown, row: EmployeeMonthlySales) => (
        <span className="font-medium">{`${row.first_name} ${row.last_name}`}</span>
      ),
    },
    {
      key: 'month',
      header: 'Oy',
      align: 'center' as const,
      render: (value: unknown) => MONTHS[(value as number) - 1],
    },
    {
      key: 'total_orders',
      header: 'Buyurtmalar',
      align: 'center' as const,
      render: (value: unknown) => formatNumber(value as number),
    },
    {
      key: 'total_sales',
      header: 'Savdo',
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={cn(
            'text-2xl font-bold',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Oylik Savdo Natijalari
          </h1>
          <p className={cn(
            'text-sm mt-1',
            theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
          )}>
            Xodimlar savdo ko'rsatkichlari
          </p>
        </div>
        <Select
          options={YEAR_OPTIONS}
          value={year}
          onChange={(v) => setYear(Number(v))}
          className="w-32"
        />
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
                Jami savdo
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {formatCurrency(totalSales)}
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
                Buyurtmalar
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
              <TrendingUp className="text-purple-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                O'rtacha buyurtma
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {formatCurrency(avgOrderValue)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Users className="text-orange-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Xodimlar
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {employeeTotals.length}
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
            Xodimlar reytingi
          </h3>
          {loading ? (
            <div className="h-[320px] skeleton rounded-lg" />
          ) : (
            <BarChart
              data={employeeTotals.slice(0, 10).map((e) => ({
                name: e.name.split(' ')[0],
                value: e.total,
              }))}
              xKey="name"
              yKey="value"
              colorByValue
              height={320}
            />
          )}
        </Card>

        <Card className="p-6">
          <h3 className={cn(
            'text-lg font-semibold mb-4',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Oylik trend
          </h3>
          {loading ? (
            <div className="h-80 skeleton rounded-lg" />
          ) : (
            <LineChart
              data={MONTHS.map((name, idx) => ({
                name,
                total: data
                  ?.filter((d) => d.month === idx + 1)
                  .reduce((sum, d) => sum + d.total_sales, 0) || 0,
              }))}
              xKey="name"
              lines={[{ dataKey: 'total', color: '#3b82f6', name: 'Jami savdo' }]}
              height={320}
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
        <Table<EmployeeMonthlySales>
          columns={columns}
          data={data || []}
          loading={loading}
        />
      </Card>
    </div>
  );
}
