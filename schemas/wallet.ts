import { z } from 'zod';

// Balance Schema
export const balanceSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  amount_usd: z.number(),
  last_updated: z.string(),
  created_at: z.string(),
});

export type Balance = z.infer<typeof balanceSchema>;

// Transaction Schema
export const transactionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: z.enum(['deposit', 'withdrawal']),
  amount: z.number().positive(),
  currency: z.string(),
  status: z.enum(['pending', 'completed', 'failed']),
  description: z.string().nullish(),
  created_at: z.string(),
  completed_at: z.string().nullish(),
  metadata: z.record(z.unknown()).nullish(),
  // Admin approval fields
  approved_by: z.string().uuid().nullish(),
  approved_at: z.string().nullish(),
  rejected_by: z.string().uuid().nullish(),
  rejected_at: z.string().nullish(),
  rejection_reason: z.string().nullish(),
  admin_notes: z.string().nullish(),
});

export type Transaction = z.infer<typeof transactionSchema>;
export const transactionListSchema = z.array(transactionSchema);

// Request Schemas
export const createTransactionRequestSchema = z.object({
  type: z.enum(['deposit', 'withdrawal']),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  currency: z.literal('USD'),
  description: z.string().optional(),
  payment_method_id: z.string().uuid('Debe seleccionar un método de pago'),
});

export type CreateTransactionRequest = z.infer<typeof createTransactionRequestSchema>;

// Financial Summary Schema
export const userFinancialSummarySchema = z.object({
  user_id: z.string().uuid(),
  current_balance: z.number(),
  total_deposited: z.number(),
  total_withdrawn: z.number(),
  total_fees: z.number(),
  net_invested: z.number(),
  rentability_usd: z.number(),
  rentability_pct: z.number(),
});

export type UserFinancialSummary = z.infer<typeof userFinancialSummarySchema>;
