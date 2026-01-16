import React from 'react';
import { Inbox, LucideIcon } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { useTheme } from '@/contexts';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title = "Ma'lumot topilmadi",
  message = "Hozircha ko'rsatish uchun ma'lumot yo'q.",
  action,
  className,
}: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center mb-4',
          theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'
        )}
      >
        <Icon
          size={32}
          className={theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}
        />
      </div>
      <h3
        className={cn(
          'text-lg font-semibold mb-2',
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          'text-sm mb-6 max-w-md',
          theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
        )}
      >
        {message}
      </p>
      {action}
    </div>
  );
}
