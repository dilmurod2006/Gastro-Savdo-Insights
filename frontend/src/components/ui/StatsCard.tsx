import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ElementType;
  trend?: number; // percentage
  trendLabel?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

const colorMap = {
  blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  green: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
};

export function StatsCard({ title, value, icon: Icon, trend, trendLabel, color = 'blue' }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-dark-card rounded-xl p-6 border border-gray-200 dark:border-dark-border shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        {Icon && (
          <div className={cn("p-2 rounded-lg", colorMap[color])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        
        {(trend !== undefined) && (
          <div className="flex items-center mt-1 gap-2">
            <span className={cn(
              "flex items-center text-xs font-medium",
              trend >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {trend >= 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
              {Math.abs(trend)}%
            </span>
            <span className="text-xs text-gray-400">{trendLabel || 'vs last month'}</span>
          </div>
        )}
      </div>
    </div>
  );
}
