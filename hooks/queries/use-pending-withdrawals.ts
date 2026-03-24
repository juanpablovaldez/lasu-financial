import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';

import { transactionKeys } from './use-transactions';

async function fetchPendingWithdrawalsTotal(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'withdrawal')
    .eq('status', 'pending');

  if (error) {
    throw new Error(`Error fetching pending withdrawals: ${error.message}`);
  }

  return (data ?? []).reduce((sum, row) => sum + (row.amount as number), 0);
}

export function usePendingWithdrawalsTotal() {
  const userId = useAuthStore((state) => state.userId);

  return useQuery({
    queryKey: [...transactionKeys.all, 'pending-withdrawals', userId],
    queryFn: () => fetchPendingWithdrawalsTotal(userId!),
    enabled: !!userId,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
