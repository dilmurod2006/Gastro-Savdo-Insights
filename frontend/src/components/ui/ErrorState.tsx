
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { useTheme } from '@/contexts';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Xatolik yuz berdi',
  message = "Ma'lumotlarni yuklashda xatolik. Iltimos, qaytadan urinib ko'ring.",
  onRetry,
  className,
}: ErrorStateProps) {
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
          theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'
        )}
      >
        <AlertCircle size={32} className="text-red-500" />
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
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw size={16} />
          Qaytadan urinish
        </Button>
      )}
    </div>
  );
}
