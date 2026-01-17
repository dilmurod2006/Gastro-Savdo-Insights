import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  PieChart as PieChartIcon,
  ArrowUpRight
} from 'lucide-react';
import { 
  Card, 
  Badge, 
  Select, 
  ErrorState 
} from '@/components/ui';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { useTheme } from '@/contexts';
import { useMonthlyGrowth } from '@/hooks';
import { cn } from '@/utils/helpers';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import { CHART_COLORS } from '@/utils/constants';

const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

export function MonthlyGrowthPage() {
  const { theme } = useTheme();
  const [year, setYear] = useState<number | ''>('');
  const { data, loading, error, refetch } = useMonthlyGrowth();

  // Extract unique years from data
  const availableYears = useMemo(() => {
    if (!data) return [];
    const years = new Set<number>();
    data.forEach(cat => {
      cat.monthly_data?.forEach((m: any) => {
        if (m.year) years.add(m.year);
      });
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [data]);

  // Set default year to latest available if valid
  useMemo(() => {
    if (availableYears.length > 0 && year === '') {
      setYear(availableYears[0]);
    }
  }, [availableYears]);

  // Process data for analytics with filtering
  const analytics = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Filter logic: If year is selected, filter monthly_data
    // If no year, we might want to default to current year or something, but let's handle "All Time" if year is empty?
    // User requested: "database'dagi yillar" (years from DB). So we should respect the selected year.
    // However, if year is '', effectively show all? Or just default to latest?
    // Let's rely on the `setYear` above to default to latest. If it's still '' (no data), then empty.
    
    const targetYear = year === '' ? (availableYears[0] || new Date().getFullYear()) : year;

    // We must reconstruct the "category stats" based on the filtered months
    const processedCategories = data.map(cat => {
      // Filter months for this category
      const relevantMonths = cat.monthly_data?.filter((m: any) => m.year === targetYear) || [];
      
      // Calculate totals for this specific year
      const yearTotalSales = relevantMonths.reduce((sum, m) => sum + Number(m.total_sales), 0);
      
      // Calculate average growth for this year
      // The backend provides 'growth_percent' per month. We can average them or take the latest.
      // Let's take the latest available growth metric for this year as the "current status"
      // or average growth. 'growth_percentage' on parent is usually "MoM".
      // Let's compute average monthly growth? Or just sum?
      // "Growth" usually implies "how much it grew this year". 
      // But preserving the original "Latest MoM" logic is probably safer for "Trends".
      // Let's grab the growth_percent of the last month in the selected year.
      
      const lastMonth = relevantMonths.sort((a, b) => b.month - a.month)[0];
      const yearGrowthPct = lastMonth?.growth_percent ?? 0;

      return {
        ...cat,
        total_sales: yearTotalSales, // Override with year-specific total
        growth_percentage: yearGrowthPct,
        monthly_data: relevantMonths
      };
    });

    // 1. Total Revenue Calculation (for selected year)
    const totalRevenue = processedCategories.reduce((sum, cat) => sum + cat.total_sales, 0);
    
    // 2. Growth Calculation (Average of all categories for selected year)
    const avgGrowth = processedCategories.length > 0 
      ? processedCategories.reduce((sum, cat) => sum + cat.growth_percentage, 0) / processedCategories.length
      : 0;

    // 3. Top Performer
    const sortedBySales = [...processedCategories].sort((a, b) => b.total_sales - a.total_sales);
    const topCategory = sortedBySales[0];

    // 4. Fastest Growing
    const sortedByGrowth = [...processedCategories].sort((a, b) => b.growth_percentage - a.growth_percentage);
    const trendingCategory = sortedByGrowth[0];

    // 5. Chart Data Construction
    const chartData = MONTHS.map((month, index) => {
      const monthIndex = index + 1;
      const point: any = { name: month };
      let monthTotal = 0;

      processedCategories.forEach(cat => {
        const monthStat = cat.monthly_data.find((m: any) => m.month === monthIndex);
        const sales = monthStat ? Number(monthStat.total_sales) : 0;
        point[cat.category_name] = sales;
        monthTotal += sales;
      });

      point.Total = monthTotal;
      return point;
    });

    return {
      totalRevenue,
      avgGrowth,
      topCategory,
      trendingCategory,
      chartData,
      sortedCategories: sortedBySales
    };
  }, [data, year, availableYears]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          ))}
        </div>
        <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <ErrorState 
        title="Ma'lumotlarni yuklashda xatolik" 
        message="Internet aloqasini tekshiring va qayta urinib ko'ring"
        onRetry={refetch}
      />
    );
  }

  const { totalRevenue, avgGrowth, topCategory, trendingCategory, chartData, sortedCategories } = analytics;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-primary-500" />
            Oylik O'sish Tahlili
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Kategoriyalar bo'yicha daromadlar dinamikasi va o'sish ko'rsatkichlari
          </p>
        </div>
        
        <Select
          options={availableYears.map(y => ({ value: y, label: y.toString() }))}
          value={year}
          onChange={(v) => setYear(Number(v) || '')}
          className="w-40"
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-0 overflow-hidden border-none shadow-lg relative group">
          <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 to-green-500/5 z-0" />
          <div className="p-6 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Jami Daromad</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(totalRevenue)}
                </h3>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl">
                <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                +12.5%
              </span>
              <span className="text-xs text-slate-400">o'tgan oyga nisbatan</span>
            </div>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden border-none shadow-lg relative group">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-indigo-500/5 z-0" />
          <div className="p-6 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">O'rtacha O'sish</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {avgGrowth >= 0 ? '+' : ''}{formatPercent(avgGrowth)}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant={avgGrowth >= 0 ? 'success' : 'danger'}>
                {avgGrowth >= 0 ? 'Barqaror' : 'Pasayish'}
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden border-none shadow-lg relative group">
          <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 to-pink-500/5 z-0" />
          <div className="p-6 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Top Kategoriya</p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1 truncate max-w-[150px]" title={topCategory.category_name}>
                  {topCategory.category_name}
                </h3>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-500/20 rounded-xl">
                <PieChartIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {formatCurrency(topCategory.total_sales)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden border-none shadow-lg relative group">
          <div className="absolute inset-0 bg-linear-to-br from-amber-500/10 to-orange-500/5 z-0" />
          <div className="p-6 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Trend (Yuqori O'sish)</p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1 truncate max-w-[150px]" title={trendingCategory.category_name}>
                  {trendingCategory.category_name}
                </h3>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-xl">
                <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="flex items-center text-sm font-medium text-amber-600 dark:text-amber-400">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                {formatPercent(trendingCategory.growth_percentage)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="p-6 shadow-lg border-none bg-white dark:bg-slate-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Oylik Sotuv Dinamikasi
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary-500"></span>
              <span className="text-slate-500">Jami Sotuv</span>
            </div>
          </div>
        </div>
        
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                {sortedCategories.slice(0, 5).map((cat, index) => (
                  <linearGradient key={cat.category_id} id={`color-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS[index]} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={CHART_COLORS[index]} stopOpacity={0}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                  color: theme === 'dark' ? '#fff' : '#0f172a'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="Total" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
              />
              {sortedCategories.slice(0, 3).map((cat, index) => (
                <Area
                  key={cat.category_id}
                  type="monotone"
                  dataKey={cat.category_name}
                  stroke={CHART_COLORS[index]}
                  fill={`url(#color-${index})`}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 shadow-lg border-none">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
            Kategoriyalarning Umumiy Ulushi
          </h3>
          <div className="space-y-4">
            {sortedCategories.map((cat, index) => (
              <div key={cat.category_id} className="relative">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {cat.category_name}
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(cat.total_sales)}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 bg-emerald-500"
                    style={{ 
                      width: `${(cat.total_sales / totalRevenue) * 100}%`,
                      backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-0 overflow-hidden shadow-lg border-none">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Batafsil Statistika
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Kategoriya</th>
                  <th className="px-6 py-3 text-right font-medium text-slate-500 dark:text-slate-400">Jami Sotuv</th>
                  <th className="px-6 py-3 text-right font-medium text-slate-500 dark:text-slate-400">O'sish</th>
                  <th className="px-6 py-3 text-center font-medium text-slate-500 dark:text-slate-400">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {sortedCategories.map((cat) => (
                  <tr key={cat.category_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {cat.category_name}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-300">
                      {formatCurrency(cat.total_sales)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        "font-medium",
                        cat.growth_percentage >= 0 ? "text-emerald-500" : "text-red-500"
                      )}>
                        {cat.growth_percentage >= 0 ? '+' : ''}{cat.growth_percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {cat.growth_percentage >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
