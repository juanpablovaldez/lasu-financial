/**
 * Central export for all Zod schemas.
 * Import schemas from here for consistency.
 *
 * @example
 * ```ts
 * import { instrumentSchema, type Instrument } from '@/schemas';
 * ```
 */
export {
  oauthProviderSchema,
  signInRequestSchema,
  signInResponseSchema,
  signUpRequestSchema,
  signUpResponseSchema,
  supabaseSessionSchema,
  type OAuthProvider,
  type SignInRequest,
  type SignInResponse,
  type SignUpRequest,
  type SignUpResponse,
  type SupabaseSession,
} from './auth';
export { instrumentListSchema, instrumentSchema, type Instrument } from './instrument';
export { userSchema, type User } from './user';
