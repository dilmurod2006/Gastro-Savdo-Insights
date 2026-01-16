import { cn } from '@/utils/cn';
import { useTheme } from '@/contexts';

interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T, index: number) => void;
  className?: string;
  stickyHeader?: boolean;
}

export function Table<T extends object>({
  columns,
  data,
  loading = false,
  emptyMessage = "Ma'lumot topilmadi",
  onRowClick,
  className,
  stickyHeader = false,
}: TableProps<T>) {
  const { theme } = useTheme();

  const getNestedValue = (obj: T, path: string): unknown => {
    return path.split('.').reduce((acc: unknown, part) => {
      if (acc && typeof acc === 'object') {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, obj);
  };

  if (loading) {
    return (
      <div className={cn('overflow-x-auto', className)}>
        <table className="w-full" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr className={cn(
              'border-b',
              theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
            )}>
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={cn(
                    'px-4 py-3',
                    theme === 'dark' ? 'bg-slate-800' : 'bg-gray-50'
                  )}
                  style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
                >
                  <div className="h-4 skeleton rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  'border-b',
                  theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
                )}
              >
                {columns.map((col, colIndex) => (
                  <td 
                    key={colIndex} 
                    className="px-4 py-3"
                    style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
                  >
                    <div className="h-4 skeleton rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn(
        'flex items-center justify-center py-12 text-center',
        theme === 'dark' ? 'text-slate-400' : 'text-gray-500',
        className
      )}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full" style={{ tableLayout: 'fixed' }}>
        <thead className={stickyHeader ? 'sticky top-0 z-10' : ''}>
          <tr className={cn(
            'border-b',
            theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
          )}>
            {columns.map((col, i) => (
              <th
                key={i}
                className={cn(
                  'px-4 py-3 text-xs font-semibold uppercase tracking-wider',
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right',
                  theme === 'dark' 
                    ? 'bg-slate-800 text-slate-300' 
                    : 'bg-gray-50 text-gray-600'
                )}
                style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row, rowIndex)}
              className={cn(
                'border-b transition-colors',
                theme === 'dark' ? 'border-slate-700/50' : 'border-gray-100',
                onRowClick && 'cursor-pointer',
                theme === 'dark'
                  ? 'hover:bg-slate-800/50'
                  : 'hover:bg-gray-50'
              )}
            >
              {columns.map((col, colIndex) => {
                const value = getNestedValue(row, col.key as string);
                return (
                  <td
                    key={colIndex}
                    className={cn(
                      'px-4 py-3 text-sm',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
                      theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                    )}
                    style={{ width: col.width, minWidth: col.width, maxWidth: col.width }}
                  >
                    {col.render ? col.render(value, row, rowIndex) : String(value ?? '')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
