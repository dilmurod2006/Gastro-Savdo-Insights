/**
 * Analytics Dashboard - Umumiy ko'rsatkichlar
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Package, DollarSign, RefreshCw, ShoppingCart, LineChart, Trophy } from 'lucide-react';
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
import { dashboardApi, salesApi, productApi } from '../../services/analyticsApi';

interface KpiData {
  jami_daromad?: string | number;
  jami_buyurtmalar?: string | number;
  faol_mijozlar?: string | number;
  jami_mahsulotlar?: string | number;
  ortacha_buyurtma_qiymati?: string | number;
}

interface SalesData {
  sales_month?: string;
  revenue?: string | number;
  yoy_growth_percent?: string | number | null;
}

interface ProductData {
  product_name?: string;
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

export default function AnalyticsDashboard(): React.ReactElement {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<KpiData>({});
  const [salesTrend, setSalesTrend] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<ProductData[]>([]);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const [kpiRes, salesRes, productsRes] = await Promise.all([
        dashboardApi.getKpis(),
        salesApi.getYoyGrowth(),
        productApi.getTopRevenue(10),
      ]);

      setKpis(kpiRes.data?.[0] || {});
      setSalesTrend(salesRes.data || []);
      setTopProducts(productsRes.data || []);
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
              <div key={`skeleton-kpi-${i}`} className="bg-white rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-slate-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
          <ChartCard title="Yuklanmoqda..."><ChartSkeleton height={300} /></ChartCard>
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

  const salesChartData = salesTrend.map((s, idx) => ({
    name: s.sales_month || `${idx}`,
    revenue: parseFloat(String(s.revenue)) || 0,
    growth: parseFloat(String(s.yoy_growth_percent)) || 0,
  }));

  const productsChartData = topProducts.slice(0, 5).map((p, idx) => ({
    name: p.product_name?.substring(0, 20) || `Product ${idx + 1}`,
    revenue: parseFloat(String(p.total_revenue)) || 0,
  }));

  return (
    <AnalyticsLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500 mt-1">Umumiy biznes ko'rsatkichlari</p>
          </div>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Yangilash
          </button>
        </div>

        {/* Asosiy KPI - Umumiy daromad */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Umumiy daromad</p>
              <p className="text-4xl font-bold tracking-tight">
                {formatCurrency(parseFloat(String(kpis.jami_daromad)) || 0)}
              </p>
              <p className="text-blue-200 text-sm mt-2">
                O'rtacha buyurtma: {formatCurrency(parseFloat(String(kpis.ortacha_buyurtma_qiymati)) || 0)}
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Qolgan KPI kartalar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">Faol</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{formatNumber(parseInt(String(kpis.jami_buyurtmalar)) || 0)}</p>
            <p className="text-slate-500 text-sm mt-1">Buyurtmalar</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">Aktiv</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{formatNumber(parseInt(String(kpis.faol_mijozlar)) || 0)}</p>
            <p className="text-slate-500 text-sm mt-1">Mijozlar</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Sotuvda</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{formatNumber(parseInt(String(kpis.jami_mahsulotlar)) || 0)}</p>
            <p className="text-slate-500 text-sm mt-1">Mahsulotlar</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">O'rtacha</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(parseFloat(String(kpis.ortacha_buyurtma_qiymati)) || 0)}</p>
            <p className="text-slate-500 text-sm mt-1">Har bir buyurtma</p>
          </div>
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
              data={salesChartData}
              xKey="name"
              lines={[{ key: 'revenue', name: 'Daromad', color: COLORS.primary[0] }]}
              height={300}
              formatter={formatCurrency}
            />
          </ChartCard>

          <ChartCard 
            title="Top mahsulotlar" 
            subtitle="Eng ko'p sotilgan"
            actions={
              <div className="p-2 bg-amber-50 rounded-lg">
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
            }
          >
            <BarChartComponent
              data={productsChartData}
              xKey="name"
              bars={[{ key: 'revenue', name: 'Daromad', color: COLORS.success[0] }]}
              height={300}
              horizontal={true}
              formatter={formatCurrency}
            />
          </ChartCard>
        </div>
      </div>
    </AnalyticsLayout>
  );
}
