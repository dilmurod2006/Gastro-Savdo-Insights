/**
 * Customer Analytics - Mijozlar tahlili
 */

import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Target, Heart, RefreshCw, Crown, Trophy, BarChart3 } from 'lucide-react';
import {
  ChartCard,
  KpiCard,
  BarChartComponent,
  ChartSkeleton,
  ErrorState,
  COLORS,
} from '../../components/Charts';
import AnalyticsLayout from '../../components/AnalyticsLayout';
import { customerApi } from '../../services/analyticsApi';

interface CustomerByCountry {
  company_name?: string;
  country?: string;
  total_revenue?: string | number;
  order_count?: string | number;
}

interface RfmItem {
  customer_id?: string;
  customer_segment?: string;
  total_revenue?: string | number;
  frequency_score?: string | number;
  monetary_score?: string | number;
}

interface RetentionItem {
  first_order_year?: number;
  total_customers?: string | number;
  retained_customers?: string | number;
  retention_rate?: string | number;
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

const segmentColors: Record<string, string> = {
  'Champions': '#10B981',
  'Loyal': '#3B82F6',
  'Potential': '#8B5CF6',
  'New': '#F59E0B',
  'At Risk': '#EF4444',
  'Hibernating': '#6B7280',
};

export default function CustomerAnalytics(): React.ReactElement {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [topByCountry, setTopByCountry] = useState<CustomerByCountry[]>([]);
  const [rfmData, setRfmData] = useState<RfmItem[]>([]);
  const [retention, setRetention] = useState<RetentionItem[]>([]);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const [countryRes, rfmRes, retentionRes] = await Promise.all([
        customerApi.getTopByCountry(),
        customerApi.getRfmSegmentation(),
        customerApi.getRetention(),
      ]);

      setTopByCountry(countryRes.data || []);
      setRfmData(rfmRes.data || []);
      setRetention(retentionRes.data || []);
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

  // RFM segmentlari
  const rfmSegments = rfmData.reduce<Record<string, { name: string; count: number; revenue: number }>>((acc, item) => {
    const segment = item.customer_segment || 'Boshqa';
    if (!acc[segment]) {
      acc[segment] = { name: segment, count: 0, revenue: 0 };
    }
    acc[segment].count += 1;
    acc[segment].revenue += parseFloat(String(item.total_revenue)) || 0;
    return acc;
  }, {});

  const rfmChartData = Object.values(rfmSegments).sort((a, b) => b.count - a.count);

  // Top mijozlar
  const topCustomers = topByCountry
    .map((c, idx) => ({
      name: c.company_name?.substring(0, 25) || `Mijoz ${idx + 1}`,
      country: c.country || 'Noma\'lum',
      revenue: parseFloat(String(c.total_revenue)) || 0,
      orders: parseInt(String(c.order_count)) || 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Retention data
  const retentionChartData = retention.map((r, idx) => ({
    name: String(r.first_order_year || idx),
    customers: parseInt(String(r.total_customers)) || 0,
    retained: parseInt(String(r.retained_customers)) || 0,
    rate: parseFloat(String(r.retention_rate)) || 0,
  }));

  const totalCustomers = new Set(rfmData.map(r => r.customer_id)).size;
  const totalRevenue = rfmData.reduce((sum, r) => sum + (parseFloat(String(r.total_revenue)) || 0), 0);
  const avgRetention = retentionChartData.length > 0
    ? retentionChartData.reduce((sum, r) => sum + r.rate, 0) / retentionChartData.length
    : 0;
  const championsCount = rfmSegments['Champions']?.count || 0;

  return (
    <AnalyticsLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Mijozlar Analitikasi</h1>
            <p className="text-slate-500 mt-1">RFM segmentatsiya va retention tahlili</p>
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
            title="Jami mijozlar"
            value={formatNumber(totalCustomers)}
            icon={Users}
            color="blue"
          />
          <KpiCard
            title="Umumiy daromad"
            value={formatCurrency(totalRevenue)}
            icon={TrendingUp}
            color="green"
          />
          <KpiCard
            title="O'rtacha retention"
            value={`${avgRetention.toFixed(1)}%`}
            icon={Heart}
            color="purple"
          />
          <KpiCard
            title="Champions"
            value={formatNumber(championsCount)}
            change="Eng yaxshi"
            changeType="positive"
            icon={Crown}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="🎯 RFM Segmentlari" subtitle="Mijozlar segmentatsiyasi">
            <div className="space-y-3">
              {rfmChartData.map((segment, idx) => {
                const maxCount = Math.max(...rfmChartData.map(s => s.count));
                const percentage = rfmData.length > 0 
                  ? ((segment.count / rfmData.length) * 100).toFixed(1) 
                  : '0';
                return (
                  <div key={`segment-${segment.name}-${idx}`} className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: segmentColors[segment.name] || COLORS.primary[0] }}
                        />
                        <span className="font-medium text-slate-700">{segment.name}</span>
                      </div>
                      <span className="text-slate-600">{segment.count} ({percentage}%)</span>
                    </div>
                    <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                        style={{
                          width: `${(segment.count / maxCount) * 100}%`,
                          backgroundColor: segmentColors[segment.name] || COLORS.primary[0],
                        }}
                      >
                        <span className="text-xs font-semibold text-white drop-shadow">
                          {formatCurrency(segment.revenue)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          <ChartCard 
            title="Top mijozlar" 
            subtitle="Daromad bo'yicha"
            actions={
              <div className="p-2 bg-amber-50 rounded-lg">
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
            }
          >
            <BarChartComponent
              data={topCustomers}
              xKey="name"
              bars={[{ key: 'revenue', name: 'Daromad ($)', color: COLORS.success[0] }]}
              height={350}
              horizontal={true}
              formatter={formatCurrency}
            />
          </ChartCard>
        </div>

        <ChartCard 
          title="Retention tahlili" 
          subtitle="Yillar bo'yicha mijozlar saqlanishi"
          actions={
            <div className="p-2 bg-blue-50 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
          }
        >
          <BarChartComponent
            data={retentionChartData}
            xKey="name"
            bars={[
              { key: 'customers', name: 'Jami mijozlar', color: COLORS.primary[0] },
              { key: 'retained', name: 'Saqlanganlar', color: COLORS.success[0] },
            ]}
            height={300}
          />
        </ChartCard>
      </div>
    </AnalyticsLayout>
  );
}
