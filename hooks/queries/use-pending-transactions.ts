import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Transaction } from '@/schemas';
import { transactionListSchema } from '@/schemas';

import { adminKeys } from './use-admin-dashboard';

/**
 * Fetch all pending transactions (for admin approval)
 */
async function fetchPendingTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching pending transactions: ${error.message}`);
  }

  return transactionListSchema.parse(data);
}

/**
 * Query hook for pending transactions.
 * Auto-refreshes every 30 seconds to keep the queue up to date.
 */
export function usePendingTransactions() {
  return useQuery({
    queryKey: adminKeys.transactionsPending(),
    queryFn: fetchPendingTransactions,
    staleTime: 10_000, // 10 seconds
    refetchInterval: 30_000, // Auto-refresh every 30 seconds
  });
}
