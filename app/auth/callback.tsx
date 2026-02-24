import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { supabase } from '@/lib/supabase';
import { useAdminStore } from '@/stores/admin-store';
import { useAuthStore } from '@/stores/auth-store';

// ─── Auth Callback Screen ──────────────────────────────────────────────────
// Handles the OAuth redirect on web. detectSessionInUrl is disabled in the
// Supabase client (required for native/MMKV), so we manually parse the URL
// and set the session ourselves.

export default function AuthCallbackScreen() {
  const router = useRouter();
  const navigated = useRef(false);

  useEffect(() => {
    async function handleSession(userId: string, email: string) {
      if (navigated.current) return;
      navigated.current = true;

      useAuthStore.getState().setSession(userId, email);

      const { data: adminData } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', userId)
        .is('revoked_at', null)
        .single();

      if (adminData?.role === 'super_admin' || adminData?.role === 'admin') {
        useAdminStore.getState().setAdminRole(adminData.role);
        router.replace('/(admin)');
        return;
      }

      useAdminStore.getState().clearAdminRole();
      router.replace('/(tabs)');
    }

    async function processCallback() {
      if (typeof window === 'undefined') return;

      // PKCE flow: ?code=...
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (!error && data.session?.user) {
          await handleSession(data.session.user.id, data.session.user.email ?? '');
          return;
        }
      }

      // Implicit flow: #access_token=...&refresh_token=...
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!error && data.session?.user) {
          await handleSession(data.session.user.id, data.session.user.email ?? '');
          return;
        }
      }

      // Nothing worked — send back to sign-in
      router.replace('/(auth)/sign-in');
    }

    processCallback();
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background">
      <ActivityIndicator size="large" className="text-primary" />
      <Text className="text-sm text-muted-foreground">Iniciando sesión...</Text>
    </View>
  );
}
