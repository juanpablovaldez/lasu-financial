import { z } from 'zod';

// KYC and account status types
export const kycStatusSchema = z.enum([
  'not_submitted',
  'pending_review',
  'approved',
  'rejected',
  'requires_update',
]);
export type KycStatus = z.infer<typeof kycStatusSchema>;

export const accountStatusSchema = z.enum(['active', 'suspended', 'closed', 'pending_activation']);
export type AccountStatus = z.infer<typeof accountStatusSchema>;

// User profile record
export const userProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  full_name: z.string().nullish(),
  email: z.string().email().nullish(),
  phone: z.string().nullish(),
  country: z.string().nullish(),
  date_of_birth: z.string().nullish(),
  kyc_status: kycStatusSchema,
  kyc_submitted_at: z.string().nullish(),
  kyc_approved_at: z.string().nullish(),
  kyc_approved_by: z.string().uuid().nullish(),
  account_status: accountStatusSchema,
  suspended_at: z.string().nullish(),
  suspended_by: z.string().uuid().nullish(),
  suspension_reason: z.string().nullish(),
  last_login_at: z.string().nullish(),
  metadata: z.record(z.unknown()).nullish(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type UserProfile = z.infer<typeof userProfileSchema>;

// Suspend user request
export const suspendUserRequestSchema = z.object({
  user_id: z.string().uuid('Debe seleccionar un usuario válido'),
  reason: z.string().min(10, 'La razón debe tener al menos 10 caracteres'),
});
export type SuspendUserRequest = z.infer<typeof suspendUserRequestSchema>;

// Activate user request
export const activateUserRequestSchema = z.object({
  user_id: z.string().uuid('Debe seleccionar un usuario válido'),
});
export type ActivateUserRequest = z.infer<typeof activateUserRequestSchema>;
