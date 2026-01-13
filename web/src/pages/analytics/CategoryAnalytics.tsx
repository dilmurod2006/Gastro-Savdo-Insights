/**
 * Category Analytics Page
 * Kategoriyalar tahlili - monthly growth va country breakdown
 * Faqat mavjud API endpointlaridan foydalanadi
 */

import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  TrendingUp,
  TrendingDown,
  Globe,
  RefreshCw,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  LineChart,
  MapPin,
  Table2,
} from 'lucide-react';
import {
  ChartCard,
  KpiCard,
  BarChartComponent,
  LineChartComponent,
  ChartSkeleton,
  ErrorState,
  COLORS,
} from '../../components/Charts';
import AnalyticsLayout from '../../components/AnalyticsLayout';
import { categoryApi } from '../../services/analyticsApi';

// Types
interface MonthlyGrowthItem {
  category_name: string;
  sales_year: number;
  sales_month: number;
  monthly_revenue: string | number;
  mom_growth_percent: string | number;
}

interface CountryBreakdownItem {
  country: string;
  category_name: string;
  total_revenue: string | number;
}

interface GrowthChartDataItem {
  month: string;
  [key: string]: string | number;
}

interface CountryChartDataItem {
  name: string;
  totalRevenue: number;
  categories: Record<string, number>;
}

// Utility functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('uz-UZ').format(value);
};

const formatPercent = (value: number): string => {
  const num = parseFloat(String(value)) || 0;
  return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
};

