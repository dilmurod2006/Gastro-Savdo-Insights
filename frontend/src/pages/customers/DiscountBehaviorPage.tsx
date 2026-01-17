import { useState, useMemo } from 'react';
import { Percent, Users, DollarSign } from 'lucide-react';
import { Card, Table, Badge, Select, ErrorState } from '@/components/ui';
import { BarChart, PieChart } from '@/components/charts';
import { useTheme } from '@/contexts';
import { useDiscountBehavior } from '@/hooks';
import { cn } from '@/utils/helpers';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/formatters';
import { CHART_COLORS } from '@/utils/constants';
import type { DiscountBehaviorCustomer } from '@/types';

const LIMIT_OPTIONS = [
  { value: 20, label: 'TOP 20' },
  { value: 50, label: 'TOP 50' },
  { value: 100, label: 'TOP 100' },
];

export function DiscountBehaviorPage() {
  const { theme } = useTheme();
  const [limit, setLimit] = useState(50);
  const { data, loading, error, refetch } = useDiscountBehavior(limit);
  const [selectedSegment, setSelectedSegment] = useState<string>('all');

  // Get unique segments for filter
  const segments = useMemo(() => {
    if (!data) return [];
    // Extract unique segments, filter out empty/null values, and sort them
    const uniqueSegments = new Set(data.map((c: any) => c.behavior_segment).filter(Boolean));
    return Array.from(uniqueSegments).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (selectedSegment === 'all') return data;
    return data.filter((item: any) => item.behavior_segment === selectedSegment);
  }, [data, selectedSegment]);

  // Segment distribution
  const segmentData = data
    ? Object.entries(
        data.reduce((acc, c) => {
          acc[c.behavior_segment] = (acc[c.behavior_segment] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([name, value], index) => ({
        name,
        value,
        color: name === 'Full Price Buyer' ? '#10b981' : // Green
               name === 'Discount Aware' ? '#3b82f6' :   // Blue
               CHART_COLORS[index % CHART_COLORS.length],
      }))
    : [];

  // Top discount users
  const topDiscountUsers = data?.slice(0, 10).map((c) => ({
    name: c.company_name.length > 20 ? c.company_name.slice(0, 20) + '...' : c.company_name,
    discount: c.total_discount_value,
  })) || [];

  // Summary
  const totalDiscount = data?.reduce((sum, c) => sum + c.total_discount_value, 0) || 0;
  
  // Fix NaN issue: Ensure discount_percentage is treated as a number and filter out invalids
  const avgDiscountPct = useMemo(() => {
    if (!data || data.length === 0) return 0;
    
    const validPercentages = data
      .map(c => Number(c.discount_percentage))
      .filter(p => !isNaN(p));
      
    if (validPercentages.length === 0) return 0;
    
    return validPercentages.reduce((sum, p) => sum + p, 0) / validPercentages.length;
  }, [data]);

  const columns = [
    {
      key: 'company_name',
      header: 'Kompaniya',
      render: (value: unknown) => (
        <span className="font-medium">{value as string}</span>
      ),
    },
    {
      key: 'country',
      header: 'Mamlakat',
    },
    {
      key: 'total_orders',
      header: 'Buyurtmalar',
      align: 'center' as const,
      render: (value: unknown) => formatNumber(value as number),
    },
    {
      key: 'orders_with_discount',
      header: 'Chegirmali',
      align: 'center' as const,
      render: (value: unknown) => formatNumber(value as number),
    },
    {
      key: 'discount_percentage',
      header: 'Chegirma %',
      align: 'right' as const,
      render: (value: unknown) => (
        <div className="flex items-center justify-end gap-2">
          <div className="w-16 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full"
              style={{ width: `${Math.min(value as number, 100)}%` }}
            />
          </div>
          <span className="text-sm">{formatPercent(value as number)}</span>
        </div>
      ),
    },
    {
      key: 'total_discount_value',
      header: 'Chegirma summasi',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="font-semibold text-orange-600">
          {formatCurrency(value as number)}
        </span>
      ),
    },
    {
      key: 'behavior_segment',
      header: 'Segment',
      align: 'center' as const,
      render: (value: unknown) => {
        const segment = value as string;
        return (
          <Badge
            variant={
              segment === 'Full Price Buyer' || segment.includes('Low') ? 'success' :
              segment === 'Discount Aware' || segment.includes('High') ? 'info' :
              'warning'
            }
          >
            {segment}
          </Badge>
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
            Chegirma Xulq-atvori
          </h1>
          <p className={cn(
            'text-sm mt-1',
            theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
          )}>
            Mijozlarning chegirma olish tendensiyasi
          </p>
        </div>
        <Select
          options={LIMIT_OPTIONS}
          value={limit}
          onChange={(v) => setLimit(Number(v))}
          className="w-32"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <DollarSign className="text-orange-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Jami chegirma
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {formatCurrency(totalDiscount)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Percent className="text-purple-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                O'rtacha chegirma %
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {formatPercent(avgDiscountPct)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="text-blue-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Mijozlar soni
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
            Segment taqsimoti
          </h3>
          {loading ? (
            <div className="h-[280px] skeleton rounded-lg" />
          ) : (
            <PieChart data={segmentData} donut height={280} />
          )}
        </Card>

        <Card className="p-6">
          <h3 className={cn(
            'text-lg font-semibold mb-4',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            TOP 10 chegirma oluvchilar
          </h3>
          {loading ? (
            <div className="h-[280px] skeleton rounded-lg" />
          ) : (
            <BarChart
              data={topDiscountUsers}
              xKey="name"
              yKey="discount"
              horizontal
              colorByValue
              height={280}
            />
          )}
        </Card>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className={cn(
          'px-6 py-4 border-b flex items-center justify-between',
          theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
        )}>
          <h3 className={cn(
            'text-lg font-semibold',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Batafsil ma'lumotlar
          </h3>
          <div className="flex items-center gap-2">
            <Select
              options={[
                { value: 'all', label: 'Barcha Segmentlar' },
                ...segments.map(seg => ({ value: seg as string, label: seg as string }))
              ]}
              value={selectedSegment}
              onChange={(v) => setSelectedSegment(String(v))}
              className="w-48"
            />
          </div>
        </div>
        <Table<DiscountBehaviorCustomer>
          columns={columns}
          data={filteredData || []}
          loading={loading}
        />
      </Card>
    </div>
  );
}
