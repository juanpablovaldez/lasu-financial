import type { Session } from '@supabase/supabase-js';
import { createContext, useEffect, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';

import { supabase } from '@/lib/supabase';
import type { User } from '@/schemas';
import { useAuthStore } from '@/stores/auth-store';

// ─── Types ─────────────────────────────────────────────────────────────────

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
}

// ─── Context ───────────────────────────────────────────────────────────────

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ──────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider manages Supabase authentication state.
 *
 * Features:
 * - Initializes session from MMKV storage on mount
 * - Listens to auth state changes (sign-in, sign-out, token refresh)
 * - Syncs session with Zustand auth store
 * - Validates session when app returns to foreground (native only)
 * - Handles edge cases (hydration races, stale state, network errors)
 *
 * Usage:
 * Wrap your app with AuthProvider and use the useAuth hook to access auth state.
 *
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Wait for Zustand to hydrate from MMKV before showing UI
  const isHydrated = useAuthStore((state) => state.isHydrated);

  // ─── Phase 2: Session Initialization ──────────────────────────────────────

  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (isMounted) {
          setSession(currentSession);

          if (currentSession?.user) {
            useAuthStore
              .getState()
              .setSession(currentSession.user.id, currentSession.user.email ?? '');
          } else {
            useAuthStore.getState().clearSession();
          }

          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Session initialization failed:', error);

        if (isMounted) {
          setSession(null);
          useAuthStore.getState().clearSession();
          setIsInitialized(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // ─── Phase 3: Auth State Listener ─────────────────────────────────────────

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);

      if (currentSession?.user) {
        useAuthStore.getState().setSession(currentSession.user.id, currentSession.user.email ?? '');
      } else {
        useAuthStore.getState().clearSession();
        setUser(null);
      }

      if (__DEV__) {
        console.log('Auth event:', event, currentSession?.user?.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ─── Phase 4: App Foreground Validation (Native Only) ────────────────────

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const subscription = AppState.addEventListener('change', async (state) => {
      if (state === 'active' && session) {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!currentSession) {
          setSession(null);
          useAuthStore.getState().clearSession();
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [session]);

  // ─── Phase 1: Wait for Zustand Hydration ──────────────────────────────────

  if (!isHydrated) {
    return null;
  }

  // ─── Context Value ────────────────────────────────────────────────────────

  const value: AuthContextValue = {
    session,
    user,
    isLoading,
    isInitialized,
    isAuthenticated: !!session,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