export default function CategoryAnalytics(): React.ReactElement {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyGrowth, setMonthlyGrowth] = useState<MonthlyGrowthItem[]>([]);
  const [countryBreakdown, setCountryBreakdown] = useState<CountryBreakdownItem[]>([]);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // Faqat mavjud API larni chaqiramiz
      const [growthRes, countryRes] = await Promise.all([
        categoryApi.getMonthlyGrowth(),
        categoryApi.getCountryBreakdown(),
      ]);

      setMonthlyGrowth(growthRes.data || []);
      setCountryBreakdown(countryRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <AnalyticsLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={`skeleton-${i}`} className="bg-white rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-slate-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Yuklanmoqda..."><ChartSkeleton height={400} /></ChartCard>
            <ChartCard title="Yuklanmoqda..."><ChartSkeleton height={400} /></ChartCard>
          </div>
        </div>
      </AnalyticsLayout>
    );
  }

  if (error) {
    return (
      <AnalyticsLayout>
        <ErrorState message={error} onRetry={fetchData} />
      </AnalyticsLayout>
    );
  }

  // Kategoriyalar va oylarni olish
  const categories = [...new Set(monthlyGrowth.map(m => m.category_name))].filter(Boolean);
  const months = [...new Set(monthlyGrowth.map(m => 
    `${m.sales_year}-${String(m.sales_month).padStart(2, '0')}`
  ))].sort();

  // Oylik o'sish grafigi uchun ma'lumotlar
  const growthChartData: GrowthChartDataItem[] = months.slice(-12).map(month => {
    const [year, monthNum] = month.split('-');
    const monthData: GrowthChartDataItem = { month };
    categories.forEach(cat => {
      const entry = monthlyGrowth.find(m => 
        m.category_name === cat && 
        m.sales_year === parseInt(year) && 
        m.sales_month === parseInt(monthNum)
      );
      monthData[cat] = parseFloat(String(entry?.monthly_revenue)) || 0;
    });
    return monthData;
  });

  // Mamlakat bo'yicha guruhlashtirish
  const countryGroups = countryBreakdown.reduce<Record<string, CountryChartDataItem>>((acc, item) => {
    const country = item.country || 'Noma\'lum';
    if (!acc[country]) {
      acc[country] = { name: country, totalRevenue: 0, categories: {} };
    }
    const revenue = parseFloat(String(item.total_revenue)) || 0;
    acc[country].totalRevenue += revenue;
    acc[country].categories[item.category_name] = revenue;
    return acc;
  }, {});

  const countryChartData = Object.values(countryGroups)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10);

  // KPI hisoblash
  const totalRevenue = countryChartData.reduce((sum, c) => sum + c.totalRevenue, 0);
  const totalCountries = countryChartData.length;
  const topCountry = countryChartData[0];
  const avgGrowth = monthlyGrowth.length > 0 
    ? monthlyGrowth.reduce((sum, m) => sum + (parseFloat(String(m.mom_growth_percent)) || 0), 0) / monthlyGrowth.length
    : 0;

  // Kategoriya daromadlarini hisoblash
  const categoryRevenues = categories.map(cat => {
    const revenue = monthlyGrowth
      .filter(m => m.category_name === cat)
      .reduce((sum, m) => sum + (parseFloat(String(m.monthly_revenue)) || 0), 0);
    return { name: cat, revenue };
  }).sort((a, b) => b.revenue - a.revenue);

  return (
    <AnalyticsLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Kategoriya Analitikasi</h1>
            <p className="text-slate-500 mt-1">Kategoriyalar o'sishi va geografik taqsimoti</p>
          </div>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Yangilash
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KpiCard
            title="Umumiy daromad"
            value={formatCurrency(totalRevenue)}
            icon={TrendingUp}
            color="blue"
          />
          <KpiCard
            title="Kategoriyalar soni"
            value={formatNumber(categories.length)}
            icon={FolderTree}
            color="green"
          />
          <KpiCard
            title="Mamlakatlar"
            value={formatNumber(totalCountries)}
            icon={Globe}
            color="purple"
          />
          <KpiCard
            title="O'rtacha o'sish"
            value={formatPercent(avgGrowth)}
            change="Oylik"
            changeType={avgGrowth >= 0 ? 'positive' : 'negative'}
            icon={avgGrowth >= 0 ? TrendingUp : TrendingDown}
            color="orange"
          />
        </div>

        {/* Kategoriya daromadlari */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Kategoriya bo'yicha daromad"
            subtitle="Umumiy daromad kategoriyalar kesimida"
            actions={
              <div className="p-2 bg-blue-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
            }
          >
            <BarChartComponent
              data={categoryRevenues}
              xKey="name"
              bars={[
                { key: 'revenue', name: 'Daromad ($)', color: COLORS.primary[0] },
              ]}
              height={380}
              horizontal={true}
              formatter={formatCurrency}
            />
          </ChartCard>

          {/* Mamlakat bo'yicha daromad */}
          <ChartCard
            title="Mamlakat bo'yicha daromad"
            subtitle="Top 10 mamlakat"
            actions={
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Globe className="w-5 h-5 text-emerald-600" />
              </div>
            }
          >
            <BarChartComponent
              data={countryChartData}
              xKey="name"
              bars={[
                { key: 'totalRevenue', name: 'Umumiy daromad ($)', color: COLORS.success[0] },
              ]}
              height={380}
              horizontal={true}
              formatter={formatCurrency}
            />
          </ChartCard>
        </div>

        {/* Oylik o'sish trendi */}
        <ChartCard
          title="Oylik o'sish trendi"
          subtitle="Kategoriyalar bo'yicha oylik daromad dinamikasi"
          actions={
            <div className="p-2 bg-emerald-50 rounded-lg">
              <LineChart className="w-5 h-5 text-emerald-600" />
            </div>
          }
        >
          <LineChartComponent
            data={growthChartData}
            xKey="month"
            lines={categories.slice(0, 5).map((cat, i) => ({
              key: cat,
              name: cat,
              color: COLORS.gradient[i % COLORS.gradient.length],
            }))}
            height={350}
            showArea={true}
            formatter={formatCurrency}
          />
        </ChartCard>

        {/* Mamlakat tafsilotlari */}
        <ChartCard
          title="Mamlakat tafsilotlari"
          subtitle="Har bir mamlakat bo'yicha batafsil"
          actions={
            <div className="p-2 bg-purple-50 rounded-lg">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {countryChartData.map((country, index) => {
              const share = totalRevenue > 0 ? (country.totalRevenue / totalRevenue * 100).toFixed(1) : '0';
              return (
                <div
                  key={`country-${country.name}-${index}`}
                  className="p-4 rounded-xl border border-slate-200 hover:shadow-md transition-shadow"
                  style={{ borderLeftWidth: '4px', borderLeftColor: COLORS.gradient[index % COLORS.gradient.length] }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-slate-800">{country.name}</span>
                    <span
                      className="px-2 py-1 text-xs font-medium rounded-full"
                      style={{ 
                        backgroundColor: `${COLORS.gradient[index % COLORS.gradient.length]}20`,
                        color: COLORS.gradient[index % COLORS.gradient.length]
                      }}
                    >
                      {share}%
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mb-1">
                    {formatCurrency(country.totalRevenue)}
                  </div>
                  <div className="text-sm text-slate-500">
                    {Object.keys(country.categories).length} kategoriya
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${share}%`,
                        backgroundColor: COLORS.gradient[index % COLORS.gradient.length]
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        {/* O'sish tahlili jadvali */}
        <ChartCard
          title="O'sish tahlili"
          subtitle="So'nggi oylar bo'yicha kategoriya o'sishi"
          actions={
            <div className="p-2 bg-slate-100 rounded-lg">
              <Table2 className="w-5 h-5 text-slate-600" />
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold">Kategoriya</th>
                  {months.slice(-6).map(month => (
                    <th key={`header-${month}`} className="text-right py-3 px-4 text-slate-600 font-semibold">
                      {month}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.slice(0, 8).map((category, catIndex) => (
                  <tr key={`row-${category}-${catIndex}`} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">{category}</td>
                    {months.slice(-6).map((month, monthIndex) => {
                      const [year, monthNum] = month.split('-');
                      const entry = monthlyGrowth.find(m => 
                        m.category_name === category && 
                        m.sales_year === parseInt(year) && 
                        m.sales_month === parseInt(monthNum)
                      );
                      const growth = parseFloat(String(entry?.mom_growth_percent)) || 0;
                      const revenue = parseFloat(String(entry?.monthly_revenue)) || 0;
                      
                      return (
                        <td key={`cell-${category}-${month}-${monthIndex}`} className="py-3 px-4 text-right">
                          <div className="text-slate-800 font-medium">
                            {formatCurrency(revenue)}
                          </div>
                          <div className={`text-xs flex items-center justify-end gap-1 ${
                            growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-slate-400'
                          }`}>
                            {growth > 0 ? <ArrowUpRight className="w-3 h-3" /> : 
                             growth < 0 ? <ArrowDownRight className="w-3 h-3" /> : null}
                            {formatPercent(growth)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </AnalyticsLayout>
  );
}
