
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from '@/contexts';
import { formatCompactCurrency, formatCompactNumber } from '@/utils/formatters';
import { CHART_COLORS } from '@/utils/constants';

interface AreaConfig {
  dataKey: string;
  color?: string;
  name?: string;
  gradient?: boolean;
}

interface AreaChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  areas: AreaConfig[];
  xLabel?: string;
  yLabel?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  formatAsAmount?: boolean;
  stacked?: boolean;
  height?: number;
}

export function AreaChart({
  data,
  xKey,
  areas,
  xLabel,
  yLabel,
  showGrid = true,
  showLegend = false,
  formatAsAmount = true,
  stacked = false,
  height = 300,
}: AreaChartProps) {
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

  const formatValue = formatAsAmount ? formatCompactCurrency : formatCompactNumber;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          {areas.map((area, index) => {
            const color = area.color || CHART_COLORS[index % CHART_COLORS.length];
            return (
              <linearGradient
                key={`gradient-${area.dataKey}`}
                id={`gradient-${area.dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            );
          })}
        </defs>

        {showGrid && <CartesianGrid {...gridStyle} />}

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

        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: theme === 'dark' ? '#f1f5f9' : '#1e293b', fontWeight: 600 }}
          formatter={(value, name) => [formatValue(value as number), name]}
        />

        {showLegend && <Legend />}

        {areas.map((area, index) => {
          const color = area.color || CHART_COLORS[index % CHART_COLORS.length];
          return (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              stroke={color}
              strokeWidth={2}
              fill={area.gradient !== false ? `url(#gradient-${area.dataKey})` : color}
              fillOpacity={area.gradient !== false ? 1 : 0.3}
              stackId={stacked ? 'stack' : undefined}
              name={area.name || area.dataKey}
            />
          );
        })}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
