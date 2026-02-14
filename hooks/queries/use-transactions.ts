import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { transactionListSchema, type Transaction } from '@/schemas';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Query key factory for transactions.
 */
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (userId: string, limit: number) => [...transactionKeys.lists(), userId, limit] as const,
};

/**
 * Fetch user transactions from Supabase with Zod runtime validation.
 */
async function fetchTransactions(userId: string, limit: number): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  return transactionListSchema.parse(data);
}

/**
 * TanStack Query hook for fetching user transaction history.
 *
 * @param limit - Maximum number of transactions to fetch (default: 20)
 *
 * @example
 * ```tsx
 * const { data: transactions, isLoading } = useTransactions(20);
 * ```
 */
export function useTransactions(limit = 20) {
  const userId = useAuthStore((state) => state.userId);

  return useQuery({
    queryKey: transactionKeys.list(userId!, limit),
    queryFn: () => fetchTransactions(userId!, limit),
    enabled: !!userId,
  });
}
