/**
 * Number Formatters
 */

// Currency formatter (USD)
// Safe number parser
function safeNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

// Currency formatter (USD)
export function formatCurrency(
  value: number | string | undefined | null,
  locale: string = 'en-US',
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(safeNumber(value));
}

// Compact currency (e.g., $1.2M)
export function formatCompactCurrency(value: number | string | undefined | null): string {
  const num = safeNumber(value);
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(1)}K`;
  }
  return `$${num.toFixed(0)}`;
}

// Number with commas
export function formatNumber(value: number | string | undefined | null): string {
  return new Intl.NumberFormat('en-US').format(safeNumber(value));
}

// Compact number (e.g., 1.2K, 3.5M)
export function formatCompactNumber(value: number | string | undefined | null): string {
  const num = safeNumber(value);
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toFixed(0);
}

// Percentage formatter
export function formatPercent(value: number | string | undefined | null, decimals: number = 1): string {
  return `${safeNumber(value).toFixed(decimals)}%`;
}

// Decimal formatter
export function formatDecimal(value: number | string | undefined | null, decimals: number = 2): string {
  return safeNumber(value).toFixed(decimals);
}

/**
 * Date Formatters
 */

// Format date to locale string
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', options);
}

// Format to YYYY-MM-DD
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Format month-year
export function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

// Days ago
export function formatDaysAgo(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

/**
 * Trend Helpers
 */

// Get trend direction
export function getTrendDirection(current: number, previous: number): 'up' | 'down' | 'neutral' {
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'neutral';
}

// Calculate percentage change
export function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Color Helpers
 */

// Get color by value (for heat maps, etc.)
export function getColorByValue(
  value: number,
  min: number,
  max: number,
  colors: string[] = ['#ef4444', '#f59e0b', '#10b981']
): string {
  const normalized = (value - min) / (max - min);
  const index = Math.min(
    Math.floor(normalized * colors.length),
    colors.length - 1
  );
  return colors[index];
}

// Get risk level color
export function getRiskColor(level: 'low' | 'medium' | 'high'): string {
  const colors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
  };
  return colors[level];
}

// Get ABC category color
export function getABCColor(category: 'A' | 'B' | 'C'): string {
  const colors = {
    A: '#10b981',
    B: '#f59e0b',
    C: '#ef4444',
  };
  return colors[category];
}

// Get segment color
export function getSegmentColor(segment: string): string {
  const colors: Record<string, string> = {
    'Champions': '#10b981',
    'Loyal': '#3b82f6',
    'New': '#8b5cf6',
    'Promising': '#6366f1',
    'At Risk': '#f59e0b',
    'Lost': '#ef4444',
    'Hibernating': '#64748b',
    'Need Attention': '#ec4899',
  };
  return colors[segment] || '#94a3b8';
}
