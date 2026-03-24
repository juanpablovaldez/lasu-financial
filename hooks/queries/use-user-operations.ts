import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { supabase } from '@/lib/supabase';
import { operationSchema, type Operation } from '@/schemas';
import { useAuthStore } from '@/stores/auth-store';

const operationListSchema = z.array(operationSchema);

export const userOperationKeys = {
  all: ['userOperations'] as const,
  list: (userId: string) => [...userOperationKeys.all, userId] as const,
};

async function fetchUserOperations(userId: string): Promise<Operation[]> {
  const { data, error } = await supabase
    .from('operations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching user operations: ${error.message}`);
  }

  return operationListSchema.parse(data);
}

/**
 * Fetches gain and loss operations for the current authenticated user.
 */
export function useUserOperations() {
  const userId = useAuthStore((state) => state.userId);

  return useQuery({
    queryKey: userOperationKeys.list(userId!),
    queryFn: () => fetchUserOperations(userId!),
    enabled: !!userId,
  });
}
