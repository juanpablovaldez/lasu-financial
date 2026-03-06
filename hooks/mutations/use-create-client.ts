import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { type CreateClientRequest } from '@/schemas';

import { adminKeys } from '../queries/use-admin-dashboard';

async function createClient(request: CreateClientRequest): Promise<void> {
  const { error } = await supabase.functions.invoke('admin-create-client', {
    body: request,
  });

  if (error) {
    throw new Error(`Error al crear el cliente: ${error.message}`);
  }
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: adminKeys.auditLogs() });
    },
  });
}
