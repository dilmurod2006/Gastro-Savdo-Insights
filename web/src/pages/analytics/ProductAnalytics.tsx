/**
 * Product Analytics - Mahsulotlar tahlili
 */

import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, AlertTriangle, Archive, RefreshCw, Trophy, BarChart3 } from 'lucide-react';
import {
  ChartCard,
  KpiCard,
  BarChartComponent,
  PieChartComponent,
  ChartSkeleton,
  ErrorState,
  COLORS,
} from '../../components/Charts';
import AnalyticsLayout from '../../components/AnalyticsLayout';
import { productApi } from '../../services/analyticsApi';

interface ProductRevenue {
  product_name?: string;
  total_revenue?: string | number;
  total_quantity_sold?: string | number;
  total_orders?: string | number;
}

interface AbcItem {
  product_name?: string;
  abc_category?: string;
  total_revenue?: string | number;
  cumulative_revenue_percent?: string | number;
}

interface DiscontinuedItem {
  product_status?: string;
  product_count?: number;
  total_orders?: string | number;
  total_units_sold?: string | number;
  total_revenue?: string | number;
  avg_revenue_per_product?: string | number;
  avg_discount_given?: string | number;
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

export default function ProductAnalytics(): React.ReactElement {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [topRevenue, setTopRevenue] = useState<ProductRevenue[]>([]);
  const [abcAnalysis, setAbcAnalysis] = useState<AbcItem[]>([]);
  const [discontinued, setDiscontinued] = useState<DiscontinuedItem[]>([]);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const [revenueRes, abcRes, discontinuedRes] = await Promise.all([
        productApi.getTopRevenue(10),
        productApi.getAbcAnalysis(),
        productApi.getDiscontinued(),
      ]);

      setTopRevenue(revenueRes.data || []);
      setAbcAnalysis(abcRes.data || []);
      setDiscontinued(discontinuedRes.data || []);
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
            <ChartCard title="Yuklanmoqda..."><ChartSkeleton /></ChartCard>
            <ChartCard title="Yuklanmoqda..."><ChartSkeleton /></ChartCard>
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

  const revenueChartData = topRevenue.map((p, idx) => ({
    name: p.product_name?.substring(0, 25) || `Product ${idx + 1}`,
    revenue: parseFloat(String(p.total_revenue)) || 0,
    quantity: parseInt(String(p.total_quantity_sold)) || 0,
  }));

  // ABC kategoriyalari bo'yicha guruhlashtirish
  // API 'A (Top 70%)', 'B (Next 20%)', 'C (Bottom 10%)' formatda qaytaradi
  const abcGroups = abcAnalysis.reduce<Record<string, { name: string; count: number; revenue: number }>>((acc, item) => {
    const fullCategory = item.abc_category || 'Unknown';
    // 'A (Top 70%)' -> 'A' ga o'zgartirish
    const category = fullCategory.charAt(0);
    if (!acc[category]) {
      acc[category] = { name: category, count: 0, revenue: 0 };
    }
    acc[category].count += 1;
    acc[category].revenue += parseFloat(String(item.total_revenue)) || 0;
    return acc;
  }, {});

  const abcChartData = Object.values(abcGroups).sort((a, b) => b.revenue - a.revenue);

  const totalRevenue = revenueChartData.reduce((sum, p) => sum + p.revenue, 0);
  const totalProducts = abcAnalysis.length;
  const discontinuedCount = discontinued.find(d => d.product_status === 'Discontinued')?.product_count || 0;
  const categoryACount = abcGroups['A']?.count || 0;

  return (
    <AnalyticsLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Mahsulotlar Analitikasi</h1>
            <p className="text-slate-500 mt-1">Mahsulotlar daromadi va ABC tahlili</p>
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
            title="Jami mahsulotlar"
            value={formatNumber(totalProducts)}
            icon={Package}
            color="green"
          />
          <KpiCard
            title="A kategoriya"
            value={formatNumber(categoryACount)}
            change="Eng muhim"
            changeType="positive"
            icon={Archive}
            color="purple"
          />
          <KpiCard
            title="To'xtatilgan"
            value={formatNumber(discontinuedCount)}
            change="mahsulotlar"
            changeType="negative"
            icon={AlertTriangle}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard 
            title="Top daromadli mahsulotlar" 
            subtitle="Eng ko'p daromad keltirgan"
            actions={
              <div className="p-2 bg-amber-50 rounded-lg">
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
            }
          >
            <BarChartComponent
              data={revenueChartData}
              xKey="name"
              bars={[{ key: 'revenue', name: 'Daromad ($)', color: COLORS.primary[0] }]}
              height={350}
              horizontal={true}
              formatter={formatCurrency}
            />
          </ChartCard>

          <ChartCard 
            title="ABC tahlili" 
            subtitle="Mahsulotlar kategoriyasi"
            actions={
              <div className="p-2 bg-blue-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
            }
          >
            <div className="space-y-4">
              {abcChartData.map((cat, idx) => {
                const percent = totalRevenue > 0 ? ((cat.revenue / totalRevenue) * 100).toFixed(1) : '0';
                return (
                  <div key={`abc-${cat.name}-${idx}`} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS.gradient[idx % COLORS.gradient.length] }}
                        />
                        <span className="font-semibold">Kategoriya {cat.name}</span>
                      </div>
                      <span className="text-slate-600">{cat.count} ta ({percent}%)</span>
                    </div>
                    <div className="h-6 bg-slate-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg flex items-center justify-end pr-2 transition-all"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: COLORS.gradient[idx % COLORS.gradient.length],
                        }}
                      >
                        <span className="text-xs font-medium text-white">{formatCurrency(cat.revenue)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>

        <ChartCard 
          title="Mahsulot holati tahlili" 
          subtitle="Faol va to'xtatilgan mahsulotlar statistikasi"
          actions={
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold">Holat</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-semibold">Mahsulotlar</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-semibold">Buyurtmalar</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-semibold">Sotilgan</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-semibold">Daromad</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-semibold">O'rt. daromad</th>
                </tr>
              </thead>
              <tbody>
                {discontinued.filter(item => item.product_status !== 'GRAND TOTAL').map((item, idx) => (
                  <tr key={`disc-${idx}`} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${
                          item.product_status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'
                        }`}></span>
                        {item.product_status === 'Active' ? 'Faol mahsulotlar' : "To'xtatilgan"}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {formatNumber(item.product_count || 0)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {formatNumber(parseInt(String(item.total_orders)) || 0)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {formatNumber(parseInt(String(item.total_units_sold)) || 0)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-800 font-medium">
                      {formatCurrency(parseFloat(String(item.total_revenue)) || 0)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {formatCurrency(parseFloat(String(item.avg_revenue_per_product)) || 0)}
                    </td>
                  </tr>
                ))}
                {/* Grand Total row */}
                {discontinued.filter(item => item.product_status === 'GRAND TOTAL').map((item, idx) => (
                  <tr key={`total-${idx}`} className="bg-slate-50 font-semibold">
                    <td className="py-3 px-4 text-slate-800">Jami</td>
                    <td className="py-3 px-4 text-right text-slate-800">
                      {formatNumber(item.product_count || 0)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-800">
                      {formatNumber(parseInt(String(item.total_orders)) || 0)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-800">
                      {formatNumber(parseInt(String(item.total_units_sold)) || 0)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-800">
                      {formatCurrency(parseFloat(String(item.total_revenue)) || 0)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-800">
                      {formatCurrency(parseFloat(String(item.avg_revenue_per_product)) || 0)}
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
