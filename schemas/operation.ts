import { z } from 'zod';

// Operation types
export const operationTypeSchema = z.enum(['ingreso', 'egreso', 'ganancia', 'perdida']);
export type OperationType = z.infer<typeof operationTypeSchema>;

export const operationStatusSchema = z.enum(['pending', 'completed', 'cancelled', 'failed']);
export type OperationStatus = z.infer<typeof operationStatusSchema>;

export const currencySchema = z.literal('USD');
export type Currency = z.infer<typeof currencySchema>;

// Operation record — operation_type accepts any string to tolerate legacy DB values
export const operationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  operation_type: z.string(),
  instrument_id: z.number().int().nullish(),
  quantity: z.number().nullish(),
  price_per_unit: z.number().nullish(),
  total_amount_usd: z.number(),
  currency: currencySchema,
  fee_amount: z.number(),
  status: operationStatusSchema,
  description: z.string().nullish(),
  executed_by: z.string().uuid().nullish(),
  executed_at: z.string().nullish(),
  created_at: z.string(),
  updated_at: z.string(),
  metadata: z.record(z.unknown()).nullish(),
});
export type Operation = z.infer<typeof operationSchema>;

// Create operation request
export const createOperationRequestSchema = z.object({
  user_id: z.string().uuid('Debe seleccionar un usuario válido'),
  operation_type: operationTypeSchema,
  total_amount_usd: z.number().positive('El monto debe ser mayor a 0'),
  currency: currencySchema.default('USD'),
  fee_amount: z.number().min(0, 'La comisión no puede ser negativa').default(0),
  description: z.string().optional(),
});
export type CreateOperationRequest = z.infer<typeof createOperationRequestSchema>;

// Complete operation request
export const completeOperationRequestSchema = z.object({
  operation_id: z.string().uuid(),
});
export type CompleteOperationRequest = z.infer<typeof completeOperationRequestSchema>;
