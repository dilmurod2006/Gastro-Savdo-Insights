import { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Percent, ArrowLeft, Calendar } from 'lucide-react';
import { Card, Table, Badge, ErrorState } from '@/components/ui';
import { BarChart, LineChart } from '@/components/charts';
import { useTheme } from '@/contexts';
import { useYoYGrowth } from '@/hooks';
import { cn } from '@/utils/helpers';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';
import type { YoYGrowth } from '@/types';

const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

export function YoYGrowthPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data, loading, error, refetch } = useYoYGrowth();


  // Extract unique years from data
  const yearOptions = useMemo(() => {
    if (!data) return [];
    const years = [...new Set(data.map((d) => d.year))];
    return years.sort((a, b) => b - a); // Descending
  }, [data]);

  // Selected year state
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const activeYear = selectedYear === 'all' ? 'all' : selectedYear ?? yearOptions[0];

  // Filter data by year or all
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (activeYear === 'all') return data;
    return data.filter((d) => d.year === activeYear);
  }, [data, activeYear]);

  // Process chart data - using correct API fields
  const chartData = useMemo(() => {
    if (!filteredData) return [];
    return filteredData.map((d) => ({
      name: `${d.year}/${MONTHS[d.month - 1]}`,
      revenue: d.revenue,
      prev_year: d.prev_year_revenue || 0,
      moving_avg: d.moving_avg_3month,
    }));
  }, [filteredData]);

  // Growth rate chart - only items with yoy_growth_percent
  const growthRates = useMemo(() => {
    if (!filteredData) return [];
    return filteredData
      .filter((d) => d.yoy_growth_percent !== null)
      .slice(-12)
      .map((d) => ({
        name: `${d.year}/${MONTHS[d.month - 1]}`,
        value: d.yoy_growth_percent || 0,
        positive: (d.yoy_growth_percent || 0) >= 0,
      }));
  }, [filteredData]);

  // Summary stats
  const latestPeriod = filteredData?.[filteredData.length - 1];
  
  // Calculate average growth (only for items with yoy_growth_percent)
  const avgGrowth = useMemo(() => {
    if (!filteredData?.length) return 0;
    const validItems = filteredData.filter((d) => d.yoy_growth_percent !== null);
    if (!validItems.length) return 0;
    return validItems.reduce((s, d) => s + (d.yoy_growth_percent || 0), 0) / validItems.length;
  }, [filteredData]);

  // Total revenue (use YTD of last period or sum all revenue)
  const totalRevenue = useMemo(() => {
    if (!filteredData?.length) return 0;
    // Get the latest YTD revenue for each year
    const latestYtd = latestPeriod?.ytd_revenue || 0;
    return latestYtd;
  }, [filteredData, latestPeriod]);

  const columns = [
    {
      key: 'year',
      header: 'Yil',
      width: '10%',
      render: (value: unknown) => (
        <span className="font-semibold">{value as number}</span>
      ),
    },
    {
      key: 'month',
      header: 'Oy',
      width: '10%',
      align: 'center' as const,
      render: (value: unknown) => (
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm">
          {MONTHS[(value as number) - 1]}
        </span>
      ),
    },
    {
      key: 'revenue',
      header: 'Joriy daromad',
      width: '18%',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="font-bold text-emerald-500">
          {formatCurrency(value as number)}
        </span>
      ),
    },
    {
      key: 'prev_year_revenue',
      header: 'Oldingi yil',
      width: '18%',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="text-gray-500">
          {value != null ? formatCurrency(value as number) : '-'}
        </span>
      ),
    },
    {
      key: 'absolute_difference',
      header: 'Farq',
      width: '16%',
      align: 'right' as const,
      render: (value: unknown) => {
        if (value === null) return <span className="text-gray-400">-</span>;
        const diff = value as number;
        return (
          <span className={cn('font-medium', diff >= 0 ? 'text-green-600' : 'text-red-600')}>
            {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
          </span>
        );
      },
    },
    {
      key: 'yoy_growth_percent',
      header: "O'sish %",
      width: '14%',
      align: 'center' as const,
      render: (value: unknown) => {
        if (value === null) return <span className="text-gray-400">-</span>;
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
      key: 'moving_avg_3month',
      header: "3 oy o'rtacha",
      width: '14%',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="text-blue-500 font-medium">
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
            Yillik O'sish Tahlili (YoY)
          </h1>
          <p className={cn(
            'text-sm mt-1',
            theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
          )}>
            Yilma-yil savdo dinamikasi
          </p>
        </div>
      </div>

      {/* Year filter buttons - move to top for better UX */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          key="all"
          onClick={() => setSelectedYear('all')}
          className={cn(
            'px-3 py-1 rounded-lg text-sm font-medium border transition-colors',
            activeYear === 'all'
              ? 'bg-primary-600 text-white border-primary-600 shadow'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-primary-100 dark:hover:bg-primary-900/30'
          )}
        >
          Barchasi
        </button>
        {yearOptions.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={cn(
              'px-3 py-1 rounded-lg text-sm font-medium border transition-colors',
              year === activeYear
                ? 'bg-primary-600 text-white border-primary-600 shadow'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-primary-100 dark:hover:bg-primary-900/30'
            )}
          >
            {year}
          </button>
        ))}
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
                YTD Daromad
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              avgGrowth >= 0
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
            )}>
              {avgGrowth >= 0 ? (
                <TrendingUp className="text-green-600" size={20} />
              ) : (
                <TrendingDown className="text-red-600" size={20} />
              )}
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                O'rtacha o'sish
              </p>
              <p className={cn(
                'text-xl font-bold',
                avgGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {avgGrowth >= 0 ? '+' : ''}{formatPercent(avgGrowth)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Percent className="text-blue-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Oxirgi oy o'sishi
              </p>
              <p className={cn(
                'text-xl font-bold',
                (latestPeriod?.yoy_growth_percent || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {latestPeriod?.yoy_growth_percent != null
                  ? `${latestPeriod.yoy_growth_percent >= 0 ? '+' : ''}${formatPercent(latestPeriod.yoy_growth_percent)}`
                  : '-'}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Calendar className="text-purple-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Davrlar
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {data?.length || 0}
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
            Savdo trendi
          </h3>
          {loading ? (
            <div className="h-[300px] skeleton rounded-lg" />
          ) : chartData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Ma'lumot topilmadi
            </div>
          ) : (
            <LineChart
              data={chartData.slice(-24)}
              xKey="name"
              lines={[
                { dataKey: 'revenue', color: '#10b981', name: 'Daromad' },
                { dataKey: 'moving_avg', color: '#3b82f6', name: "3 oy o'rtacha" },
              ]}
              height={300}
            />
          )}
        </Card>

        <Card className="p-6">
          <h3 className={cn(
            'text-lg font-semibold mb-4',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            O'sish darajasi (YoY %)
          </h3>
          {loading ? (
            <div className="h-[300px] skeleton rounded-lg" />
          ) : growthRates.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              YoY o'sish ma'lumotlari mavjud emas
            </div>
          ) : (
            <BarChart
              data={growthRates}
              xKey="name"
              yKey="value"
              formatAsAmount={false}
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
            Batafsil ma'lumotlar
          </h3>
          <p className="text-sm text-gray-500">{filteredData?.length || 0} davr</p>
        </div>
        <Table<YoYGrowth>
          columns={columns}
          data={filteredData || []}
          loading={loading}
          emptyMessage="Ma'lumot topilmadi"
        />
      </Card>
    </div>
  );
}
