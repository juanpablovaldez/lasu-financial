import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { AuditLog } from '@/schemas';
import { auditLogSchema } from '@/schemas';
import { z } from 'zod';

import { adminKeys } from './use-admin-dashboard';

const auditLogListSchema = z.array(auditLogSchema);

interface UseAuditLogsOptions {
  limit?: number;
  offset?: number;
}

/**
 * Fetch audit logs with pagination
 */
async function fetchAuditLogs(options: UseAuditLogsOptions = {}): Promise<AuditLog[]> {
  const { limit = 50, offset = 0 } = options;

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('performed_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Error fetching audit logs: ${error.message}`);
  }

  return auditLogListSchema.parse(data);
}

/**
 * Query hook for audit logs.
 * Returns recent audit logs with pagination support.
 */
export function useAuditLogs(options: UseAuditLogsOptions = {}) {
  return useQuery({
    queryKey: [...adminKeys.auditLogs(), options],
    queryFn: () => fetchAuditLogs(options),
    staleTime: 60_000, // 1 minute
  });
}
