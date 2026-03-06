import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { UserFinancialSummary } from '@/schemas';

import { adminKeys } from './use-admin-dashboard';

async function fetchAdminUsersFinancials(): Promise<Record<string, UserFinancialSummary>> {
  const [balances, deposits, withdrawals, performanceOps, feeOps] = await Promise.all([
    supabase.from('user_balances').select('user_id, amount_usd'),
    supabase
      .from('transactions')
      .select('user_id, amount')
      .eq('type', 'deposit')
      .eq('status', 'completed'),
    supabase
      .from('transactions')
      .select('user_id, amount')
      .eq('type', 'withdrawal')
      .eq('status', 'completed'),
    supabase
      .from('operations')
      .select('user_id, operation_type, total_amount_usd')
      .in('operation_type', ['ganancia', 'perdida'])
      .eq('status', 'completed'),
    supabase.from('operations').select('user_id, fee_amount').eq('status', 'completed'),
  ]);

  const balanceMap: Record<string, number> = {};
  for (const row of balances.data ?? []) {
    balanceMap[row.user_id] = (balanceMap[row.user_id] ?? 0) + (row.amount_usd ?? 0);
  }

  const depositMap: Record<string, number> = {};
  for (const row of deposits.data ?? []) {
    depositMap[row.user_id] = (depositMap[row.user_id] ?? 0) + (row.amount ?? 0);
  }

  const withdrawalMap: Record<string, number> = {};
  for (const row of withdrawals.data ?? []) {
    withdrawalMap[row.user_id] = (withdrawalMap[row.user_id] ?? 0) + (row.amount ?? 0);
  }

  const gananciaMap: Record<string, number> = {};
  const perdidaMap: Record<string, number> = {};
  for (const row of performanceOps.data ?? []) {
    if (row.operation_type === 'ganancia') {
      gananciaMap[row.user_id] = (gananciaMap[row.user_id] ?? 0) + (row.total_amount_usd ?? 0);
    } else {
      perdidaMap[row.user_id] = (perdidaMap[row.user_id] ?? 0) + (row.total_amount_usd ?? 0);
    }
  }

  const feesMap: Record<string, number> = {};
  for (const row of feeOps.data ?? []) {
    feesMap[row.user_id] = (feesMap[row.user_id] ?? 0) + (row.fee_amount ?? 0);
  }

  const allUserIds = new Set([
    ...Object.keys(balanceMap),
    ...Object.keys(depositMap),
    ...Object.keys(withdrawalMap),
    ...Object.keys(feesMap),
  ]);

  const result: Record<string, UserFinancialSummary> = {};
  for (const user_id of allUserIds) {
    const current_balance = balanceMap[user_id] ?? 0;
    const total_deposited = depositMap[user_id] ?? 0;
    const total_withdrawn = withdrawalMap[user_id] ?? 0;
    const total_fees = feesMap[user_id] ?? 0;
    const net_invested = total_deposited - total_withdrawn;
    const total_ganancia = gananciaMap[user_id] ?? 0;
    const total_perdida = perdidaMap[user_id] ?? 0;
    const rentability_usd = total_ganancia - total_perdida;
    const rentability_pct = net_invested > 0 ? (rentability_usd / net_invested) * 100 : 0;

    result[user_id] = {
      user_id,
      current_balance,
      total_deposited,
      total_withdrawn,
      total_fees,
      net_invested,
      rentability_usd,
      rentability_pct,
    };
  }

  return result;
}

export function useAdminUsersFinancials() {
  return useQuery({
    queryKey: adminKeys.usersFinancials(),
    queryFn: fetchAdminUsersFinancials,
    staleTime: 30_000,
  });
}
