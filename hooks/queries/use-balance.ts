import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { balanceSchema, type Balance } from '@/schemas';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Query key factory for wallet balance.
 */
export const balanceKeys = {
  all: ['balance'] as const,
  balance: (userId: string) => [...balanceKeys.all, userId] as const,
};

/**
 * Fetch user balance from Supabase with Zod runtime validation.
 */
async function fetchBalance(userId: string): Promise<Balance> {
  const { data, error } = await supabase
    .from('user_balances')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch balance: ${error.message}`);
  }

  return balanceSchema.parse(data);
}

/**
 * TanStack Query hook for fetching user balance.
 *
 * @example
 * ```tsx
 * const { data: balance, isLoading } = useBalance();
 * ```
 */
export function useBalance() {
  const userId = useAuthStore((state) => state.userId);

  return useQuery({
    queryKey: balanceKeys.balance(userId!),
    queryFn: () => fetchBalance(userId!),
    enabled: !!userId,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
