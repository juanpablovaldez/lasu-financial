import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { UserFinancialSummary } from '@/schemas';
import { useAuthStore } from '@/stores/auth-store';

export const clientFinancialKeys = {
  all: ['client-financial'] as const,
  summary: (userId: string) => [...clientFinancialKeys.all, userId] as const,
};

async function fetchClientFinancialSummary(userId: string): Promise<UserFinancialSummary> {
  const [balance, deposits, withdrawals, performanceOps, feeOps] = await Promise.all([
    supabase.from('user_balances').select('amount_usd').eq('user_id', userId).maybeSingle(),
    supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'deposit')
      .eq('status', 'completed'),
    supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'withdrawal')
      .eq('status', 'completed'),
    supabase
      .from('operations')
      .select('operation_type, total_amount_usd')
      .eq('user_id', userId)
      .in('operation_type', ['ganancia', 'perdida'])
      .eq('status', 'completed'),
    supabase
      .from('operations')
      .select('fee_amount')
      .eq('user_id', userId)
      .eq('status', 'completed'),
  ]);

  const current_balance = balance.data?.amount_usd ?? 0;
  const total_deposited = deposits.data?.reduce((sum, t) => sum + (t.amount ?? 0), 0) ?? 0;
  const total_withdrawn = withdrawals.data?.reduce((sum, t) => sum + (t.amount ?? 0), 0) ?? 0;
  const total_fees = feeOps.data?.reduce((sum, o) => sum + (o.fee_amount ?? 0), 0) ?? 0;
  const net_invested = total_deposited - total_withdrawn;
  const total_ganancia =
    performanceOps.data
      ?.filter((o) => o.operation_type === 'ganancia')
      .reduce((sum, o) => sum + (o.total_amount_usd ?? 0), 0) ?? 0;
  const total_perdida =
    performanceOps.data
      ?.filter((o) => o.operation_type === 'perdida')
      .reduce((sum, o) => sum + (o.total_amount_usd ?? 0), 0) ?? 0;
  const rentability_usd = total_ganancia - total_perdida;
  const rentability_pct = net_invested > 0 ? (rentability_usd / net_invested) * 100 : 0;

  return {
    user_id: userId,
    current_balance,
    total_deposited,
    total_withdrawn,
    total_fees,
    net_invested,
    rentability_usd,
    rentability_pct,
  };
}

export function useClientFinancialSummary() {
  const userId = useAuthStore((s) => s.userId);

  return useQuery({
    queryKey: clientFinancialKeys.summary(userId ?? ''),
    queryFn: () => fetchClientFinancialSummary(userId!),
    enabled: !!userId,
    staleTime: 30_000,
  });
}
