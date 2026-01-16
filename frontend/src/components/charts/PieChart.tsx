
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
    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
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
    if (!cx || !cy || midAngle === undefined || !innerRadius || !outerRadius || !percent || percent < 0.05) return null;
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
        fontSize={12}
        fontWeight={600}
      >
        {formatPercent(percent * 100, 0)}
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
