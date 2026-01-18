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
    
    // Aggregate data by employee
    const totals = filteredData.reduce((acc, item) => {
      const name = item.employee_name;
      // Defensive parsing
      const revenue = typeof item.monthly_revenue === 'string' ? parseFloat(item.monthly_revenue) : item.monthly_revenue;
      
      acc[name] = (acc[name] || 0) + (revenue || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(totals)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [filteredData]);

  // Summary stats
  const totalSales = employeeTotals.reduce((sum, e) => sum + e.total, 0);
  const totalOrders = filteredData.reduce((sum, e) => sum + Number(e.total_orders || 0), 0);
  const avgOrderValue = filteredData.length
    ? filteredData.reduce((sum, e) => sum + (Number(e.avg_order_value) || 0), 0) / filteredData.length
    : 0;

  // Monthly trend data
  const monthlyTrend = useMemo(() => {
    return MONTHS.map((name, idx) => ({
      name,
      total: filteredData
        .filter(d => d.order_month === idx + 1)
        .reduce((sum, d) => sum + (Number(d.monthly_revenue) || 0), 0),
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
          <p className="text-xs text-gray-500">{row.title || 'Xodim'}</p>
        </div>
      ),
    },
    {
      key: 'order_month',
      header: 'Oy',
      width: '12%',
      align: 'center' as const,
      render: (value: unknown) => (
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-medium">
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
        <span className="font-medium text-blue-600 dark:text-blue-400">{formatNumber(value as number)}</span>
      ),
    },
    {
      key: 'monthly_revenue',
      header: 'Savdo Hajmi',
      width: '18%',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(Number(value))}
        </span>
      ),
    },
    {
      key: 'avg_order_value',
      header: "O'rtacha Chek",
      width: '15%',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="text-gray-600 dark:text-gray-300 font-mono text-sm">
          {formatCurrency(Number(value))}
        </span>
      ),
    },
  ];

  if (error) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-600" />
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
              Xodimlar samaradorligi va savdo dinamikasi
            </p>
          </div>
        </div>
        
        {/* Year selector from database */}
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Yilni tanlang:</span>
          <select 
            value={selectedYear}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-white dark:bg-dark-card border-0 ring-1 ring-gray-200 dark:ring-gray-700 text-gray-900 dark:text-white text-sm rounded-md focus:ring-2 focus:ring-primary-500 p-1.5 min-w-[80px] font-semibold cursor-pointer"
          >
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <DollarSign className="text-emerald-600" size={24} />
            </div>
            <div>
              <p className={cn('text-xs font-medium uppercase tracking-wider', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Jami Savdo ({selectedYear})
              </p>
              <p className={cn('text-2xl font-bold mt-1', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {formatCurrency(totalSales)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Package className="text-blue-600" size={24} />
            </div>
            <div>
              <p className={cn('text-xs font-medium uppercase tracking-wider', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Jami Buyurtmalar
              </p>
              <p className={cn('text-2xl font-bold mt-1', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {formatNumber(totalOrders)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <div>
              <p className={cn('text-xs font-medium uppercase tracking-wider', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                O'rtacha Chek
              </p>
              <p className={cn('text-2xl font-bold mt-1', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {formatCurrency(avgOrderValue)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5 border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Users className="text-orange-600" size={24} />
            </div>
            <div>
              <p className={cn('text-xs font-medium uppercase tracking-wider', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Faol Xodimlar
              </p>
              <p className={cn('text-2xl font-bold mt-1', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {employeeTotals.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className={cn(
              'text-lg font-bold',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Xodimlar reytingi (Top 10)
            </h3>
            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-500">
              Saralash: Savdo hajmi
            </span>
          </div>
          {loading ? (
            <div className="h-[320px] skeleton rounded-lg" />
          ) : employeeTotals.length === 0 ? (
            <div className="h-[320px] flex items-center justify-center text-gray-500 flex-col gap-2">
              <Package className="w-10 h-10 text-gray-300" />
              <span>Bu yil uchun ma'lumot yo'q</span>
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
              yLabel="Savdo ($)"
              formatAsAmount
            />
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className={cn(
              'text-lg font-bold',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}>
              Yillik savdo dinamikasi
            </h3>
            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-500">
              Oyma-oy ko'rsatkich
            </span>
          </div>
          {loading ? (
            <div className="h-80 skeleton rounded-lg" />
          ) : (
            <LineChart
              data={monthlyTrend}
              xKey="name"
              lines={[{ dataKey: 'total', color: '#3b82f6', name: 'Jami savdo' }]}
              height={320}
              yLabel="Savdo ($)"
              formatAsAmount
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
