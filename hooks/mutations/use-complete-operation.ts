import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { CompleteOperationRequest, Operation } from '@/schemas';
import { operationSchema } from '@/schemas';
import { toast } from '@/stores/toast-store';

import { adminKeys } from '../queries/use-admin-dashboard';
import { balanceKeys } from '../queries/use-balance';
import { userOperationKeys } from '../queries/use-user-operations';
import { performanceKeys } from '../queries/use-performance-data';

/**
 * Complete an operation (triggers balance deduction)
 */
async function completeOperation(request: CompleteOperationRequest): Promise<Operation> {
  const { operation_id } = request;

  const { data, error } = await supabase
    .from('operations')
    .update({ status: 'completed' })
    .eq('id', operation_id)
    .eq('status', 'pending') // Ensure operation is still pending
    .select()
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Operation not found or already processed');
  }

  return operationSchema.parse(data);
}

/**
 * Mutation hook for completing operations.
 * Triggers database trigger that deducts from user balance.
 */
export function useCompleteOperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeOperation,
    onError: (error: any) => {
      const message: string = error?.message ?? '';
      if (message.includes('Insufficient balance')) {
        const match = message.match(/Required:\s*([\d.]+),\s*Available:\s*([\d.]+)/);
        if (match) {
          toast.error(
            'Saldo insuficiente',
            `Se requieren $${match[1]} pero el usuario solo tiene $${match[2]} disponibles.`,
          );
        } else {
          toast.error('Saldo insuficiente', 'El usuario no tiene fondos suficientes.');
        }
      } else {
        toast.error('Error al completar operación', message || 'Ocurrió un error inesperado.');
      }
    },
    onSuccess: (operation) => {
      // Invalidate admin queries
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: adminKeys.operations() });
      queryClient.invalidateQueries({ queryKey: adminKeys.operationDetail(operation.id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.auditLogs() });

      // Invalidate user balance
      queryClient.invalidateQueries({ queryKey: balanceKeys.balance(operation.user_id) });

      // Invalidate user operations and performance data
      queryClient.invalidateQueries({ queryKey: userOperationKeys.list(operation.user_id) });
      queryClient.invalidateQueries({ queryKey: performanceKeys.admin() });
    },
  });
}
