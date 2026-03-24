import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { transactionSchema, type Transaction } from '@/schemas';
import { useAuthStore } from '@/stores/auth-store';

import { transactionKeys } from '../queries/use-transactions';

async function cancelTransaction(transactionId: string, userId: string): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update({ status: 'cancelled' })
    .eq('id', transactionId)
    .eq('user_id', userId)
    .eq('status', 'pending')
    .select()
    .single();

  if (error) {
    throw new Error(`Error al anular la solicitud: ${error.message}`);
  }

  if (!data) {
    throw new Error('Solicitud no encontrada o ya procesada');
  }

  return transactionSchema.parse(data);
}

export function useCancelTransaction() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);

  return useMutation({
    mutationFn: (transactionId: string) => cancelTransaction(transactionId, userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}
