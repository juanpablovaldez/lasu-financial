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
  currency: z.enum(['USD', 'ARS']),
  exchange_rate: z.number().nullish(),
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

// Exchange Rate Schema
export const exchangeRateSchema = z.object({
  usd_to_ars: z.number().positive(),
  last_updated: z.string(),
  source: z.string(),
});

export type ExchangeRate = z.infer<typeof exchangeRateSchema>;

// Request Schemas
export const createTransactionRequestSchema = z.object({
  type: z.enum(['deposit', 'withdrawal']),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  currency: z.enum(['USD', 'ARS']),
  description: z.string().optional(),
});

export type CreateTransactionRequest = z.infer<typeof createTransactionRequestSchema>;

export const currencyPreferenceSchema = z.enum(['USD', 'ARS']);
export type CurrencyPreference = z.infer<typeof currencyPreferenceSchema>;
