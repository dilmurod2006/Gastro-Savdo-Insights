
import { Calendar } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { useTheme } from '@/contexts';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  label,
  className,
  min,
  max,
  disabled = false,
}: DatePickerProps) {
  const { theme } = useTheme();

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label
          className={cn(
            'block text-sm font-medium mb-1.5',
            theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
          )}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          disabled={disabled}
          className={cn(
            'w-full rounded-lg px-4 py-2.5 pl-10',
            'text-sm font-medium border transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            disabled && 'opacity-50 cursor-not-allowed',
            theme === 'dark'
              ? 'bg-slate-800 border-slate-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          )}
        />
        <div
          className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none',
            theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
          )}
        >
          <Calendar size={18} />
        </div>
      </div>
    </div>
  );
}
