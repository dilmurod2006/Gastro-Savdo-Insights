
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { useTheme } from '@/contexts';
import type { SelectOption } from '@/types/common.types';

interface SelectProps {
  options: SelectOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Tanlang...',
  label,
  className,
  disabled = false,
}: SelectProps) {
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
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn(
            'w-full appearance-none rounded-lg px-4 py-2.5 pr-10',
            'text-sm font-medium border transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            disabled && 'opacity-50 cursor-not-allowed',
            theme === 'dark'
              ? 'bg-slate-800 border-slate-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          )}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none',
            theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
          )}
        >
          <ChevronDown size={18} />
        </div>
      </div>
    </div>
  );
}
