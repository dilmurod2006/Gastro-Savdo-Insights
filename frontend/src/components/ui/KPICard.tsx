import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { useTheme } from '@/contexts';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/formatters';
import type { KPICardProps } from '@/types/common.types';

export function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  format = 'number',
  color = 'blue',
  loading = false,
}: KPICardProps) {
  const { theme } = useTheme();

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    indigo: 'from-indigo-500 to-indigo-600',
  };

  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'percent':
        return formatPercent(val);
      default:
        return formatNumber(val);
    }
  };

  if (loading) {
    return (
      <div
        className={cn(
          'rounded-xl p-5 border',
          theme === 'dark'
            ? 'bg-slate-800 border-slate-700'
            : 'bg-white border-gray-200'
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-4 w-24 skeleton rounded mb-3" />
            <div className="h-8 w-32 skeleton rounded mb-2" />
            <div className="h-4 w-20 skeleton rounded" />
          </div>
          <div className="w-12 h-12 skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl p-5 border transition-all duration-200',
        'hover:shadow-lg hover:-translate-y-0.5',
        theme === 'dark'
          ? 'bg-slate-800 border-slate-700 hover:border-slate-600'
          : 'bg-white border-gray-200 hover:border-gray-300'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p
            className={cn(
              'text-sm font-medium mb-1',
              theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
            )}
          >
            {title}
          </p>
          <p
            className={cn(
              'text-2xl font-bold mb-2',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            )}
          >
            {formatValue(value)}
          </p>
          {trend && (
            <div className="flex items-center gap-1">
              {trend.direction === 'up' ? (
                <TrendingUp size={16} className="text-green-500" />
              ) : (
                <TrendingDown size={16} className="text-red-500" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.direction === 'up' ? 'text-green-500' : 'text-red-500'
                )}
              >
                {formatPercent(Math.abs(trend.value))}
              </span>
              <span
                className={cn(
                  'text-xs',
                  theme === 'dark' ? 'text-slate-500' : 'text-gray-400'
                )}
              >
                vs oldingi
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            'bg-gradient-to-br',
            colorClasses[color]
          )}
        >
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
}
