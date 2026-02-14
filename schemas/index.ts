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
export {
  balanceSchema,
  createTransactionRequestSchema,
  currencyPreferenceSchema,
  exchangeRateSchema,
  transactionListSchema,
  transactionSchema,
  type Balance,
  type CreateTransactionRequest,
  type CurrencyPreference,
  type ExchangeRate,
  type Transaction,
} from './wallet';
export {
  adminDashboardStatsSchema,
  adminRoleSchema,
  adminRoleTypeSchema,
  auditActionTypeSchema,
  auditEntityTypeSchema,
  auditLogSchema,
  transactionApprovalRequestSchema,
  type AdminDashboardStats,
  type AdminRole,
  type AdminRoleType,
  type AuditActionType,
  type AuditEntityType,
  type AuditLog,
  type TransactionApprovalRequest,
} from './admin';
export {
  completeOperationRequestSchema,
  createOperationRequestSchema,
  currencySchema,
  operationSchema,
  operationStatusSchema,
  operationTypeSchema,
  type CompleteOperationRequest,
  type CreateOperationRequest,
  type Currency,
  type Operation,
  type OperationStatus,
  type OperationType,
} from './operation';
export {
  accountStatusSchema,
  activateUserRequestSchema,
  kycStatusSchema,
  suspendUserRequestSchema,
  userProfileSchema,
  type AccountStatus,
  type ActivateUserRequest,
  type KycStatus,
  type SuspendUserRequest,
  type UserProfile,
} from './user-profile';
