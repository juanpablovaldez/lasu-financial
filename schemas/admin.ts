import { z } from 'zod';

// Admin role types
export const adminRoleTypeSchema = z.enum(['super_admin', 'admin', 'viewer']);
export type AdminRoleType = z.infer<typeof adminRoleTypeSchema>;

// Admin role record
export const adminRoleSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: adminRoleTypeSchema,
  granted_by: z.string().uuid().nullish(),
  granted_at: z.string(),
  revoked_at: z.string().nullish(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type AdminRole = z.infer<typeof adminRoleSchema>;

// Audit log types
export const auditActionTypeSchema = z.enum([
  'transaction_approved',
  'transaction_rejected',
  'operation_created',
  'operation_completed',
  'operation_cancelled',
  'admin_role_granted',
  'admin_role_revoked',
  'user_account_suspended',
  'user_account_activated',
  'balance_adjusted',
]);
export type AuditActionType = z.infer<typeof auditActionTypeSchema>;

export const auditEntityTypeSchema = z.enum([
  'transaction',
  'operation',
  'admin_role',
  'user_profile',
  'user_balance',
]);
export type AuditEntityType = z.infer<typeof auditEntityTypeSchema>;

export const auditLogSchema = z.object({
  id: z.string().uuid(),
  performed_by: z.string().uuid().nullish(),
  performed_at: z.string(),
  action: auditActionTypeSchema,
  entity_type: auditEntityTypeSchema,
  entity_id: z.string().uuid(),
  previous_state: z.record(z.unknown()).nullish(),
  new_state: z.record(z.unknown()).nullish(),
  reason: z.string().nullish(),
  metadata: z.record(z.unknown()).nullish(),
  ip_address: z.string().nullish(),
  user_agent: z.string().nullish(),
  created_at: z.string(),
});
export type AuditLog = z.infer<typeof auditLogSchema>;

// Admin dashboard stats
export const adminDashboardStatsSchema = z.object({
  pending_transactions_count: z.number(),
  total_users_count: z.number(),
  total_balance_usd: z.number(),
  active_users_count: z.number(),
  suspended_users_count: z.number(),
  transactions_today_count: z.number(),
  operations_today_count: z.number(),
  deposits_today_usd: z.number(),
  withdrawals_today_usd: z.number(),
  operations_today_usd: z.number(),
});
export type AdminDashboardStats = z.infer<typeof adminDashboardStatsSchema>;

// Transaction approval request
export const transactionApprovalRequestSchema = z.object({
  transaction_id: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
  admin_notes: z.string().optional(),
});
export type TransactionApprovalRequest = z.infer<typeof transactionApprovalRequestSchema>;
