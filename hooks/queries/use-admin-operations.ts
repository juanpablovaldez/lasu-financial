import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Operation } from '@/schemas';
import { operationSchema } from '@/schemas';
import { z } from 'zod';

import { adminKeys } from './use-admin-dashboard';

const operationListSchema = z.array(operationSchema);

/**
 * Fetch all operations (admin view)
 */
async function fetchAllOperations(): Promise<Operation[]> {
  const { data, error } = await supabase
    .from('operations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100); // Limit to recent 100 operations

  if (error) {
    throw new Error(`Error fetching operations: ${error.message}`);
  }

  return operationListSchema.parse(data);
}

/**
 * Query hook for all operations (admin view).
 */
export function useAdminOperations() {
  return useQuery({
    queryKey: adminKeys.operations(),
    queryFn: fetchAllOperations,
    staleTime: 30_000, // 30 seconds
  });
}

/**
 * Fetch single operation by ID
 */
async function fetchOperation(id: string): Promise<Operation> {
  const { data, error } = await supabase.from('operations').select('*').eq('id', id).single();

  if (error) {
    throw new Error(`Error fetching operation: ${error.message}`);
  }

  return operationSchema.parse(data);
}

/**
 * Query hook for single operation detail.
 */
export function useOperation(id: string) {
  return useQuery({
    queryKey: adminKeys.operationDetail(id),
    queryFn: () => fetchOperation(id),
    enabled: !!id,
  });
}
