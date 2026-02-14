import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { transactionSchema, type Transaction } from '@/schemas';

import { adminKeys } from './use-admin-dashboard';

/**
 * Fetch a single transaction by ID (admin view — no user_id filter).
 */
async function fetchAdminTransaction(id: string): Promise<Transaction> {
  const { data, error } = await supabase.from('transactions').select('*').eq('id', id).single();

  if (error) {
    throw new Error(`Failed to fetch transaction: ${error.message}`);
  }

  return transactionSchema.parse(data);
}

/**
 * TanStack Query hook for fetching a single transaction by ID (admin view).
 * Unlike useTransaction, this does NOT filter by user_id.
 */
export function useAdminTransaction(id: string | undefined) {
  return useQuery({
    queryKey: adminKeys.transactionDetail(id!),
    queryFn: () => fetchAdminTransaction(id!),
    enabled: !!id,
  });
}
