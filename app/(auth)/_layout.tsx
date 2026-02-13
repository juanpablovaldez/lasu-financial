import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/hooks/use-auth';

export default function AuthLayout() {
  const router = useRouter();
  const { session, isLoading, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && !isLoading && session) {
      router.replace('/(tabs)');
    }
  }, [session, isLoading, isInitialized, router]);

  if (!isInitialized || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-dark">
        <ActivityIndicator size="large" color="#3b82f6" />
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
