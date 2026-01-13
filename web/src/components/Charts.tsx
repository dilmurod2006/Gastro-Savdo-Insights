/**
 * Reusable Chart Components
 * Professional styled chart wrappers with TypeScript support
 */

import React, { ReactNode } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Treemap,
} from 'recharts';
import { LucideIcon } from 'lucide-react';

// Professional color palettes
export const COLORS = {
  primary: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'],
  success: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'],
  warning: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'],
  danger: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'],
  purple: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'],
  gradient: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'],
  rainbow: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384'],
};

// Types
interface TooltipPayloadItem {
  color?: string;
  name?: string;
  value?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  formatter?: (value: number) => string;
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

interface BarConfig {
  key: string;
  name: string;
  color?: string;
}

interface LineConfig {
  key: string;
  name: string;
  color?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartData = any[];

interface BarChartProps {
  data: ChartData;
  xKey: string;
  bars: BarConfig[];
  height?: number;
  stacked?: boolean;
  horizontal?: boolean;
  formatter?: (value: number) => string;
}

interface LineChartProps {
  data: ChartData;
  xKey: string;
  lines: LineConfig[];
  height?: number;
  showArea?: boolean;
  formatter?: (value: number) => string;
}

interface PieChartProps {
  data: ChartData;
  dataKey: string;
  nameKey: string;
  height?: number;
  showLabels?: boolean;
  donut?: boolean;
  colors?: string[];
}

interface RadarChartProps {
  data: ChartData;
  dataKey: string;
  nameKey: string;
  height?: number;
  color?: string;
}

interface ComposedChartProps {
  data: ChartData;
  xKey: string;
  bars?: BarConfig[];
  lines?: LineConfig[];
  height?: number;
  formatter?: (value: number) => string;
}

interface TreemapProps {
  data: ChartData;
  dataKey: string;
  nameKey: string;
  height?: number;
  colors?: string[];
}

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
}

interface ChartSkeletonProps {
  height?: number;
}

interface EmptyStateProps {
  message?: string;
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

// Custom Tooltip Component
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white/95 backdrop-blur-sm shadow-xl rounded-xl p-3 border border-slate-200">
      <p className="text-slate-600 font-medium text-sm mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={`tooltip-${index}`} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-500">{entry.name}:</span>
          <span className="font-semibold text-slate-700">
            {formatter ? formatter(entry.value || 0) : entry.value?.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

// Chart Card Wrapper
export function ChartCard({ title, subtitle, children, className = '', actions }: ChartCardProps): React.ReactElement {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between p-4 lg:p-5 border-b border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-800 text-base lg:text-lg">{title}</h3>
          {subtitle && <p className="text-slate-500 text-xs lg:text-sm mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-4 lg:p-5 overflow-x-auto">
        <div className="min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}

// Bar Chart Component
export function BarChartComponent({
  data,
  xKey,
  bars,
  height = 300,
  stacked = false,
  horizontal = false,
  formatter,
}: BarChartProps): React.ReactElement {
  const layout = horizontal ? 'vertical' : 'horizontal';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={layout} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        {horizontal ? (
          <>
            <XAxis type="number" tick={{ fill: '#64748B', fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey={xKey}
              tick={{ fill: '#64748B', fontSize: 12 }}
              width={100}
            />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fill: '#64748B', fontSize: 12 }} />
            <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
          </>
        )}
        <Tooltip content={<CustomTooltip formatter={formatter} />} />
        <Legend />
        {bars.map((bar, index) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.name}
            fill={bar.color || COLORS.gradient[index]}
            radius={[4, 4, 0, 0]}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// Line Chart Component
export function LineChartComponent({
  data,
  xKey,
  lines,
  height = 300,
  showArea = false,
  formatter,
}: LineChartProps): React.ReactElement {
  const ChartType = showArea ? AreaChart : LineChart;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartType data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          {lines.map((line, index) => (
            <linearGradient key={line.key} id={`gradient-${line.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={line.color || COLORS.gradient[index]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={line.color || COLORS.gradient[index]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey={xKey} tick={{ fill: '#64748B', fontSize: 12 }} />
        <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
        <Tooltip content={<CustomTooltip formatter={formatter} />} />
        <Legend />
        {lines.map((line, index) => {
          const color = line.color || COLORS.gradient[index];
          return showArea ? (
            <Area
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={color}
              fill={`url(#gradient-${line.key})`}
              strokeWidth={2}
            />
          ) : (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          );
        })}
      </ChartType>
    </ResponsiveContainer>
  );
}

// Pie Chart Component
export function PieChartComponent({
  data,
  dataKey,
  nameKey,
  height = 300,
  showLabels = true,
  donut = false,
  colors = COLORS.gradient,
}: PieChartProps): React.ReactElement {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          innerRadius={donut ? '60%' : 0}
          outerRadius="80%"
          paddingAngle={2}
          label={showLabels ? (props: { name?: string; percent?: number }) => `${props.name || ''} (${((props.percent || 0) * 100).toFixed(0)}%)` : undefined}
          labelLine={showLabels}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Radar Chart Component
export function RadarChartComponent({
  data,
  dataKey,
  nameKey,
  height = 300,
  color = COLORS.primary[0],
}: RadarChartProps): React.ReactElement {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="80%">
        <PolarGrid stroke="#E2E8F0" />
        <PolarAngleAxis dataKey={nameKey} tick={{ fill: '#64748B', fontSize: 11 }} />
        <PolarRadiusAxis tick={{ fill: '#64748B', fontSize: 10 }} />
        <Radar
          name="Score"
          dataKey={dataKey}
          stroke={color}
          fill={color}
          fillOpacity={0.3}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// Composed Chart (Bar + Line)
export function ComposedChartComponent({
  data,
  xKey,
  bars = [],
  lines = [],
  height = 300,
  formatter,
}: ComposedChartProps): React.ReactElement {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey={xKey} tick={{ fill: '#64748B', fontSize: 12 }} />
        <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
        <Tooltip content={<CustomTooltip formatter={formatter} />} />
        <Legend />
        {bars.map((bar, index) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.name}
            fill={bar.color || COLORS.primary[index]}
            radius={[4, 4, 0, 0]}
          />
        ))}
        {lines.map((line, index) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name}
            stroke={line.color || COLORS.danger[index]}
            strokeWidth={2}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// Treemap Component
export function TreemapComponent({ 
  data, 
  dataKey, 
  nameKey, 
  height = 300, 
  colors = COLORS.gradient 
}: TreemapProps): React.ReactElement {
  interface ContentProps {
    x: number;
    y: number;
    width: number;
    height: number;
    name?: string;
    value?: number;
    index: number;
  }

  const CustomizedContent: React.FC<ContentProps> = ({ x, y, width, height, name, value, index }) => {
    if (width < 50 || height < 30) return null;
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={colors[index % colors.length]}
          stroke="#fff"
          strokeWidth={2}
          rx={4}
        />
        <text
          x={x + width / 2}
          y={y + height / 2 - 8}
          textAnchor="middle"
          fill="#fff"
          fontSize={12}
          fontWeight="bold"
        >
          {name}
        </text>
        <text
          x={x + width / 2}
          y={y + height / 2 + 10}
          textAnchor="middle"
          fill="#fff"
          fontSize={11}
        >
          {value?.toLocaleString()}
        </text>
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <Treemap
        data={data}
        dataKey={dataKey}
        nameKey={nameKey}
        aspectRatio={4 / 3}
        content={<CustomizedContent x={0} y={0} width={0} height={0} index={0} />}
      />
    </ResponsiveContainer>
  );
}

// KPI Card Component
export function KpiCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon, 
  color = 'blue' 
}: KpiCardProps): React.ReactElement {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    indigo: 'from-indigo-500 to-indigo-600',
  };

  const changeColors: Record<string, string> = {
    positive: 'text-green-600 bg-green-100',
    negative: 'text-red-600 bg-red-100',
    neutral: 'text-slate-600 bg-slate-100',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {change && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${changeColors[changeType]}`}>
              {changeType === 'positive' ? '↑' : changeType === 'negative' ? '↓' : '→'} {change}
            </span>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          {Icon && <Icon className="w-6 h-6 text-white" />}
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton
export function ChartSkeleton({ height = 300 }: ChartSkeletonProps): React.ReactElement {
  return (
    <div className="animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
      <div className="bg-slate-100 rounded-xl" style={{ height }}></div>
    </div>
  );
}

// Empty State
export function EmptyState({ message = "Ma'lumot topilmadi" }: EmptyStateProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
      <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-lg font-medium">{message}</p>
    </div>
  );
}

// Error State
export function ErrorState({ message = 'Xatolik yuz berdi', onRetry }: ErrorStateProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p className="text-slate-600 font-medium mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Qayta urinish
        </button>
      )}
    </div>
  );
}
