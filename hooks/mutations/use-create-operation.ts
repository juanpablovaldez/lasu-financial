import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { CreateOperationRequest, Operation } from '@/schemas';
import { operationSchema } from '@/schemas';
import { useAuthStore } from '@/stores/auth-store';

import { adminKeys } from '../queries/use-admin-dashboard';

/**
 * Create a new operation (admin only)
 */
async function createOperation(
  request: CreateOperationRequest,
  executedBy: string,
): Promise<Operation> {
  const { data, error } = await supabase
    .from('operations')
    .insert({
      user_id: request.user_id,
      operation_type: request.operation_type,
      total_amount_usd: request.total_amount_usd,
      currency: request.currency,
      fee_amount: request.fee_amount,
      description: request.description || null,
      status: 'pending',
      executed_by: executedBy,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating operation: ${error.message}`);
  }

  return operationSchema.parse(data);
}

/**
 * Mutation hook for creating operations.
 * Creates the operation in pending status.
 */
export function useCreateOperation() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);

  return useMutation({
    mutationFn: (request: CreateOperationRequest) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      return createOperation(request, userId);
    },
    onSuccess: () => {
      // Invalidate admin queries
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: adminKeys.operations() });
      queryClient.invalidateQueries({ queryKey: adminKeys.auditLogs() });
    },
  });
}
