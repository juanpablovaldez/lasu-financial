import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAdminStore } from '@/stores/admin-store';

export default function AuthLayout() {
  const router = useRouter();
  const { session, isLoading, isInitialized } = useAuth();
  const { isAdmin, isHydrated } = useAdminStore();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (isInitialized && !isLoading && isHydrated && session) {
      if (isAdmin) {
        router.replace('/(admin)');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [session, isLoading, isInitialized, isHydrated, isAdmin, router]);

  if (!isInitialized || isLoading || !isHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-dark">
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
      </View>
    );
  }

  if (session) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
