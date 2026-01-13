/**
 * Sales Analytics - Sotuvlar tahlili
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  MapPin,
  RefreshCw,
  BarChart3,
  LineChart,
  Globe,
  Table2,
  ArrowUpRight,
  ArrowDownRight,
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
import { salesApi } from '../../services/analyticsApi';

interface YoyGrowthItem {
  sales_month?: string;
  revenue?: string | number;
  prev_year_revenue?: string | number | null;
  yoy_growth_percent?: string | number | null;
  moving_avg_3month?: string | number;
  ytd_revenue?: string | number;
}

interface DayPatternItem {
  day_of_week?: number;
  day_name?: string;
  total_orders?: string | number;
  total_revenue?: string | number;
}

interface TerritoryItem {
  territory_name?: string;
  territory_id?: string;
  region_name?: string;
  total_orders?: string | number;
  total_revenue?: string | number;
}

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
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

const dayNames: Record<number, string> = {
  1: 'Dushanba',
  2: 'Seshanba',
  3: 'Chorshanba',
  4: 'Payshanba',
  5: 'Juma',
  6: 'Shanba',
  7: 'Yakshanba',
};

export default function SalesAnalytics(): React.ReactElement {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [yoyGrowth, setYoyGrowth] = useState<YoyGrowthItem[]>([]);
  const [dayPatterns, setDayPatterns] = useState<DayPatternItem[]>([]);
  const [territory, setTerritory] = useState<TerritoryItem[]>([]);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const [yoyRes, dayRes, territoryRes] = await Promise.all([
        salesApi.getYoyGrowth(),
        salesApi.getDayPatterns(),
        salesApi.getTerritoryPerformance(),
      ]);

      setYoyGrowth(yoyRes.data || []);
      setDayPatterns(dayRes.data || []);
      setTerritory(territoryRes.data || []);
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
            {[0, 1, 2, 3].map((i) => (
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

  const yoyChartData = yoyGrowth.map((y, idx) => ({
    name: y.sales_month || `${idx}`,
    revenue: parseFloat(String(y.revenue)) || 0,
    growth: parseFloat(String(y.yoy_growth_percent)) || 0,
    movingAvg: parseFloat(String(y.moving_avg_3month)) || 0,
  }));

  const dayChartData = dayPatterns.map((d, idx) => ({
    name: d.day_name || dayNames[d.day_of_week || 0] || `Kun ${idx + 1}`,
    orders: parseInt(String(d.total_orders)) || 0,
    revenue: parseFloat(String(d.total_revenue)) || 0,
  }));

  const territoryChartData = territory.slice(0, 10).map((t, idx) => ({
    name: t.territory_name || `Territory ${idx + 1}`,
    orders: parseInt(String(t.total_orders)) || 0,
    revenue: parseFloat(String(t.total_revenue)) || 0,
  }));

  const totalRevenue = yoyChartData.reduce((sum, y) => sum + y.revenue, 0);
  const latestYear = yoyChartData[yoyChartData.length - 1];
  const avgGrowth = yoyChartData.length > 0
    ? yoyChartData.reduce((sum, y) => sum + y.growth, 0) / yoyChartData.length
    : 0;
  const bestDay = dayChartData.reduce((best, d) => d.revenue > best.revenue ? d : best, dayChartData[0] || { name: 'N/A', revenue: 0 });

  return (
    <AnalyticsLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Sotuvlar Analitikasi</h1>
            <p className="text-slate-500 mt-1">Yillik o'sish, kun patternlari va hududlar</p>
          </div>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Yangilash
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KpiCard
            title="Umumiy daromad"
            value={formatCurrency(totalRevenue)}
            icon={TrendingUp}
            color="blue"
          />
          <KpiCard
            title="So'nggi yil"
            value={formatCurrency(latestYear?.revenue || 0)}
            change={formatPercent(latestYear?.growth || 0)}
            changeType={(latestYear?.growth || 0) >= 0 ? 'positive' : 'negative'}
            icon={BarChart3}
            color="green"
          />
          <KpiCard
            title="O'rtacha o'sish"
            value={formatPercent(avgGrowth)}
            icon={avgGrowth >= 0 ? TrendingUp : TrendingDown}
            color="purple"
          />
          <KpiCard
            title="Eng yaxshi kun"
            value={bestDay?.name || 'N/A'}
            change={formatCurrency(bestDay?.revenue || 0)}
            changeType="positive"
            icon={Calendar}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard 
            title="Yillik daromad trendi" 
            subtitle="Sotuvlar dinamikasi"
            actions={
              <div className="p-2 bg-blue-50 rounded-lg">
                <LineChart className="w-5 h-5 text-blue-600" />
              </div>
            }
          >
            <LineChartComponent
              data={yoyChartData}
              xKey="name"
              lines={[{ key: 'revenue', name: 'Daromad', color: COLORS.primary[0] }]}
              height={350}
              showArea={true}
              formatter={formatCurrency}
            />
          </ChartCard>

          <ChartCard 
            title="Yillik o'sish" 
            subtitle="YoY growth percent"
            actions={
              <div className="p-2 bg-emerald-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
              </div>
            }
          >
            <BarChartComponent
              data={yoyChartData}
              xKey="name"
              bars={[{ key: 'growth', name: 'O\'sish (%)', color: COLORS.success[0] }]}
              height={350}
            />
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard 
            title="Hafta kunlari bo'yicha" 
            subtitle="Qaysi kunlarda ko'p sotiladi"
            actions={
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
            }
          >
            <BarChartComponent
              data={dayChartData}
              xKey="name"
              bars={[
                { key: 'revenue', name: 'Daromad ($)', color: COLORS.primary[0] },
                { key: 'orders', name: 'Buyurtmalar', color: COLORS.success[0] },
              ]}
              height={300}
            />
          </ChartCard>

          <ChartCard 
            title="Hududlar bo'yicha" 
            subtitle="Territory performance"
            actions={
              <div className="p-2 bg-orange-50 rounded-lg">
                <Globe className="w-5 h-5 text-orange-600" />
              </div>
            }
          >
            <BarChartComponent
              data={territoryChartData}
              xKey="name"
              bars={[{ key: 'revenue', name: 'Daromad ($)', color: COLORS.purple[0] }]}
              height={300}
              horizontal={true}
              formatter={formatCurrency}
            />
          </ChartCard>
        </div>

        <ChartCard 
          title="Yillik tahlil jadvali" 
          subtitle="Batafsil ko'rsatkichlar"
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
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold">Yil</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-semibold">Daromad</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-semibold">O'sish</th>
                  <th className="text-center py-3 px-4 text-slate-600 font-semibold">Trend</th>
                </tr>
              </thead>
              <tbody>
                {yoyChartData.map((year, idx) => (
                  <tr key={`year-${idx}`} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">{year.name}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-800">
                      {formatCurrency(year.revenue)}
                    </td>
                    <td className={`py-3 px-4 text-right font-medium ${
                      year.growth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercent(year.growth)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {year.growth >= 0 ? (
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-emerald-50 rounded-full">
                          <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-red-50 rounded-full">
                          <ArrowDownRight className="w-4 h-4 text-red-600" />
                        </span>
                      )}
                    </td>
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
