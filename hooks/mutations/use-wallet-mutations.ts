import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import {
  createTransactionRequestSchema,
  transactionSchema,
  type CreateTransactionRequest,
  type Transaction,
} from '@/schemas';
import { useAuthStore } from '@/stores/auth-store';

import { balanceKeys } from '../queries/use-balance';
import { transactionKeys } from '../queries/use-transactions';

/**
 * Create a new transaction (deposit or withdrawal).
 */
async function createTransaction(
  request: CreateTransactionRequest,
  userId: string,
): Promise<Transaction> {
  const validated = createTransactionRequestSchema.parse(request);

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: validated.type,
      amount: validated.amount,
      currency: validated.currency,
      exchange_rate: null,
      status: 'pending',
      description: validated.description || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Transaction failed: ${error.message}`);
  }

  return transactionSchema.parse(data);
}

/**
 * Hook for creating a transaction (deposit or withdrawal).
 *
 * @example
 * ```tsx
 * const { mutate, isPending, error } = useCreateTransaction();
 *
 * mutate({
 *   type: 'deposit',
 *   amount: 100,
 *   currency: 'USD',
 *   description: 'Initial deposit',
 * }, {
 *   onSuccess: () => console.log('Transaction completed'),
 * });
 * ```
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);

  return useMutation({
    mutationFn: (request: CreateTransactionRequest) => createTransaction(request, userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: balanceKeys.all });
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}
