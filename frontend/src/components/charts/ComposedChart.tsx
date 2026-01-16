
import {
  ComposedChart as RechartsComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from '@/contexts';
import { formatCompactCurrency, formatCompactNumber, formatPercent } from '@/utils/formatters';
import { CHART_COLORS } from '@/utils/constants';

interface ComposedChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  barKey: string;
  lineKey: string;
  barName?: string;
  lineName?: string;
  barColor?: string;
  lineColor?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  formatBarAsAmount?: boolean;
  formatLineAsPercent?: boolean;
  height?: number;
}

export function ComposedChart({
  data,
  xKey,
  barKey,
  lineKey,
  barName = 'Revenue',
  lineName = 'Growth %',
  barColor = CHART_COLORS[0],
  lineColor = CHART_COLORS[1],
  showGrid = true,
  showLegend = true,
  formatBarAsAmount = true,
  formatLineAsPercent = true,
  height = 300,
}: ComposedChartProps) {
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

  const formatBarValue = formatBarAsAmount ? formatCompactCurrency : formatCompactNumber;
  const formatLineValue = formatLineAsPercent
    ? (v: number) => formatPercent(v)
    : formatCompactNumber;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsComposedChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        {showGrid && <CartesianGrid {...gridStyle} />}

        <XAxis dataKey={xKey} tick={axisStyle} />

        <YAxis
          yAxisId="left"
          tick={axisStyle}
          tickFormatter={(v) => formatBarValue(v)}
        />

        <YAxis
          yAxisId="right"
          orientation="right"
          tick={axisStyle}
          tickFormatter={(v) => formatLineValue(v)}
        />

        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: theme === 'dark' ? '#f1f5f9' : '#1e293b', fontWeight: 600 }}
          formatter={(value, name) => {
            if (name === barName) return [formatBarValue(value as number), name];
            return [formatLineValue(value as number), name];
          }}
        />

        {showLegend && <Legend />}

        <Bar
          yAxisId="left"
          dataKey={barKey}
          fill={barColor}
          name={barName}
          radius={[4, 4, 0, 0]}
        />

        <Line
          yAxisId="right"
          type="monotone"
          dataKey={lineKey}
          stroke={lineColor}
          strokeWidth={2}
          name={lineName}
          dot={{ r: 4, fill: lineColor }}
          activeDot={{ r: 6 }}
        />
      </RechartsComposedChart>
    </ResponsiveContainer>
  );
}
