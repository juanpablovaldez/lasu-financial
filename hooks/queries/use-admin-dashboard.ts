import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { AdminDashboardStats } from '@/schemas';
import { adminDashboardStatsSchema } from '@/schemas';

// Query key factory
export const adminKeys = {
  all: ['admin'] as const,
  dashboard: () => [...adminKeys.all, 'dashboard'] as const,
  transactions: () => [...adminKeys.all, 'transactions'] as const,
  transactionsPending: () => [...adminKeys.transactions(), 'pending'] as const,
  transactionDetail: (id: string) => [...adminKeys.transactions(), id] as const,
  operations: () => [...adminKeys.all, 'operations'] as const,
  operationDetail: (id: string) => [...adminKeys.operations(), id] as const,
  auditLogs: () => [...adminKeys.all, 'audit-logs'] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  userDetail: (id: string) => [...adminKeys.users(), id] as const,
  usersFinancials: () => [...adminKeys.all, 'users-financials'] as const,
  userOperations: (id: string) => [...adminKeys.users(), id, 'operations'] as const,
  userRole: (id: string) => [...adminKeys.users(), id, 'role'] as const,
};

/**
 * Fetch admin dashboard statistics
 */
async function fetchDashboardStats(): Promise<AdminDashboardStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  // Run all queries in parallel
  const [
    pendingTransactions,
    totalUsers,
    userBalances,
    activeUsers,
    suspendedUsers,
    transactionsToday,
    operationsToday,
    depositsToday,
    withdrawalsToday,
    operationsTodayData,
  ] = await Promise.all([
    // Pending transactions count
    supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),

    // Total users count
    supabase.from('user_profiles').select('*', { count: 'exact', head: true }),

    // Sum of all user balances
    supabase.from('user_balances').select('amount_usd'),

    // Active users count
    supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('account_status', 'active'),

    // Suspended users count
    supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('account_status', 'suspended'),

    // Transactions today count
    supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayISO),

    // Operations today count
    supabase
      .from('operations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayISO),

    // Deposits today (sum in USD)
    supabase
      .from('transactions')
      .select('amount, currency, exchange_rate')
      .eq('type', 'deposit')
      .gte('created_at', todayISO)
      .eq('status', 'completed'),

    // Withdrawals today (sum in USD)
    supabase
      .from('transactions')
      .select('amount, currency, exchange_rate')
      .eq('type', 'withdrawal')
      .gte('created_at', todayISO)
      .eq('status', 'completed'),

    // Operations today (sum in USD)
    supabase
      .from('operations')
      .select('total_amount_usd, fee_amount')
      .gte('created_at', todayISO)
      .eq('status', 'completed'),
  ]);

  // Calculate total balance
  const totalBalanceUsd = userBalances.data?.reduce((sum, b) => sum + (b.amount_usd || 0), 0) || 0;

  // Calculate deposits today in USD
  const depositsTodayUsd =
    depositsToday.data?.reduce((sum, t) => {
      const amountUsd = t.currency === 'USD' ? t.amount : t.amount / (t.exchange_rate || 1);
      return sum + amountUsd;
    }, 0) || 0;

  // Calculate withdrawals today in USD
  const withdrawalsTodayUsd =
    withdrawalsToday.data?.reduce((sum, t) => {
      const amountUsd = t.currency === 'USD' ? t.amount : t.amount / (t.exchange_rate || 1);
      return sum + amountUsd;
    }, 0) || 0;

  // Calculate operations today in USD
  const operationsTodayUsd =
    operationsTodayData.data?.reduce(
      (sum, o) => sum + (o.total_amount_usd || 0) + (o.fee_amount || 0),
      0,
    ) || 0;

  const stats = {
    pending_transactions_count: pendingTransactions.count || 0,
    total_users_count: totalUsers.count || 0,
    total_balance_usd: totalBalanceUsd,
    active_users_count: activeUsers.count || 0,
    suspended_users_count: suspendedUsers.count || 0,
    transactions_today_count: transactionsToday.count || 0,
    operations_today_count: operationsToday.count || 0,
    deposits_today_usd: depositsTodayUsd,
    withdrawals_today_usd: withdrawalsTodayUsd,
    operations_today_usd: operationsTodayUsd,
  };

  return adminDashboardStatsSchema.parse(stats);
}

/**
 * Query hook for admin dashboard statistics.
 * Auto-refreshes every 30 seconds.
 */
export function useAdminDashboard() {
  return useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: fetchDashboardStats,
    staleTime: 10_000, // 10 seconds
    refetchInterval: 30_000, // Auto-refresh every 30 seconds
  });
}
