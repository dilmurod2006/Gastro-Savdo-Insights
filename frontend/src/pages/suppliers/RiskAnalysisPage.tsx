import { useState } from 'react';
import { AlertTriangle, Building, Package, ShieldAlert } from 'lucide-react';
import { Card, Table, Badge, Select, ErrorState } from '@/components/ui';
import { PieChart, RadarChart } from '@/components/charts';
import { useTheme } from '@/contexts';
import { useSupplierRisk } from '@/hooks';
import { cn } from '@/utils/helpers';
import { formatNumber, formatPercent } from '@/utils/formatters';
import type { SupplierRisk as SupplierRiskType } from '@/types';

const RISK_THRESHOLD_OPTIONS = [
  { value: 0.3, label: 'Yuqori risk (>30%)' },
  { value: 0.5, label: "O'rta risk (>50%)" },
  { value: 0.7, label: 'Past risk (>70%)' },
];

export function RiskAnalysisPage() {
  const { theme } = useTheme();
  const [threshold, setThreshold] = useState(0.3);
  const { data, loading, error, refetch } = useSupplierRisk(threshold);

  // Risk level distribution
  const riskLevels = data
    ? Object.entries(
        data.reduce((acc, d) => {
          acc[d.risk_level] = (acc[d.risk_level] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([name, value]) => ({
        name,
        value,
        color: name === 'High' ? '#ef4444' : name === 'Medium' ? '#f59e0b' : '#10b981',
      }))
    : [];

  // Radar chart data
  const radarData = data?.slice(0, 6).map((d) => ({
    subject: d.company_name.split(' ')[0],
    dependency: d.dependency_score * 100,
  })) || [];

  // Summary
  const highRisk = data?.filter((d) => d.risk_level === 'High').length || 0;
  const mediumRisk = data?.filter((d) => d.risk_level === 'Medium').length || 0;
  const lowRisk = data?.filter((d) => d.risk_level === 'Low').length || 0;

  const columns = [
    {
      key: 'supplier_id',
      header: 'ID',
      render: (value: unknown) => (
        <span className="text-sm font-mono">#{value as number}</span>
      ),
    },
    {
      key: 'company_name',
      header: 'Kompaniya',
      render: (value: unknown) => (
        <div className="flex items-center gap-2">
          <Building size={14} className="text-primary-500" />
          <span className="font-medium">{value as string}</span>
        </div>
      ),
    },
    {
      key: 'product_count',
      header: 'Mahsulotlar',
      align: 'center' as const,
      render: (value: unknown) => formatNumber(value as number),
    },
    {
      key: 'single_supplier_products',
      header: 'Yagona',
      align: 'center' as const,
      render: (value: unknown) => (
        <span className={cn(
          'font-medium',
          (value as number) > 0 ? 'text-orange-600' : ''
        )}>
          {value as number}
        </span>
      ),
    },
    {
      key: 'dependency_score',
      header: 'Bog\'liqlik',
      align: 'center' as const,
      render: (value: unknown) => {
        const score = value as number;
        return (
          <div className="flex items-center gap-2 justify-center">
            <div className="w-14 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full',
                  score > 0.7 ? 'bg-red-500' : score > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                )}
                style={{ width: `${score * 100}%` }}
              />
            </div>
            <span className="text-xs">{formatPercent(score * 100)}</span>
          </div>
        );
      },
    },
    {
      key: 'risk_level',
      header: 'Risk darajasi',
      align: 'center' as const,
      render: (value: unknown) => (
        <Badge
          variant={
            value === 'High' ? 'danger' :
            value === 'Medium' ? 'warning' :
            'success'
          }
        >
          {value === 'High' ? 'Yuqori' : value === 'Medium' ? "O'rta" : 'Past'}
        </Badge>
      ),
    },
    {
      key: 'risk_factors',
      header: 'Risk faktorlari',
      render: (value: unknown) => {
        const factors = value as string[];
        if (!factors || factors.length === 0) return '-';
        return (
          <div className="flex flex-wrap gap-1">
            {factors.slice(0, 2).map((f, i) => (
              <span
                key={i}
                className={cn(
                  'text-xs px-2 py-0.5 rounded',
                  theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'
                )}
              >
                {f}
              </span>
            ))}
            {factors.length > 2 && (
              <span className="text-xs text-gray-500">+{factors.length - 2}</span>
            )}
          </div>
        );
      },
    },
  ];

  if (error) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={cn(
            'text-2xl font-bold',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Risk Tahlili
          </h1>
          <p className={cn(
            'text-sm mt-1',
            theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
          )}>
            Ta'minotchilar bog'liqlik va risk tahlili
          </p>
        </div>
        <Select
          options={RISK_THRESHOLD_OPTIONS}
          value={threshold}
          onChange={(v) => setThreshold(Number(v))}
          className="w-48"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <ShieldAlert className="text-red-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Yuqori risk
              </p>
              <p className={cn('text-xl font-bold text-red-600')}>
                {highRisk}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <AlertTriangle className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                O'rta risk
              </p>
              <p className={cn('text-xl font-bold text-yellow-600')}>
                {mediumRisk}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Building className="text-green-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Past risk
              </p>
              <p className={cn('text-xl font-bold text-green-600')}>
                {lowRisk}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Package className="text-purple-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Jami ta'minotchilar
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {data?.length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className={cn(
            'text-lg font-semibold mb-4',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Risk darajalari taqsimoti
          </h3>
          {loading ? (
            <div className="h-[280px] skeleton rounded-lg" />
          ) : (
            <PieChart data={riskLevels} donut height={280} />
          )}
        </Card>

        <Card className="p-6">
          <h3 className={cn(
            'text-lg font-semibold mb-4',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Bog'liqlik profili
          </h3>
          {loading ? (
            <div className="h-70 skeleton rounded-lg" />
          ) : (
            <RadarChart
              data={radarData}
              angleKey="subject"
              radars={[{ dataKey: 'dependency', color: '#3b82f6', name: "Bog'liqlik" }]}
              height={280}
            />
          )}
        </Card>
      </div>

      {/* High Risk Suppliers Alert */}
      {highRisk > 0 && (
        <Card className="p-6 border-l-4 border-red-500">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="text-red-600" size={20} />
            </div>
            <div>
              <h4 className={cn(
                'font-semibold mb-1',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                Diqqat: Yuqori riskli ta'minotchilar
              </h4>
              <p className={cn('text-sm', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                {highRisk} ta ta'minotchi yuqori bog'liqlik darajasiga ega. Ular bilan munosabatlarni diversifikatsiya 
                qilish tavsiya etiladi.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {data?.filter((d) => d.risk_level === 'High').slice(0, 5).map((d) => (
                  <Badge key={d.supplier_id} variant="danger">
                    {d.company_name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Table */}
      <Card className="overflow-hidden">
        <div className={cn(
          'px-6 py-4 border-b',
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        )}>
          <h3 className={cn(
            'text-lg font-semibold',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Risk tahlili natijalari
          </h3>
        </div>
        <Table<SupplierRiskType>
          columns={columns}
          data={data || []}
          loading={loading}
        />
      </Card>
    </div>
  );
}
