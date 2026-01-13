/**
 * Shipping Analytics - Yetkazib berish tahlili
 */

import React, { useState, useEffect } from 'react';
import { Truck, Clock, Package, TrendingUp, RefreshCw, CheckCircle, DollarSign, Table2 } from 'lucide-react';
import {
  ChartCard,
  KpiCard,
  BarChartComponent,
  ChartSkeleton,
  ErrorState,
  COLORS,
} from '../../components/Charts';
import AnalyticsLayout from '../../components/AnalyticsLayout';
import { shippingApi } from '../../services/analyticsApi';

interface EfficiencyItem {
  company_name?: string;
  total_orders?: string | number;
  total_freight_revenue?: string | number;
  avg_freight_per_order?: string | number;
  avg_delivery_days?: string | number;
  on_time_delivery_rate?: string | number;
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

export default function ShippingAnalytics(): React.ReactElement {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [efficiency, setEfficiency] = useState<EfficiencyItem[]>([]);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await shippingApi.getEfficiency();
      setEfficiency(res.data || []);
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
          <ChartCard title="Yuklanmoqda..."><ChartSkeleton height={400} /></ChartCard>
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

  const efficiencyChartData = efficiency.map((e, idx) => ({
    name: e.company_name || `Shipper ${idx + 1}`,
    orders: parseInt(String(e.total_orders)) || 0,
    revenue: parseFloat(String(e.total_freight_revenue)) || 0,
    avgFreight: parseFloat(String(e.avg_freight_per_order)) || 0,
    avgDays: parseFloat(String(e.avg_delivery_days)) || 0,
    onTimeRate: parseFloat(String(e.on_time_delivery_rate)) || 0,
  }));

  const totalOrders = efficiencyChartData.reduce((sum, e) => sum + e.orders, 0);
  const totalRevenue = efficiencyChartData.reduce((sum, e) => sum + e.revenue, 0);
  const avgDeliveryDays = efficiencyChartData.length > 0
    ? efficiencyChartData.reduce((sum, e) => sum + e.avgDays, 0) / efficiencyChartData.length
    : 0;
  const avgOnTimeRate = efficiencyChartData.length > 0
    ? efficiencyChartData.reduce((sum, e) => sum + e.onTimeRate, 0) / efficiencyChartData.length
    : 0;

  return (
    <AnalyticsLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Yetkazib berish Analitikasi</h1>
            <p className="text-slate-500 mt-1">Shipping kompaniyalari samaradorligi</p>
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
            title="Jami buyurtmalar"
            value={formatNumber(totalOrders)}
            icon={Package}
            color="blue"
          />
          <KpiCard
            title="Freight daromadi"
            value={formatCurrency(totalRevenue)}
            icon={TrendingUp}
            color="green"
          />
          <KpiCard
            title="O'rt. yetkazish"
            value={`${avgDeliveryDays.toFixed(1)} kun`}
            icon={Clock}
            color="purple"
          />
          <KpiCard
            title="O'z vaqtida"
            value={`${avgOnTimeRate.toFixed(1)}%`}
            icon={CheckCircle}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard 
            title="Buyurtmalar soni" 
            subtitle="Kompaniya bo'yicha"
            actions={
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
            }
          >
            <BarChartComponent
              data={efficiencyChartData}
              xKey="name"
              bars={[{ key: 'orders', name: 'Buyurtmalar', color: COLORS.primary[0] }]}
              height={300}
            />
          </ChartCard>

          <ChartCard 
            title="Freight daromadi" 
            subtitle="Kompaniya bo'yicha"
            actions={
              <div className="p-2 bg-emerald-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
            }
          >
            <BarChartComponent
              data={efficiencyChartData}
              xKey="name"
              bars={[{ key: 'revenue', name: 'Daromad ($)', color: COLORS.success[0] }]}
              height={300}
              formatter={formatCurrency}
            />
          </ChartCard>
        </div>

        <ChartCard 
          title="Kompaniyalar tahlili" 
          subtitle="Batafsil ko'rsatkichlar"
          actions={
            <div className="p-2 bg-purple-50 rounded-lg">
              <Truck className="w-5 h-5 text-purple-600" />
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {efficiencyChartData.map((company, idx) => (
              <div
                key={`company-${idx}`}
                className="p-5 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow"
                style={{ borderLeftWidth: '4px', borderLeftColor: COLORS.gradient[idx % COLORS.gradient.length] }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${COLORS.gradient[idx % COLORS.gradient.length]}20` }}
                  >
                    <Truck
                      className="w-6 h-6"
                      style={{ color: COLORS.gradient[idx % COLORS.gradient.length] }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{company.name}</h3>
                    <p className="text-sm text-slate-500">{formatNumber(company.orders)} buyurtma</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Daromad</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(company.revenue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">O'rt. freight</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(company.avgFreight)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">O'rt. kunlar</span>
                    <span className="font-semibold text-slate-800">{company.avgDays.toFixed(1)} kun</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">O'z vaqtida</span>
                    <span className={`font-semibold ${company.onTimeRate >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
                      {company.onTimeRate.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar for on-time rate */}
                <div className="mt-4">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${company.onTimeRate}%`,
                        backgroundColor: company.onTimeRate >= 80 ? '#10B981' : '#F59E0B',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </AnalyticsLayout>
  );
}
