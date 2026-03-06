import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { adminKeys } from '@/hooks/queries/use-admin-dashboard';
import { balanceKeys } from '@/hooks/queries/use-balance';
import { userOperationKeys } from '@/hooks/queries/use-user-operations';

async function deleteOperation(operationId: string): Promise<void> {
  const { error } = await supabase.from('operations').delete().eq('id', operationId);

  if (error) {
    throw new Error(`Error al eliminar operación: ${error.message}`);
  }
}

export function useDeleteOperation(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: adminKeys.operations() });
      queryClient.invalidateQueries({ queryKey: adminKeys.userOperations(userId) });
      queryClient.invalidateQueries({ queryKey: balanceKeys.balance(userId) });
      queryClient.invalidateQueries({ queryKey: userOperationKeys.list(userId) });
    },
  });
}
