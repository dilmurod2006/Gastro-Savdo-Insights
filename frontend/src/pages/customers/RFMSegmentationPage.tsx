import { useState } from 'react';
import { Card, Table, Badge, DatePicker, ErrorState } from '@/components/ui';
import { PieChart } from '@/components/charts';
import { useTheme } from '@/contexts';
import { useRFMSegmentation } from '@/hooks';
import { cn } from '@/utils/helpers';
import { formatCurrency, formatNumber, formatDaysAgo } from '@/utils/formatters';
import { RFM_SEGMENTS } from '@/utils';
import type { RFMCustomer } from '@/types';

export function RFMSegmentationPage() {
  const { theme } = useTheme();
  const [referenceDate, setReferenceDate] = useState('');
  const { data, loading, error, refetch } = useRFMSegmentation(referenceDate || undefined);

  // Calculate segment counts
  const segmentCounts = data
    ? RFM_SEGMENTS.map((seg) => ({
        name: seg.name,
        value: data.filter((c) => c.segment === seg.name).length,
        color: seg.color,
      }))
    : [];

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
      key: 'recency_days',
      header: 'Recency',
      align: 'center' as const,
      render: (value: unknown) => (
        <span className="text-sm">{formatDaysAgo(value as number)}</span>
      ),
    },
    {
      key: 'frequency',
      header: 'Frequency',
      align: 'center' as const,
      render: (value: unknown) => formatNumber(value as number),
    },
    {
      key: 'monetary',
      header: 'Monetary',
      align: 'right' as const,
      render: (value: unknown) => formatCurrency(value as number),
    },
    {
      key: 'rfm_score',
      header: 'RFM Score',
      align: 'center' as const,
      render: (_value: unknown, row: RFMCustomer) => (
        <span className="font-mono text-sm">
          {row.r_score}{row.f_score}{row.m_score}
        </span>
      ),
    },
    {
      key: 'segment',
      header: 'Segment',
      align: 'center' as const,
      render: (value: unknown) => {
        const segment = value as string;
        return (
          <Badge
            variant={
              segment === 'Champions' ? 'success' :
              segment === 'Lost' ? 'danger' :
              segment === 'At Risk' ? 'warning' :
              'info'
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
            RFM Segmentatsiya
          </h1>
          <p className={cn(
            'text-sm mt-1',
            theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
          )}>
            Mijozlarni Recency, Frequency, Monetary asosida segmentlash
          </p>
        </div>
        <DatePicker
          label="Reference sana"
          value={referenceDate}
          onChange={setReferenceDate}
          className="w-48"
        />
      </div>

      {/* Segment Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {RFM_SEGMENTS.map((seg) => {
          const count = segmentCounts.find((s) => s.name === seg.name)?.value || 0;
          return (
            <Card key={seg.name} className="p-4 text-center">
              <div
                className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${seg.color}20` }}
              >
                <span
                  className="text-lg font-bold"
                  style={{ color: seg.color }}
                >
                  {count}
                </span>
              </div>
              <p className={cn(
                'text-sm font-medium',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>
                {seg.name}
              </p>
              <p className={cn(
                'text-xs',
                theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
              )}>
                {seg.description}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Pie Chart */}
      <Card className="p-6">
        <h3 className={cn(
          'text-lg font-semibold mb-4',
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          Segment taqsimoti
        </h3>
        {loading ? (
          <div className="h-[300px] skeleton rounded-lg" />
        ) : (
          <PieChart
            data={segmentCounts.filter((s) => s.value > 0)}
            donut
            height={300}
          />
        )}
      </Card>

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
            Mijozlar ro'yxati
          </h3>
        </div>
        <Table<RFMCustomer>
          columns={columns}
          data={data || []}
          loading={loading}
        />
      </Card>
    </div>
  );
}
