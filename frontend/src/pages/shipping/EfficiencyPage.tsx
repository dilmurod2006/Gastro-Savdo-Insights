
import { Truck, Package, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { Card, Table, Badge, ErrorState } from '@/components/ui';
import { BarChart, PieChart } from '@/components/charts';
import { useTheme } from '@/contexts';
import { useShippingEfficiency } from '@/hooks';
import { cn } from '@/utils/helpers';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/formatters';
import { CHART_COLORS } from '@/utils/constants';
import type { ShipperEfficiency as ShippingEfficiencyType } from '@/types';

export function EfficiencyPage() {
  const { theme } = useTheme();
  const { data, loading, error, refetch } = useShippingEfficiency();

  // Chart data
  const pieData = data?.map((d, idx) => ({
    name: d.shipper_name,
    value: d.total_orders,
    color: CHART_COLORS[idx % CHART_COLORS.length],
  })) || [];

  const barData = data?.map((d) => ({
    name: d.shipper_name,
    value: d.total_freight,
    orders: d.total_orders,
  })) || [];

  // Summary
  const totalOrders = data?.reduce((sum, d) => sum + d.total_orders, 0) || 0;
  const totalFreight = data?.reduce((sum, d) => sum + d.total_freight, 0) || 0;
  const avgDeliveryDays = data?.length
    ? data.reduce((sum, d) => sum + (d.avg_delivery_days || 0), 0) / data.length
    : 0;
  const bestShipper = data?.reduce((best, d) => (d.avg_delivery_days < (best?.avg_delivery_days || Infinity) ? d : best), data[0]);
  const worstShipper = data?.reduce((worst, d) => (d.avg_delivery_days > (worst?.avg_delivery_days || 0) ? d : worst), data[0]);

  const columns = [
    {
      key: 'shipper_id',
      header: 'ID',
      render: (value: unknown) => (
        <span className="text-sm font-mono">#{value as number}</span>
      ),
    },
    {
      key: 'shipper_name',
      header: 'Tashuvchi',
      render: (value: unknown) => (
        <div className="flex items-center gap-2">
          <Truck size={14} className="text-primary-500" />
          <span className="font-medium">{value as string}</span>
        </div>
      ),
    },
    {
      key: 'total_orders',
      header: 'Buyurtmalar',
      align: 'center' as const,
      render: (value: unknown) => formatNumber(value as number),
    },
    {
      key: 'total_freight',
      header: 'Jami yuk haqi',
      align: 'right' as const,
      render: (value: unknown) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(value as number)}
        </span>
      ),
    },
    {
      key: 'avg_freight_per_order',
      header: "O'rtacha",
      align: 'right' as const,
      render: (value: unknown) => formatCurrency(value as number),
    },
    {
      key: 'avg_delivery_days',
      header: 'Yetkazish (kun)',
      align: 'center' as const,
      render: (value: unknown, row: ShippingEfficiencyType) => {
        const days = value as number;
        const isBest = bestShipper && row.shipper_id === bestShipper.shipper_id;
        const isWorst = worstShipper && row.shipper_id === worstShipper.shipper_id;
        return (
          <div className="flex items-center justify-center gap-2">
            <span className={cn(
              'font-medium',
              isBest ? 'text-green-600' : isWorst ? 'text-red-600' : ''
            )}>
              {(days || 0).toFixed(1)}
            </span>
            {isBest && <Badge variant="success">Tez</Badge>}
            {isWorst && <Badge variant="danger">Sekin</Badge>}
          </div>
        );
      },
    },
    {
      key: 'on_time_delivery_rate',
      header: "O'z vaqtida",
      align: 'center' as const,
      render: (value: unknown) => {
        const rate = (value as number) || 85;
        return (
          <div className="flex items-center gap-2 justify-center">
            <div className="w-14 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full',
                  rate >= 90 ? 'bg-green-500' : rate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                )}
                style={{ width: `${rate}%` }}
              />
            </div>
            <span className="text-xs">{formatPercent(rate)}</span>
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
      <div>
        <h1 className={cn(
          'text-2xl font-bold',
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}>
          Yetkazib berish Samaradorligi
        </h1>
        <p className={cn(
          'text-sm mt-1',
          theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
        )}>
          Tashuvchilar bo'yicha samaradorlik tahlili
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Truck className="text-primary-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Tashuvchilar
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {data?.length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Package className="text-blue-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Buyurtmalar
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {formatNumber(totalOrders)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <DollarSign className="text-green-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Jami yuk haqi
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {formatCurrency(totalFreight)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Clock className="text-purple-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                O'rtacha yetkazish
              </p>
              <p className={cn('text-xl font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {avgDeliveryDays.toFixed(1)} kun
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <div>
              <p className={cn('text-xs', theme === 'dark' ? 'text-slate-400' : 'text-gray-500')}>
                Eng tez
              </p>
              <p className={cn('text-lg font-bold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                {bestShipper?.shipper_name || '-'}
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
            Buyurtmalar taqsimoti
          </h3>
          {loading ? (
            <div className="h-[300px] skeleton rounded-lg" />
          ) : (
            <PieChart data={pieData} donut height={300} />
          )}
        </Card>

        <Card className="p-6">
          <h3 className={cn(
            'text-lg font-semibold mb-4',
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          )}>
            Yuk haqi taqqoslash
          </h3>
          {loading ? (
            <div className="h-[300px] skeleton rounded-lg" />
          ) : (
            <BarChart
              data={barData}
              xKey="name"
              yKey="value"
              colorByValue
              height={300}
            />
          )}
        </Card>
      </div>

      {/* Shipper Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data?.map((shipper, idx) => (
          <Card key={shipper.shipper_id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${CHART_COLORS[idx]}20` }}
                >
                  <Truck style={{ color: CHART_COLORS[idx] }} size={20} />
                </div>
                <h4 className={cn(
                  'font-semibold',
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  {shipper.shipper_name}
                </h4>
              </div>
              {bestShipper?.shipper_id === shipper.shipper_id && (
                <Badge variant="success">Eng yaxshi</Badge>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>
                  Buyurtmalar
                </span>
                <span className={cn('font-semibold', theme === 'dark' ? 'text-white' : 'text-gray-900')}>
                  {formatNumber(shipper.total_orders)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>
                  Jami yuk haqi
                </span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(shipper.total_freight)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>
                  O'rtacha yetkazish
                </span>
                <span className={cn(
                  'font-semibold',
                  shipper.avg_delivery_days < avgDeliveryDays ? 'text-green-600' : 'text-orange-600'
                )}>
                  {(shipper.avg_delivery_days || 0).toFixed(1)} kun
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>
                    O'z vaqtida yetkazish
                  </span>
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    {formatPercent(shipper.on_time_delivery_rate || 85)}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${shipper.on_time_delivery_rate || 85}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

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
            Tashuvchilar ro'yxati
          </h3>
        </div>
        <Table<ShippingEfficiencyType>
          columns={columns}
          data={data || []}
          loading={loading}
        />
      </Card>
    </div>
  );
}
