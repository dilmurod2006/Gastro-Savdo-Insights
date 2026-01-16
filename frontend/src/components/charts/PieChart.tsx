
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from '@/contexts';
import { formatCompactCurrency, formatPercent } from '@/utils/formatters';
import { CHART_COLORS } from '@/utils/constants';

interface PieChartProps {
  data: { name: string; value: number; color?: string }[];
  dataKey?: string;
  nameKey?: string;
  showLegend?: boolean;
  showLabels?: boolean;
  donut?: boolean;
  formatAsAmount?: boolean;
  height?: number;
}

export function PieChart({
  data,
  dataKey = 'value',
  nameKey = 'name',
  showLegend = true,
  showLabels = false,
  donut = false,
  formatAsAmount = true,
  height = 300,
}: PieChartProps) {
  const { theme } = useTheme();

  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
    border: `2px solid ${theme === 'dark' ? '#475569' : '#cbd5e1'}`,
    borderRadius: '12px',
    boxShadow: theme === 'dark' 
      ? '0 10px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.4)' 
      : '0 10px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    padding: '12px 16px',
    color: theme === 'dark' ? '#f1f5f9' : '#1e293b',
    fontSize: '14px',
    fontWeight: 500,
  };

  const formatValue = formatAsAmount ? formatCompactCurrency : (v: number) => v.toLocaleString();

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    percent?: number;
  }) => {
    if (!cx || !cy || midAngle === undefined || !innerRadius || !outerRadius || !percent || percent < 0.03) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={600}
      >
        {formatPercent(percent * 100, 1)}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          innerRadius={donut ? '60%' : 0}
          outerRadius="80%"
          paddingAngle={2}
          label={showLabels ? renderCustomLabel : undefined}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>

        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ 
            color: theme === 'dark' ? '#e2e8f0' : '#334155',
            fontWeight: 600,
            marginBottom: '4px'
          }}
          itemStyle={{ 
            color: theme === 'dark' ? '#f8fafc' : '#1e293b',
            fontWeight: 500
          }}
          formatter={(value, name) => [
            `${formatValue(value as number)} (${formatPercent(((value as number) / total) * 100)})`,
            name,
          ]}
        />

        {showLegend && (
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: 12 }}
          />
        )}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
