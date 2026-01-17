
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { useTheme } from '@/contexts';
import { formatCompactCurrency, formatCompactNumber } from '@/utils/formatters';
import { CHART_COLORS } from '@/utils/constants';

interface BarChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  yKey2?: string;
  xLabel?: string;
  yLabel?: string;
  color?: string;
  color2?: string;
  horizontal?: boolean;
  stacked?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  formatAsAmount?: boolean;
  height?: number;
  exact?: boolean;
  colorByValue?: boolean;
}

export function BarChart({
  data,
  xKey,
  yKey,
  yKey2,
  xLabel,
  yLabel,
  color = CHART_COLORS[0],
  color2 = CHART_COLORS[1],
  horizontal = false,
  stacked = false,
  showGrid = true,
  showLegend = false,
  formatAsAmount = true,
  height = 300,
  exact = false,
  colorByValue = false,
}: BarChartProps) {
  const { theme } = useTheme();

  const axisStyle = {
    fontSize: 12,
    fill: theme === 'dark' ? '#94a3b8' : '#64748b',
  };

  const gridStyle = {
    stroke: theme === 'dark' ? '#334155' : '#e2e8f0',
    strokeDasharray: '3 3',
  };

  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  };

  const formatValue = (v: number | string) => {
    if (typeof v === 'string') return v;
    if (exact) {
      return formatAsAmount 
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)
        : new Intl.NumberFormat('en-US').format(v);
    }
    return formatAsAmount ? formatCompactCurrency(v) : formatCompactNumber(v);
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        {showGrid && <CartesianGrid {...gridStyle} />}
        
        {horizontal ? (
          <>
            <XAxis
              type="number"
              tick={axisStyle}
              tickFormatter={(v) => formatValue(v)}
              label={xLabel ? { value: xLabel, position: 'bottom', style: axisStyle } : undefined}
            />
            <YAxis
              type="category"
              dataKey={xKey}
              tick={axisStyle}
              width={120}
              label={yLabel ? { value: yLabel, angle: -90, position: 'left', style: axisStyle } : undefined}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey={xKey}
              tick={axisStyle}
              label={xLabel ? { value: xLabel, position: 'bottom', style: axisStyle } : undefined}
            />
            <YAxis
              tick={axisStyle}
              tickFormatter={(v) => formatValue(v)}
              label={yLabel ? { value: yLabel, angle: -90, position: 'left', style: axisStyle } : undefined}
            />
          </>
        )}

        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: theme === 'dark' ? '#f1f5f9' : '#1e293b', fontWeight: 600 }}
          formatter={(value) => [formatValue(value as number), '']}
        />

        {showLegend && <Legend />}

        <Bar
          dataKey={yKey}
          fill={color}
          radius={[4, 4, 0, 0]}
          stackId={stacked ? 'stack' : undefined}
        >
          {colorByValue &&
            data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
        </Bar>

        {yKey2 && (
          <Bar
            dataKey={yKey2}
            fill={color2}
            radius={[4, 4, 0, 0]}
            stackId={stacked ? 'stack' : undefined}
          />
        )}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
