
import {
  Treemap as RechartsTreemap,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useTheme } from '@/contexts';
import { formatCompactCurrency } from '@/utils/formatters';
import { CHART_COLORS } from '@/utils/constants';

interface TreemapDataItem {
  name: string;
  value: number;
  children?: TreemapDataItem[];
  [key: string]: unknown;
}

interface TreemapProps {
  data: TreemapDataItem[];
  dataKey?: string;
  aspectRatio?: number;
  height?: number;
}

// Custom content renderer for treemap cells
interface CustomContentProps {
  root?: TreemapDataItem;
  depth?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  name?: string;
  value?: number;
}

const CustomContent = ({
  depth = 0,
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  index = 0,
  name = '',
  value = 0,
}: CustomContentProps) => {
  const color = CHART_COLORS[index % CHART_COLORS.length];
  const fontSize = Math.min(width / 10, height / 4, 14);
  const showText = width > 60 && height > 40;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        stroke="#fff"
        strokeWidth={2}
        rx={4}
        ry={4}
        style={{
          opacity: depth === 1 ? 0.9 : 0.7,
          cursor: 'pointer',
        }}
      />
      {showText && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - fontSize / 2}
            textAnchor="middle"
            fill="#fff"
            fontSize={fontSize}
            fontWeight={600}
          >
            {name.length > 15 ? name.slice(0, 15) + '...' : name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + fontSize / 2 + 4}
            textAnchor="middle"
            fill="#fff"
            fontSize={fontSize * 0.8}
            opacity={0.8}
          >
            {formatCompactCurrency(value)}
          </text>
        </>
      )}
    </g>
  );
};

export function Treemap({
  data,
  dataKey = 'value',
  height = 400,
}: TreemapProps) {
  const { theme } = useTheme();

  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsTreemap
        data={data}
        dataKey={dataKey}
        aspectRatio={4 / 3}
        stroke="#fff"
        content={<CustomContent />}
      >
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value) => [formatCompactCurrency(value as number), 'Revenue']}
        />
      </RechartsTreemap>
    </ResponsiveContainer>
  );
}
