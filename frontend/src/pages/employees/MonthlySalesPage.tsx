import { useState, useMemo } from 'react';
import { TrendingUp, DollarSign, Package, Users, ArrowLeft, Calendar } from 'lucide-react';
import { Card, Table, ErrorState } from '@/components/ui';
import { BarChart, LineChart } from '@/components/charts';
import { useTheme } from '@/contexts';
import { useMonthlySales } from '@/hooks';
import { cn } from '@/utils/helpers';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';
import type { EmployeeMonthlySales } from '@/types';

const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

export function MonthlySalesPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data, loading, error, refetch } = useMonthlySales();

  // Get unique years from data
  const availableYears = useMemo(() => {
    if (!data) return [];
    const years = [...new Set(data.map(item => item.order_year))];
    return years.sort((a, b) => b - a); // Sort descending
  }, [data]);

  // Default to first available year
  const [year, setYear] = useState<number | null>(null);
  const selectedYear = year ?? availableYears[0] ?? 2008;

  // Filter data by selected year
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(item => item.order_year === selectedYear);
  }, [data, selectedYear]);

  // Top employees by total sales for selected year
  const employeeTotals = useMemo(() => {
    if (!filteredData.length) return [];
    return Object.entries(
      filteredData.reduce((acc, item) => {
        const name = item.employee_name;
        acc[name] = (acc[name] || 0) + item.monthly_revenue;
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [filteredData]);

  // Summary stats
  const totalSales = employeeTotals.reduce((sum, e) => sum + e.total, 0);
  const totalOrders = filteredData.reduce((sum, e) => sum + e.total_orders, 0);
  const avgOrderValue = filteredData.length
    ? filteredData.reduce((sum, e) => sum + e.avg_order_value, 0) / filteredData.length
    : 0;

  // Monthly trend data
  const monthlyTrend = useMemo(() => {
    return MONTHS.map((name, idx) => ({
      name,
      total: filteredData
        .filter(d => d.order_month === idx + 1)
        .reduce((sum, d) => sum + d.monthly_revenue, 0),
    }));
  }, [filteredData]);

  const columns = [
    {
      key: 'employee_id',
      header: 'ID',
      width: '8%',
      align: 'center' as const,
      render: (value: unknown) => (
        <span className="text-sm font-mono text-gray-500">#{value as number}</span>
      ),
    },
    {
      key: 'employee_name',
      header: 'Xodim',
      width: '20%',
      render: (value: unknown, row: EmployeeMonthlySales) => (
        <div>
          <span className="font-semibold text-gray-900 dark:text-white">{value as string}</span>
          <p className="text-xs text-gray-500">{row.title}</p>
        </div>
      ),
    },
    {
      key: 'order_month',
      header: 'Oy',
      width: '12%',
      align: 'center' as const,
      render: (value: unknown) => (
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
          {MONTHS[(value as number) - 1]}
        </span>
      ),
    },
    {
      key: 'total_orders',
      header: 'Buyurtmalar',
      width: '12%',
      align: 'center' as const,
      render: (value: unknown) => (
        <span className="font-medium">{formatNumber(value as number)}</span>
      ),
    },
    {
      key: 'monthly_revenue',
      header: 'Savdo',
      width: '18%',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="font-bold text-emerald-500">
          {formatCurrency(value as number)}
        </span>
      ),
    },
    {
      key: 'avg_order_value',
      header: "O'rtacha buyurtma",
      width: '15%',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="text-gray-600 dark:text-gray-300">
          {formatCurrency(value as number)}
        </span>
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
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
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
        </div>
        
        {/* Year selector from database */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select 
            value={selectedYear}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 p-2 min-w-[100px]"
          >
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <DollarSign className="text-emerald-600" size={20} />
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
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
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
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
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
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
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
            Xodimlar reytingi ({selectedYear})
          </h3>
          {loading ? (
            <div className="h-[320px] skeleton rounded-lg" />
          ) : employeeTotals.length === 0 ? (
            <div className="h-[320px] flex items-center justify-center text-gray-500">
              Bu yil uchun ma'lumot yo'q
            </div>
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
            Oylik trend ({selectedYear})
          </h3>
          {loading ? (
            <div className="h-80 skeleton rounded-lg" />
          ) : (
            <LineChart
              data={monthlyTrend}
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
          'px-6 py-4 border-b flex items-center justify-between',
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        )}>
          <div>
            <h3 className={cn(
              'text-lg font-semibold',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Batafsil ma'lumotlar
            </h3>
            <p className="text-sm text-gray-500">{filteredData.length} yozuv</p>
          </div>
        </div>
        <Table<EmployeeMonthlySales>
          columns={columns}
          data={filteredData}
          loading={loading}
          emptyMessage="Bu yil uchun ma'lumot topilmadi"
        />
      </Card>
    </div>
  );
}
