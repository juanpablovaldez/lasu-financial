import { z } from 'zod';

/**
 * Zod schema for Supabase session object.
 * Used for validating session data from Supabase auth.
 */
export const supabaseSessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
  expires_at: z.number().optional(),
  token_type: z.string(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    aud: z.string().optional(),
    role: z.string().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    email_confirmed_at: z.string().optional(),
    phone_confirmed_at: z.string().optional(),
    last_sign_in_at: z.string().optional(),
    app_metadata: z.record(z.unknown()).optional(),
    user_metadata: z.record(z.unknown()).optional(),
  }),
});

export type SupabaseSession = z.infer<typeof supabaseSessionSchema>;

/**
 * Zod schema for sign-in request payload.
 */
export const signInRequestSchema = z.object({
  email: z.string().email('Por favor, ingresa una dirección de correo electrónico válida'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type SignInRequest = z.infer<typeof signInRequestSchema>;

/**
 * Zod schema for sign-in response from Supabase.
 */
export const signInResponseSchema = z.object({
  session: supabaseSessionSchema.nullable(),
  user: z
    .object({
      id: z.string().uuid(),
      email: z.string().email().optional(),
    })
    .nullable(),
});

export type SignInResponse = z.infer<typeof signInResponseSchema>;

/**
 * Zod schema for sign-up request payload.
 */
export const signUpRequestSchema = z.object({
  email: z.string().email('Por favor, ingresa una dirección de correo electrónico válida'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  full_name: z.string().optional(),
});

export type SignUpRequest = z.infer<typeof signUpRequestSchema>;

/**
 * Zod schema for sign-up response from Supabase.
 */
export const signUpResponseSchema = z.object({
  session: supabaseSessionSchema.nullable(),
  user: z
    .object({
      id: z.string().uuid(),
      email: z.string().email().optional(),
    })
    .nullable(),
});

export type SignUpResponse = z.infer<typeof signUpResponseSchema>;

/**
 * Zod schema for OAuth provider types.
 */
export const oauthProviderSchema = z.enum(['google', 'apple', 'github', 'facebook']);

export type OAuthProvider = z.infer<typeof oauthProviderSchema>;

export const verifyOtpRequestSchema = z.object({
  email: z.string().email(),
  token: z.string().length(6, 'El código debe tener 6 dígitos'),
  type: z.enum(['signup', 'email']),
});
export type VerifyOtpRequest = z.infer<typeof verifyOtpRequestSchema>;

export const resendOtpRequestSchema = z.object({
  email: z.string().email(),
  type: z.enum(['signup']),
});
export type ResendOtpRequest = z.infer<typeof resendOtpRequestSchema>;
