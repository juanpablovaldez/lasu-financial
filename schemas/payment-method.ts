import { z } from 'zod';

export const paymentMethodTypeSchema = z.enum(['bank_transfer', 'crypto', 'branch']);
export type PaymentMethodType = z.infer<typeof paymentMethodTypeSchema>;

export const paymentMethodSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: paymentMethodTypeSchema,
  alias: z.string(),
  is_default: z.boolean(),
  bank_name: z.string().nullish(),
  account_holder: z.string().nullish(),
  document: z.string().nullish(),
  account_number: z.string().nullish(),
  account_type: z.enum(['checking', 'savings']).nullish(),
  cbu: z.string().nullish(),
  cbu_alias: z.string().nullish(),
  network: z.string().nullish(),
  coin: z.string().nullish(),
  wallet_address: z.string().nullish(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const paymentMethodListSchema = z.array(paymentMethodSchema);

export const createPaymentMethodRequestSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('bank_transfer'),
    alias: z.string().min(1, 'El alias es requerido'),
    bank_name: z.string().min(1, 'El nombre del banco es requerido'),
    account_holder: z.string().min(1, 'El titular de la cuenta es requerido'),
    document: z.string().optional(),
    account_number: z.string().min(1, 'El número de cuenta es requerido'),
    account_type: z.enum(['checking', 'savings']).optional(),
    cbu: z.string().min(22, 'El CBU debe tener 22 dígitos').max(22, 'El CBU debe tener 22 dígitos'),
    cbu_alias: z.string().optional(),
    is_default: z.boolean().optional(),
  }),
  z.object({
    type: z.literal('crypto'),
    alias: z.string().min(1, 'El alias es requerido'),
    network: z.string().min(1, 'La red es requerida'),
    coin: z.string().min(1, 'La moneda es requerida'),
    wallet_address: z
      .string()
      .min(10, 'La dirección de billetera debe tener al menos 10 caracteres'),
    is_default: z.boolean().optional(),
  }),
  z.object({
    type: z.literal('branch'),
    alias: z.string().min(1, 'El alias es requerido'),
    is_default: z.boolean().optional(),
  }),
]);

export type CreatePaymentMethodRequest = z.infer<typeof createPaymentMethodRequestSchema>;

export const updatePaymentMethodRequestSchema = z.discriminatedUnion('type', [
  z.object({
    id: z.string().uuid(),
    type: z.literal('bank_transfer'),
    alias: z.string().min(1, 'El alias es requerido'),
    bank_name: z.string().min(1, 'El nombre del banco es requerido'),
    account_holder: z.string().min(1, 'El titular de la cuenta es requerido'),
    document: z.string().optional(),
    account_number: z.string().min(1, 'El número de cuenta es requerido'),
    account_type: z.enum(['checking', 'savings']).optional(),
    cbu: z.string().min(22, 'El CBU debe tener 22 dígitos').max(22, 'El CBU debe tener 22 dígitos'),
    cbu_alias: z.string().optional(),
    is_default: z.boolean().optional(),
  }),
  z.object({
    id: z.string().uuid(),
    type: z.literal('crypto'),
    alias: z.string().min(1, 'El alias es requerido'),
    network: z.string().min(1, 'La red es requerida'),
    coin: z.string().min(1, 'La moneda es requerida'),
    wallet_address: z
      .string()
      .min(10, 'La dirección de billetera debe tener al menos 10 caracteres'),
    is_default: z.boolean().optional(),
  }),
  z.object({
    id: z.string().uuid(),
    type: z.literal('branch'),
    alias: z.string().min(1, 'El alias es requerido'),
    is_default: z.boolean().optional(),
  }),
]);

export type UpdatePaymentMethodRequest = z.infer<typeof updatePaymentMethodRequestSchema>;
