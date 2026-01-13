/**
 * Employee Analytics - Xodimlar tahlili
 */

import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Award, RefreshCw, Trophy, LineChart, Network } from 'lucide-react';
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
import { employeeApi } from '../../services/analyticsApi';

interface MonthlySalesItem {
  employee_name?: string;
  sales_year?: number;
  sales_month?: number;
  monthly_revenue?: string | number;
  order_count?: string | number;
}

interface HierarchyItem {
  employee_name?: string;
  title?: string;
  reports_to?: string;
  total_sales?: string | number;
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

export default function EmployeeAnalytics(): React.ReactElement {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlySales, setMonthlySales] = useState<MonthlySalesItem[]>([]);
  const [hierarchy, setHierarchy] = useState<HierarchyItem[]>([]);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const [salesRes, hierarchyRes] = await Promise.all([
        employeeApi.getMonthlySales(),
        employeeApi.getHierarchy(),
      ]);

      setMonthlySales(salesRes.data || []);
      setHierarchy(hierarchyRes.data || []);
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

  // Xodimlar bo'yicha guruhlashtirish
  const employeeSales = monthlySales.reduce<Record<string, { name: string; revenue: number; orders: number }>>((acc, item) => {
    const name = item.employee_name || 'Noma\'lum';
    if (!acc[name]) {
      acc[name] = { name, revenue: 0, orders: 0 };
    }
    acc[name].revenue += parseFloat(String(item.monthly_revenue)) || 0;
    acc[name].orders += parseInt(String(item.order_count)) || 0;
    return acc;
  }, {});

  const employeeChartData = Object.values(employeeSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Oylik trend
  const months = [...new Set(monthlySales.map(m => 
    `${m.sales_year}-${String(m.sales_month).padStart(2, '0')}`
  ))].sort().slice(-12);

  const monthlyTrendData = months.map((month, idx) => {
    const monthItems = monthlySales.filter(m => 
      `${m.sales_year}-${String(m.sales_month).padStart(2, '0')}` === month
    );
    const totalRevenue = monthItems.reduce((sum, m) => sum + (parseFloat(String(m.monthly_revenue)) || 0), 0);
    return { name: month, revenue: totalRevenue };
  });

  const totalRevenue = employeeChartData.reduce((sum, e) => sum + e.revenue, 0);
  const totalOrders = employeeChartData.reduce((sum, e) => sum + e.orders, 0);
  const totalEmployees = hierarchy.length;
  const topEmployee = employeeChartData[0];

  return (
    <AnalyticsLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Xodimlar Analitikasi</h1>
            <p className="text-slate-500 mt-1">Xodimlar sotuvlari va ierarxiyasi</p>
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
            title="Buyurtmalar"
            value={formatNumber(totalOrders)}
            icon={Award}
            color="green"
          />
          <KpiCard
            title="Xodimlar soni"
            value={formatNumber(totalEmployees)}
            icon={Users}
            color="purple"
          />
          <KpiCard
            title="Top xodim"
            value={topEmployee?.name || 'N/A'}
            change={formatCurrency(topEmployee?.revenue || 0)}
            changeType="positive"
            icon={Award}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard 
            title="Xodimlar reytingi" 
            subtitle="Daromad bo'yicha"
            actions={
              <div className="p-2 bg-amber-50 rounded-lg">
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
            }
          >
            <BarChartComponent
              data={employeeChartData}
              xKey="name"
              bars={[{ key: 'revenue', name: 'Daromad ($)', color: COLORS.primary[0] }]}
              height={350}
              horizontal={true}
              formatter={formatCurrency}
            />
          </ChartCard>

          <ChartCard 
            title="Oylik trend" 
            subtitle="Umumiy sotuvlar dinamikasi"
            actions={
              <div className="p-2 bg-blue-50 rounded-lg">
                <LineChart className="w-5 h-5 text-blue-600" />
              </div>
            }
          >
            <LineChartComponent
              data={monthlyTrendData}
              xKey="name"
              lines={[{ key: 'revenue', name: 'Daromad', color: COLORS.success[0] }]}
              height={350}
              showArea={true}
              formatter={formatCurrency}
            />
          </ChartCard>
        </div>

        <ChartCard 
          title="Xodimlar ierarxiyasi" 
          subtitle="Tashkiliy tuzilma"
          actions={
            <div className="p-2 bg-purple-50 rounded-lg">
              <Network className="w-5 h-5 text-purple-600" />
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold">Xodim</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold">Lavozim</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold">Rahbar</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-semibold">Sotuvlar</th>
                </tr>
              </thead>
              <tbody>
                {hierarchy.map((emp, idx) => (
                  <tr key={`emp-${idx}`} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">{emp.employee_name || 'N/A'}</td>
                    <td className="py-3 px-4 text-slate-600">{emp.title || 'N/A'}</td>
                    <td className="py-3 px-4 text-slate-600">{emp.reports_to || '-'}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-800">
                      {formatCurrency(parseFloat(String(emp.total_sales)) || 0)}
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
