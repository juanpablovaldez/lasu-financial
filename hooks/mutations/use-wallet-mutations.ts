import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import {
  createTransactionRequestSchema,
  transactionSchema,
  type CreateTransactionRequest,
  type PaymentMethod,
  type Transaction,
} from '@/schemas';
import { useAuthStore } from '@/stores/auth-store';

import { balanceKeys } from '../queries/use-balance';
import { transactionKeys } from '../queries/use-transactions';

/**
 * Create a new transaction (deposit or withdrawal).
 * The paymentMethod snapshot is stored in metadata for admin processing.
 */
async function createTransaction(
  request: CreateTransactionRequest,
  userId: string,
  paymentMethodSnapshot: PaymentMethod,
): Promise<Transaction> {
  const validated = createTransactionRequestSchema.parse(request);

  const metadata = {
    payment_method_id: validated.payment_method_id,
    payment_method_type: paymentMethodSnapshot.type,
    payment_method_snapshot: {
      alias: paymentMethodSnapshot.alias,
      bank_name: paymentMethodSnapshot.bank_name ?? null,
      account_holder: paymentMethodSnapshot.account_holder ?? null,
      document: paymentMethodSnapshot.document ?? null,
      account_number: paymentMethodSnapshot.account_number ?? null,
      account_type: paymentMethodSnapshot.account_type ?? null,
      cbu: paymentMethodSnapshot.cbu ?? null,
      cbu_alias: paymentMethodSnapshot.cbu_alias ?? null,
      network: paymentMethodSnapshot.network ?? null,
      coin: paymentMethodSnapshot.coin ?? null,
      wallet_address: paymentMethodSnapshot.wallet_address ?? null,
    },
  };

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
      metadata,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Transaction failed: ${error.message}`);
  }

  const transaction = transactionSchema.parse(data);

  supabase.functions
    .invoke('notify-admin-on-transaction', {
      body: {
        transaction_id: transaction.id,
        user_id: userId,
        type: transaction.type,
        amount: transaction.amount,
        currency: transaction.currency,
      },
    })
    .catch(() => {});

  return transaction;
}

type CreateTransactionArgs = {
  request: CreateTransactionRequest;
  paymentMethodSnapshot: PaymentMethod;
};

/**
 * Hook for creating a transaction (deposit or withdrawal).
 *
 * @example
 * ```tsx
 * const { mutate, isPending, error } = useCreateTransaction();
 *
 * mutate({
 *   request: {
 *     type: 'deposit',
 *     amount: 100,
 *     currency: 'USD',
 *     description: 'Initial deposit',
 *     payment_method_id: '...',
 *   },
 *   paymentMethodSnapshot: selectedMethod,
 * }, {
 *   onSuccess: () => console.log('Transaction completed'),
 * });
 * ```
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);

  return useMutation({
    mutationFn: ({ request, paymentMethodSnapshot }: CreateTransactionArgs) =>
      createTransaction(request, userId!, paymentMethodSnapshot),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: balanceKeys.all });
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}
