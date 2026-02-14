import { useInfiniteQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { transactionListSchema, type Transaction } from '@/schemas';
import { useAuthStore } from '@/stores/auth-store';

const PAGE_SIZE = 20;

/**
 * Query key factory for infinite transactions.
 */
export const infiniteTransactionKeys = {
  all: ['transactions', 'infinite'] as const,
  list: (userId: string) => [...infiniteTransactionKeys.all, userId] as const,
};

interface TransactionPage {
  transactions: Transaction[];
  nextPage: number | undefined;
}

/**
 * Fetch a single page of transactions from Supabase.
 */
async function fetchTransactionPage(userId: string, page: number): Promise<TransactionPage> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  const transactions = transactionListSchema.parse(data);

  return {
    transactions,
    nextPage: transactions.length === PAGE_SIZE ? page + 1 : undefined,
  };
}

/**
 * TanStack Query hook for infinite-scroll transaction history.
 *
 * @example
 * ```tsx
 * const {
 *   data,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage,
 * } = useInfiniteTransactions();
 *
 * const allTransactions = data?.pages.flatMap((p) => p.transactions) ?? [];
 * ```
 */
export function useInfiniteTransactions() {
  const userId = useAuthStore((state) => state.userId);

  return useInfiniteQuery({
    queryKey: infiniteTransactionKeys.list(userId!),
    queryFn: ({ pageParam }) => fetchTransactionPage(userId!, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!userId,
  });
}
