import { useRequest as useApi, useRequest as useApiSingle } from './useApi';
import { analyticsService } from '@/services/api';
import {
  BusinessKPI,
  TopRevenueProduct,
  ABCAnalysisProduct,
  MarketBasketItem,
  DiscontinuedProduct,
  TopCustomerByCountry,
  RFMCustomer,
  RetentionCustomer,
  DiscountBehaviorCustomer,
  EmployeeMonthlySales,
  EmployeeHierarchy,
  YoYGrowth,
  DayOfWeekPattern,
  DiscountImpact,
  TerritoryPerformance,
  CategoryMonthlyGrowth,
  CategoryCountryBreakdown,
  SupplierPerformance,
  SupplierRisk,
  ShipperEfficiency
} from '@/types/analytics.types';

/**
 * Dashboard Hooks
 */
export function useBusinessKPIs() {
  return useApiSingle<BusinessKPI>(
    () => analyticsService.getBusinessKPIs(),
    []
  );
}

/**
 * Products Hooks
 */
export function useTopRevenueProducts(limit: number = 10) {
  return useApi<TopRevenueProduct[]>(
    () => analyticsService.getTopRevenueProducts(limit),
    [limit]
  );
}

export function useABCAnalysis() {
  return useApi<ABCAnalysisProduct[]>(
    () => analyticsService.getABCAnalysis(),
    []
  );
}

export function useMarketBasket(minOccurrences: number = 5, limit: number = 20) {
  return useApi<MarketBasketItem[]>(
    () => analyticsService.getMarketBasket(minOccurrences, limit),
    [minOccurrences, limit]
  );
}

export function useDiscontinuedAnalysis() {
  return useApi<DiscontinuedProduct[]>(
    () => analyticsService.getDiscontinuedAnalysis(),
    []
  );
}

/**
 * Customers Hooks
 */
export function useTopByCountry() {
  return useApi<TopCustomerByCountry[]>(
    () => analyticsService.getTopByCountry(),
    []
  );
}

export function useRFMSegmentation(referenceDate?: string) {
  return useApi<RFMCustomer[]>(
    () => analyticsService.getRFMSegmentation(referenceDate),
    [referenceDate]
  );
}

export function useRetentionAnalysis() {
  return useApi<RetentionCustomer[]>(
    () => analyticsService.getRetentionAnalysis(),
    []
  );
}

export function useDiscountBehavior(limit: number = 50) {
  return useApi<DiscountBehaviorCustomer[]>(
    () => analyticsService.getDiscountBehavior(limit),
    [limit]
  );
}

/**
 * Employees Hooks
 */
export function useMonthlySales() {
  return useApi<EmployeeMonthlySales[]>(
    () => analyticsService.getEmployeeMonthlySales(),
    []
  );
}

export function useEmployeeHierarchy() {
  return useApi<EmployeeHierarchy[]>(
    () => analyticsService.getEmployeeHierarchy(),
    []
  );
}

/**
 * Sales Hooks
 */
export function useYoYGrowth() {
  return useApi<YoYGrowth[]>(
    () => analyticsService.getYoYGrowth(),
    []
  );
}

export function useDayOfWeek() {
  return useApi<DayOfWeekPattern[]>(
    () => analyticsService.getDayOfWeekPatterns(),
    []
  );
}

export function useDiscountImpact(limit: number = 20) {
  return useApi<DiscountImpact[]>(
    () => analyticsService.getDiscountImpact(limit),
    [limit]
  );
}

export function useTerritoryPerformance() {
  return useApi<TerritoryPerformance[]>(
    () => analyticsService.getTerritoryPerformance(),
    []
  );
}

/**
 * Categories Hooks
 */
export function useMonthlyGrowth() {
  return useApi<CategoryMonthlyGrowth[]>(
    () => analyticsService.getCategoryMonthlyGrowth(),
    []
  );
}

export function useCountryBreakdown() {
  return useApi<CategoryCountryBreakdown[]>(
    () => analyticsService.getCategoryCountryBreakdown(),
    []
  );
}

/**
 * Suppliers Hooks
 */
export function useSupplierPerformance(minOrders: number = 10) {
  return useApi<SupplierPerformance[]>(
    () => analyticsService.getSupplierPerformance(minOrders),
    [minOrders]
  );
}

export function useSupplierRisk(threshold: number = 0.3) {
  return useApi<SupplierRisk[]>(
    () => analyticsService.getSupplierRiskAnalysis(threshold),
    [threshold]
  );
}

/**
 * Shipping Hooks
 */
export function useShippingEfficiency() {
  return useApi<ShipperEfficiency[]>(
    () => analyticsService.getShippingEfficiency(),
    []
  );
}
