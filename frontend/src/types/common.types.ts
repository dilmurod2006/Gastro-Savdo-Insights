import { LucideIcon } from 'lucide-react';

/**
 * Common Types
 */

// Theme
export type Theme = 'light' | 'dark';

// Loading State
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Table Column
export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

// Pagination
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

// Sort
export interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

// KPI Card Props
export interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  format?: 'number' | 'currency' | 'percent';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  loading?: boolean;
}

// Badge Variant
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

// Button Variant
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

// Sidebar Menu Item
export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  children?: MenuItem[];
}

// Chart Data Point
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

// Select Option
export interface SelectOption {
  value: string | number;
  label: string;
}

// Filter State
export interface FilterState {
  limit?: number;
  referenceDate?: string;
  minOccurrences?: number;
  minOrders?: number;
}
