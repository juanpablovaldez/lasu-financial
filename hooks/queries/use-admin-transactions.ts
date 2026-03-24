import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Transaction } from '@/schemas';
import { transactionListSchema } from '@/schemas';

import { adminKeys } from './use-admin-dashboard';

async function fetchAdminTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching transactions: ${error.message}`);
  }

  return transactionListSchema.parse(data);
}

export function useAdminTransactions() {
  return useQuery({
    queryKey: adminKeys.transactions(),
    queryFn: fetchAdminTransactions,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}
