import React from 'react';
import { cn } from '@/utils/helpers';
import { useTheme } from '@/contexts';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({
  children,
  content,
  position = 'top',
  className,
}: TooltipProps) {
  const { theme } = useTheme();

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-current border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-current border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-current border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-current border-y-transparent border-l-transparent',
  };

  return (
    <div className={cn('relative inline-block group', className)}>
      {children}
      <div
        className={cn(
          'absolute z-50 px-3 py-1.5 text-sm font-medium rounded-lg',
          'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
          'transition-all duration-200 whitespace-nowrap',
          positionClasses[position],
          theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-gray-900 text-white'
        )}
      >
        {content}
        <div
          className={cn(
            'absolute w-0 h-0 border-4',
            arrowClasses[position],
            theme === 'dark' ? 'text-slate-700' : 'text-gray-900'
          )}
        />
      </div>
    </div>
  );
}
