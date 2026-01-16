
import {
  LineChart as RechartsLineChart,
  Line,
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

interface LineConfig {
  dataKey: string;
  color?: string;
  name?: string;
  dashed?: boolean;
  dot?: boolean;
}

interface LineChartProps {
  data: Record<string, unknown>[];
  xKey: string;
  lines: LineConfig[];
  xLabel?: string;
  yLabel?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  formatAsAmount?: boolean;
  height?: number;
}

export function LineChart({
  data,
  xKey,
  lines,
  xLabel,
  yLabel,
  showGrid = true,
  showLegend = false,
  formatAsAmount = true,
  height = 300,
}: LineChartProps) {
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
      <RechartsLineChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
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

        {lines.map((line, index) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color || CHART_COLORS[index % CHART_COLORS.length]}
            strokeWidth={2}
            strokeDasharray={line.dashed ? '5 5' : undefined}
            dot={line.dot !== false ? { r: 4, fill: line.color || CHART_COLORS[index % CHART_COLORS.length] } : false}
            name={line.name || line.dataKey}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
