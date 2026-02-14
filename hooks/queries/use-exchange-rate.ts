import { useQuery } from '@tanstack/react-query';

import { fetchExchangeRate } from '@/lib/currency';

/**
 * Query key factory for exchange rates.
 */
export const exchangeRateKeys = {
  all: ['exchange-rate'] as const,
  current: () => [...exchangeRateKeys.all, 'current'] as const,
};

/**
 * TanStack Query hook for fetching current USD to ARS exchange rate.
 *
 * @example
 * ```tsx
 * const { data: exchangeRate, isLoading } = useExchangeRate();
 * if (exchangeRate) {
 *   const arsAmount = usdAmount * exchangeRate.usd_to_ars;
 * }
 * ```
 */
export function useExchangeRate() {
  return useQuery({
    queryKey: exchangeRateKeys.current(),
    queryFn: fetchExchangeRate,
    staleTime: 300_000,
    gcTime: 600_000,
  });
}
