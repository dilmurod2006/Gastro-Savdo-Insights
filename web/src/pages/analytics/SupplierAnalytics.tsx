/**
 * Supplier Analytics - Yetkazib beruvchilar tahlili
 * Professional UI/UX dizayn
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  RefreshCw, 
  Trophy, 
  Table2,
  Clock,
  Package,
  Globe,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  ChartCard,
  BarChartComponent,
  ChartSkeleton,
  ErrorState,
  COLORS,
} from '../../components/Charts';
import AnalyticsLayout from '../../components/AnalyticsLayout';
import { supplierApi } from '../../services/analyticsApi';

interface SupplierPerformance {
  supplier_id?: number;
  supplier_name?: string;
  country?: string;
  total_orders?: number;
  avg_lead_time_days?: string | number;
  min_lead_time?: number;
  max_lead_time?: number;
  late_shipments?: string | number;
  late_shipment_percent?: string | number;
  total_revenue?: string | number;
}

interface RiskAnalysis {
  category_name?: string;
  supplier_name?: string;
  supplier_country?: string;
  product_count?: number;
  supplier_revenue?: string | number;
  category_total_revenue?: string | number;
  revenue_share_percent?: string | number;
  total_suppliers_in_category?: number;
  risk_assessment?: string;
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

const getRiskLevel = (assessment: string): string => {
  if (assessment?.includes('HIGH')) return 'HIGH';
  if (assessment?.includes('MEDIUM')) return 'MEDIUM';
  return 'LOW';
};

interface RiskConfig {
  color: string;
  bgColor: string;
  icon: React.ElementType;
  label: string;
}

const riskConfig: Record<string, RiskConfig> = {
  'HIGH': { color: 'text-red-600', bgColor: 'bg-red-50', icon: XCircle, label: 'Yuqori xavf' },
  'MEDIUM': { color: 'text-amber-600', bgColor: 'bg-amber-50', icon: AlertCircle, label: "O'rtacha xavf" },
  'LOW': { color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: CheckCircle2, label: 'Past xavf' },
};

export default function SupplierAnalytics(): React.ReactElement {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [performance, setPerformance] = useState<SupplierPerformance[]>([]);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis[]>([]);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const [perfRes, riskRes] = await Promise.all([
        supplierApi.getPerformance(10),
        supplierApi.getRiskAnalysis(),
      ]);
      setPerformance(perfRes.data || []);
      setRiskAnalysis(riskRes.data || []);
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={`skeleton-${i}`} className="bg-white rounded-2xl p-6 animate-pulse">
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

  const performanceChartData = performance.slice(0, 10).map((s, idx) => ({
    name: s.supplier_name?.substring(0, 18) || `Supplier ${idx + 1}`,
    revenue: parseFloat(String(s.total_revenue)) || 0,
    orders: s.total_orders || 0,
  }));

  const riskGroups = riskAnalysis.reduce<Record<string, { count: number; revenue: number; suppliers: string[] }>>((acc, item) => {
    const level = getRiskLevel(item.risk_assessment || '');
    if (!acc[level]) {
      acc[level] = { count: 0, revenue: 0, suppliers: [] };
    }
    acc[level].count += 1;
    acc[level].revenue += parseFloat(String(item.supplier_revenue)) || 0;
    if (!acc[level].suppliers.includes(item.supplier_name || '')) {
      acc[level].suppliers.push(item.supplier_name || '');
    }
    return acc;
  }, {});

  const totalRevenue = performance.reduce((sum, s) => sum + (parseFloat(String(s.total_revenue)) || 0), 0);
  const totalSuppliers = performance.length;
  const highRiskCount = riskGroups['HIGH']?.count || 0;
  const avgLeadTime = performance.reduce((sum, s) => sum + (parseFloat(String(s.avg_lead_time_days)) || 0), 0) / (performance.length || 1);

  return (
    <AnalyticsLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Yetkazib beruvchilar Analitikasi</h1>
            <p className="text-slate-500 mt-1">Ta'minotchilar samaradorligi va risk tahlili</p>
          </div>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Yangilash
          </button>
        </div>

        {/* Professional KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Umumiy daromad - gradient card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Umumiy daromad</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
                <p className="text-blue-200 text-xs mt-2">{formatNumber(totalSuppliers)} ta ta'minotchi</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Ta'minotchilar soni */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Ta'minotchilar</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{formatNumber(totalSuppliers)}</p>
                <p className="text-slate-400 text-xs mt-2">Faol hamkorlar</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <Building2 className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* O'rtacha yetkazish */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">O'rtacha yetkazish</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{avgLeadTime.toFixed(1)} kun</p>
                <p className="text-slate-400 text-xs mt-2">Lead time</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Risk holati */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Yuqori xavf</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{formatNumber(highRiskCount)}</p>
                <p className="text-orange-500 text-xs mt-2 font-medium">Kategoriya-ta'minotchi</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Risk Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['HIGH', 'MEDIUM', 'LOW'] as const).map((level) => {
            const config = riskConfig[level];
            const data = riskGroups[level] || { count: 0, revenue: 0, suppliers: [] };
            const Icon = config.icon;
            return (
              <div key={level} className={`${config.bgColor} rounded-2xl p-5 border border-slate-100`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-white shadow-sm">
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div>
                    <p className={`font-semibold ${config.color}`}>{config.label}</p>
                    <p className="text-slate-500 text-xs">{data.count} ta bog'lanish</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-slate-800">{formatCurrency(data.revenue)}</p>
                <p className="text-slate-500 text-xs mt-1">Risk ostidagi daromad</p>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard 
            title="Ta'minotchilar reytingi" 
            subtitle="Daromad bo'yicha top 10"
            actions={<div className="p-2 bg-amber-50 rounded-lg"><Trophy className="w-5 h-5 text-amber-600" /></div>}
          >
            <BarChartComponent
              data={performanceChartData}
              xKey="name"
              bars={[{ key: 'revenue', name: 'Daromad ($)', color: COLORS.primary[0] }]}
              height={380}
              horizontal={true}
              formatter={formatCurrency}
            />
          </ChartCard>

          <ChartCard 
            title="Risk tahlili" 
            subtitle="Kategoriya-ta'minotchi bog'liqligi"
            actions={<div className="p-2 bg-orange-50 rounded-lg"><AlertTriangle className="w-5 h-5 text-orange-600" /></div>}
          >
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
              {riskAnalysis
                .filter(item => getRiskLevel(item.risk_assessment || '') !== 'LOW')
                .slice(0, 12)
                .map((item, idx) => {
                  const level = getRiskLevel(item.risk_assessment || '');
                  const config = riskConfig[level];
                  const Icon = config.icon;
                  return (
                    <div key={`risk-item-${idx}`} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className={`p-2 rounded-lg ${config.bgColor}`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">{item.supplier_name}</p>
                        <p className="text-xs text-slate-500">{item.category_name} • {item.supplier_country}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-800">{parseFloat(String(item.revenue_share_percent || 0)).toFixed(0)}%</p>
                        <p className="text-xs text-slate-500">ulush</p>
                      </div>
                    </div>
                  );
                })}
              {riskAnalysis.filter(item => getRiskLevel(item.risk_assessment || '') !== 'LOW').length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <CheckCircle2 className="w-12 h-12 mb-3 text-emerald-400" />
                  <p className="font-medium">Yuqori xavfli ta'minotchilar yo'q</p>
                </div>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Ta'minotchilar jadvali */}
        <ChartCard 
          title="Ta'minotchilar ro'yxati" 
          subtitle="Batafsil ma'lumotlar"
          actions={<div className="p-2 bg-slate-100 rounded-lg"><Table2 className="w-5 h-5 text-slate-600" /></div>}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Ta'minotchi</th>
                  <th className="text-left py-3 px-4 text-slate-600 font-semibold text-sm">Mamlakat</th>
                  <th className="text-center py-3 px-4 text-slate-600 font-semibold text-sm">Buyurtmalar</th>
                  <th className="text-center py-3 px-4 text-slate-600 font-semibold text-sm">O'rt. yetkazish</th>
                  <th className="text-center py-3 px-4 text-slate-600 font-semibold text-sm">Kechikish</th>
                  <th className="text-right py-3 px-4 text-slate-600 font-semibold text-sm">Daromad</th>
                </tr>
              </thead>
              <tbody>
                {performance.slice(0, 15).map((supplier, idx) => {
                  const latePercent = parseFloat(String(supplier.late_shipment_percent)) || 0;
                  return (
                    <tr key={`supplier-${idx}`} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                            {supplier.supplier_id || idx + 1}
                          </div>
                          <span className="font-medium text-slate-800">{supplier.supplier_name || 'Noma\'lum'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Globe className="w-4 h-4 text-slate-400" />
                          {supplier.country || '-'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                          <Package className="w-3.5 h-3.5" />
                          {formatNumber(supplier.total_orders || 0)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-slate-600 font-medium">
                          {parseFloat(String(supplier.avg_lead_time_days || 0)).toFixed(1)} kun
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${
                          latePercent > 5 
                            ? 'bg-red-100 text-red-700' 
                            : latePercent > 0
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {latePercent.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-slate-800">
                          {formatCurrency(parseFloat(String(supplier.total_revenue)) || 0)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </AnalyticsLayout>
  );
}
