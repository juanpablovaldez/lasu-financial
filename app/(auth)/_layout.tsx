import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAdminStore } from '@/stores/admin-store';

export default function AuthLayout() {
  const { session, isLoading, isInitialized } = useAuth();
  const { isAdmin, isHydrated } = useAdminStore();
  const colorScheme = useColorScheme();

  if (!isInitialized || isLoading || !isHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-dark">
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#ffffff' : '#000000'} />
      </View>
    );
  }

  if (session) {
    return <Redirect href={isAdmin ? '/(admin)' : '/(tabs)'} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
