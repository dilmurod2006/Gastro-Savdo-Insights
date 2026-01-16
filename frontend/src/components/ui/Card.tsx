import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  footer?: ReactNode;
}

export function Card({ children, className, title, description, footer }: CardProps) {
  return (
    <div className={cn("bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border shadow-sm", className)}>
      {(title || description) && (
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          {title && <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{title}</h3>}
          {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  );
}
