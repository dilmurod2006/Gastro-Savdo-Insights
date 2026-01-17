import { useState } from "react";
import { MapPin, DollarSign, Package, Users } from "lucide-react";
import { Card, Table, Select, ErrorState } from "@/components/ui";
import { BarChart, PieChart } from "@/components/charts";
import { useTheme } from "@/contexts";
import { useTerritoryPerformance } from "@/hooks";
import { cn } from "@/utils/helpers";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/utils/formatters";
import type { TerritoryPerformance } from "@/types";

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

export function TerritoryPage() {
  const { theme } = useTheme();
  // const [year, setYear] = useState<number | ''>(''); // Year filter not supported by current API
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const { data, loading, error, refetch } = useTerritoryPerformance();

  // Region colors mapping
  const REGION_COLORS: Record<string, string> = {
    'Eastern': '#3b82f6', // Blue
    'Western': '#f97316', // Orange
    'Northern': '#a855f7', // Purple
    'Southern': '#22c55e', // Green
    "Noma'lum": '#94a3b8' // Slate
  };

  const REGION_EMOJIS: Record<string, string> = {
    'Eastern': '🔵',
    'Western': '🟠',
    'Northern': '🟣',
    'Southern': '🟢',
    "Noma'lum": '⚪'
  };

  // Precompute metrics and enrich data
  const processedData = Array.isArray(data) ? data : [];
  
  // Extract unique regions for filter
  const uniqueRegions = Array.from(new Set(processedData.map(d => d.region_name))).filter(Boolean).sort();
  const regionOptions = [
    { value: 'all', label: 'Barcha Hududlar' },
    ...uniqueRegions.map(r => ({ 
      value: r, 
      label: `${REGION_EMOJIS[r] || '⚪'} ${r}` 
    }))
  ];

  const validData = processedData.filter(d => {
    const revenuePositive = d.total_revenue > 0;
    const matchesRegion = selectedRegion === 'all' || d.region_name === selectedRegion;
    return revenuePositive && matchesRegion;
  });
  
  const totalRevenue = validData.reduce((sum, d) => sum + Number(d.total_revenue), 0);
  const totalOrders = validData.reduce((sum, d) => sum + d.total_orders, 0);
  const totalRegions = new Set(validData.map((d) => d.region_name)).size;
  const topTerritory = validData.length > 0 ? validData[0] : undefined;

  // Enrich with percentage
  const enrichedData = validData.map(d => ({
    ...d,
    percentage_of_total: totalRevenue > 0 ? (Number(d.total_revenue) / totalRevenue) * 100 : 0
  }));

  // Group by region for PieChart (Davlat/Mintaqa bo'yicha)
  const regionStats = enrichedData.reduce((acc, curr) => {
    const region = curr.region_name || "Noma'lum";
    if (!acc[region]) {
      acc[region] = 0;
    }
    acc[region] += Number(curr.total_revenue);
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(regionStats)
    .map(([name, value]) => ({
      name,
      value,
      color: REGION_COLORS[name] || CHART_COLORS[0],
    }))
    .sort((a, b) => b.value - a.value); // Sort by revenue

  // Bar chart shows Top 10 Territories (specific locations)
  const barData = enrichedData.slice(0, 10).map((d) => ({
    name: d.territory_name?.length > 15 ? d.territory_name.slice(0, 15) + '...' : (d.territory_name || d.region_name),
    value: Number(d.total_revenue),
    color: REGION_COLORS[d.region_name] || CHART_COLORS[0] // Bar color matches parent region
  }));

  const columns = [
    {
      key: 'territory_id',
      header: 'ID',
      render: (value: unknown) => (
        <span className="text-sm font-mono text-gray-500">#{value as string}</span>
      ),
    },
    {
      key: 'region_name',
      header: 'Hudud',
      render: (value: unknown, item: TerritoryPerformance) => (
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: REGION_COLORS[value as string] || '#94a3b8' }} />
            <span className="font-medium text-gray-900 dark:text-gray-100">{value as string}</span>
          </div>
          <div className="text-xs text-gray-500 ml-4">{item.territory_name}</div>
        </div>
      ),
    },
    {
      key: 'employee_name',
      header: 'Mas\'ul Xodim',
      render: (value: unknown) => (
        <div className="flex items-center gap-2">
            <Users size={14} className="text-gray-400" />
            <span className="text-sm">{value as string}</span>
        </div>
      )
    },
    {
      key: 'total_orders',
      header: 'Buyurtmalar',
      align: 'center' as const,
      render: (value: unknown) => (
          <span className="font-medium">{formatNumber(value as number)}</span>
      ),
    },
    {
      key: 'total_revenue',
      header: 'Daromad',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="font-bold text-green-600 dark:text-green-400">
          {formatCurrency(Number(value))}
        </span>
      ),
    },
    {
      key: 'avg_order_value',
      header: "O'rtacha Chek",
      align: 'right' as const,
      render: (value: unknown) => (
          <span className="text-gray-700 dark:text-gray-300">
              {formatCurrency(Number(value))}
          </span>
      ),
    },
    {
      key: 'percentage_of_total',
      header: 'Ulushi',
      align: 'center' as const,
      render: (value: unknown, item: TerritoryPerformance) => (
        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex items-center gap-2 w-full max-w-[120px]">
             <span className="text-xs font-semibold w-10 text-right">{formatPercent(value as number)}</span>
             <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(value as number, 100)}%`,
                    backgroundColor: REGION_COLORS[item.region_name] || '#3b82f6'
                  }}
                />
             </div>
          </div>
        </div>
      ),
    },
  ];

  if (error) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={cn(
            'text-2xl font-bold',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Hududiy Samaradorlik
          </h1>
          <p className={cn(
            'text-sm mt-1',
            theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
          )}>
            Savdo hududlari va regionlar bo'yicha batafsil tahlil
          </p>
        </div>
        <div className="flex items-center gap-3">
            <Select
            options={regionOptions}
            value={selectedRegion}
            onChange={(v) => setSelectedRegion(String(v))}
            className="w-56" 
            placeholder="Hududni tanlang"
            />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border-l-4 border-l-primary-500 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <MapPin className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                Faol Hududlar
              </p>
              <p className={cn('text-2xl font-bold mt-1', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {formatNumber(totalRegions)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-5 border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                Jami Daromad
              </p>
              <p className={cn('text-2xl font-bold mt-1', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Package className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                Buyurtmalar
              </p>
              <p className={cn('text-2xl font-bold mt-1', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {formatNumber(totalOrders)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
              <Users className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                Yetakchi Hudud
              </p>
              <p className={cn('text-lg font-bold mt-1 truncate max-w-[150px]', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {topTerritory?.region_name || '-'}
              </p>
              <p className="text-xs text-green-500 font-medium">
                  {topTerritory ? formatCurrency(Number(topTerritory.total_revenue)) : ''}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className={cn(
            'text-lg font-bold mb-6 flex items-center gap-2',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            <span className="w-1 h-6 bg-primary-500 rounded-full block"></span>
            Daromad Taqsimoti (Hududlar)
          </h3>
          {loading ? (
            <div className="h-[350px] skeleton rounded-lg" />
          ) : (
             <div className="h-[350px] w-full">
                <PieChart data={pieData} donut height={350} />
             </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className={cn(
            'text-lg font-bold mb-6 flex items-center gap-2',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            <span className="w-1 h-6 bg-blue-500 rounded-full block"></span>
            TOP 10 Territoriyalar
          </h3>
          {loading ? (
            <div className="h-[350px] skeleton rounded-lg" />
          ) : (
            <div className="h-[350px] w-full">
                <BarChart
                data={barData}
                xKey="name"
                yKey="value"
                exact={true}
                height={350}
                />
            </div>
          )}
        </Card>
      </div>

      {/* Table */}
      <Card className="overflow-hidden border-t-0 shadow-lg">
        <div className={cn(
          'px-6 py-5 border-b flex items-center justify-between',
          theme === 'dark' ? 'border-slate-700 bg-slate-800/50' : 'border-gray-100 bg-gray-50/50'
        )}>
          <h3 className={cn(
            'text-lg font-bold flex items-center gap-2',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            <span className="w-1 h-6 bg-purple-500 rounded-full block"></span>
            Barcha Hududlar Ko'rsatkichlari
          </h3>
          <span className="text-sm text-gray-500">
             Jami: {enrichedData.length} ta yozuv
          </span>
        </div>
        <Table<TerritoryPerformance & { percentage_of_total: number }>
          columns={columns}
          data={enrichedData}
          loading={loading}
          emptyMessage="Ma'lumotlar topilmadi"
        />
      </Card>
    </div>
  );
}
