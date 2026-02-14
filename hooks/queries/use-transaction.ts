import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { transactionSchema, type Transaction } from '@/schemas';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Query key factory for a single transaction.
 */
export const transactionDetailKeys = {
  all: ['transactions', 'detail'] as const,
  detail: (id: string, userId: string) => [...transactionDetailKeys.all, id, userId] as const,
};

/**
 * Fetch a single transaction by ID from Supabase with Zod validation.
 */
async function fetchTransaction(id: string, userId: string): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch transaction: ${error.message}`);
  }

  return transactionSchema.parse(data);
}

/**
 * TanStack Query hook for fetching a single transaction by ID.
 *
 * @param id - The transaction UUID
 *
 * @example
 * ```tsx
 * const { data: transaction, isLoading } = useTransaction('some-uuid');
 * ```
 */
export function useTransaction(id: string | undefined) {
  const userId = useAuthStore((state) => state.userId);

  return useQuery({
    queryKey: transactionDetailKeys.detail(id!, userId!),
    queryFn: () => fetchTransaction(id!, userId!),
    enabled: !!id && !!userId,
  });
}
