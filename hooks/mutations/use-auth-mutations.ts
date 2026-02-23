import type { AuthError } from '@supabase/supabase-js';
import { useMutation } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import {
  resendOtpRequestSchema,
  signInRequestSchema,
  signInResponseSchema,
  signUpRequestSchema,
  signUpResponseSchema,
  verifyOtpRequestSchema,
  type OAuthProvider,
  type ResendOtpRequest,
  type SignInRequest,
  type SignUpRequest,
  type VerifyOtpRequest,
} from '@/schemas';
import { useAdminStore } from '@/stores/admin-store';
import { useAuthStore } from '@/stores/auth-store';

// ─── Error Mapping Helper ─────────────────────────────────────────────────

function mapAuthError(error: AuthError | Error): string {
  const message = error.message.toLowerCase();

  if (message.includes('invalid login credentials')) {
    return 'Credenciales inválidas. Verifica tu correo y contraseña, o usa "¿Olvidaste tu contraseña?" para restablecerla.';
  }

  if (message.includes('email not confirmed')) {
    return 'Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada y carpeta de spam para encontrar el enlace de confirmación.';
  }

  if (message.includes('user already registered')) {
    return 'Ya existe una cuenta con este correo electrónico. Intenta iniciar sesión o usa "¿Olvidaste tu contraseña?" si no recuerdas tus credenciales.';
  }

  if (message.includes('password should be at least')) {
    return 'La contraseña es demasiado débil. Usa al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números.';
  }

  if (message.includes('invalid email')) {
    return 'El formato del correo electrónico no es válido. Asegúrate de usar un formato como nombre@ejemplo.com';
  }

  if (message.includes('network')) {
    return 'Error de conexión. Verifica que estés conectado a internet e intenta nuevamente. Si el problema persiste, contacta con soporte.';
  }

  if (message.includes('rate limit')) {
    return 'Demasiados intentos. Por razones de seguridad, espera unos minutos antes de volver a intentarlo.';
  }

  return error.message;
}

// ─── Sign In Mutation ──────────────────────────────────────────────────────

/**
 * Hook for signing in with email and password.
 *
 * @example
 * ```ts
 * const { mutate: signIn, isPending, error } = useSignIn();
 *
 * signIn({ email: 'user@example.com', password: 'password123' }, {
 *   onSuccess: () => router.replace('/(tabs)'),
 *   onError: (error) => console.error(error.message),
 * });
 * ```
 */
export function useSignIn() {
  return useMutation({
    mutationFn: async (credentials: SignInRequest) => {
      const validated = signInRequestSchema.parse(credentials);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
      });

      if (error) {
        throw new Error(mapAuthError(error));
      }

      const response = signInResponseSchema.parse(data);

      return response;
    },
    onSuccess: (data) => {
      if (data.session?.user) {
        useAuthStore.getState().setSession(data.session.user.id, data.session.user.email ?? '');
      }
    },
  });
}

// ─── Sign Up Mutation ──────────────────────────────────────────────────────

/**
 * Hook for signing up with email and password.
 *
 * @example
 * ```ts
 * const { mutate: signUp, isPending, error } = useSignUp();
 *
 * signUp({
 *   email: 'user@example.com',
 *   password: 'password123',
 *   full_name: 'John Doe'
 * }, {
 *   onSuccess: (data) => {
 *     if (!data.session) {
 *       // Email confirmation required
 *       console.log('Please check your email to verify your account');
 *     }
 *   },
 * });
 * ```
 */
export function useSignUp() {
  return useMutation({
    mutationFn: async (credentials: SignUpRequest) => {
      const validated = signUpRequestSchema.parse(credentials);

      const { data, error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          data: {
            full_name: validated.full_name,
          },
        },
      });

      if (error) {
        throw new Error(mapAuthError(error));
      }

      const response = signUpResponseSchema.parse(data);

      return response;
    },
    onSuccess: (data) => {
      if (data.session?.user) {
        useAuthStore.getState().setSession(data.session.user.id, data.session.user.email ?? '');
      }
    },
  });
}

// ─── Sign Out Mutation ─────────────────────────────────────────────────────

/**
 * Hook for signing out the current user.
 *
 * @example
 * ```ts
 * const { mutate: signOut, isPending } = useSignOut();
 *
 * signOut(undefined, {
 *   onSuccess: () => router.replace('/(auth)/sign-in'),
 * });
 * ```
 */
export function useSignOut() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(mapAuthError(error));
      }
    },
    onSuccess: () => {
      // Clear Zustand stores
      useAuthStore.getState().clearSession();
      useAdminStore.getState().clearAdminRole();
    },
    onError: () => {
      // Always clear local session even if API fails (graceful degradation)
      useAuthStore.getState().clearSession();
      useAdminStore.getState().clearAdminRole();
    },
  });
}

// ─── OAuth Sign In Mutation ────────────────────────────────────────────────

/**
 * Hook for signing in with OAuth providers (Google, Apple, GitHub, Facebook).
 *
 * Note: Requires deep linking setup for native platforms.
 * See app.json for scheme configuration.
 *
 * @example
 * ```ts
 * const { mutate: signInWithOAuth } = useSignInWithOAuth();
 *
 * signInWithOAuth({
 *   provider: 'google',
 *   redirectTo: 'lasufinancial://auth/callback'
 * });
 * ```
 */
export function useSignInWithOAuth() {
  return useMutation({
    mutationFn: async ({
      provider,
      redirectTo,
    }: {
      provider: OAuthProvider;
      redirectTo?: string;
    }) => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });

      if (error) {
        throw new Error(mapAuthError(error));
      }

      return data;
    },
  });
}

// ─── Verify OTP Mutation ───────────────────────────────────────────────────

export function useVerifyOtp() {
  return useMutation({
    mutationFn: async (payload: VerifyOtpRequest) => {
      const validated = verifyOtpRequestSchema.parse(payload);
      const { data, error } = await supabase.auth.verifyOtp({
        email: validated.email,
        token: validated.token,
        type: validated.type,
      });
      if (error) throw new Error(mapAuthError(error));
      return signInResponseSchema.parse(data);
    },
    onSuccess: (data) => {
      if (data.session?.user) {
        useAuthStore.getState().setSession(data.session.user.id, data.session.user.email ?? '');
      }
    },
  });
}

// ─── Resend OTP Mutation ───────────────────────────────────────────────────

export function useResendOtp() {
  return useMutation({
    mutationFn: async (payload: ResendOtpRequest) => {
      const validated = resendOtpRequestSchema.parse(payload);
      const { error } = await supabase.auth.resend({
        type: validated.type,
        email: validated.email,
      });
      if (error) throw new Error(mapAuthError(error));
    },
  });
}
