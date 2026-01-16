
import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { useTheme } from '@/contexts';
import { CHART_COLORS } from '@/utils/constants';

interface RadarConfig {
  dataKey: string;
  color?: string;
  name?: string;
  fillOpacity?: number;
}

interface RadarChartProps {
  data: Record<string, unknown>[];
  angleKey: string;
  radars: RadarConfig[];
  showLegend?: boolean;
  height?: number;
}

export function RadarChart({
  data,
  angleKey,
  radars,
  showLegend = false,
  height = 300,
}: RadarChartProps) {
  const { theme } = useTheme();

  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadarChart data={data}>
        <PolarGrid stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
        <PolarAngleAxis
          dataKey={angleKey}
          tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }}
        />
        <PolarRadiusAxis
          tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 10 }}
          angle={30}
        />

        <Tooltip contentStyle={tooltipStyle} />

        {radars.map((radar, index) => {
          const color = radar.color || CHART_COLORS[index % CHART_COLORS.length];
          return (
            <Radar
              key={radar.dataKey}
              name={radar.name || radar.dataKey}
              dataKey={radar.dataKey}
              stroke={color}
              fill={color}
              fillOpacity={radar.fillOpacity ?? 0.3}
            />
          );
        })}

        {showLegend && <Legend />}
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
