import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Operation } from '@/schemas';
import { operationSchema } from '@/schemas';

import { adminKeys } from '../queries/use-admin-dashboard';

async function cancelOperation(operationId: string): Promise<Operation> {
  const { data, error } = await supabase
    .from('operations')
    .update({ status: 'cancelled' })
    .eq('id', operationId)
    .eq('status', 'pending')
    .select()
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Operación no encontrada o ya procesada');
  }

  return operationSchema.parse(data);
}

export function useCancelOperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelOperation,
    onSuccess: (operation) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.operations() });
      queryClient.invalidateQueries({ queryKey: adminKeys.operationDetail(operation.id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: adminKeys.auditLogs() });
    },
  });
}
