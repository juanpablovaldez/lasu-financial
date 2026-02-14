import { Stack } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AdminBottomBar, AdminHeaderBar, AdminSidebar } from '@/components/admin';
import { Text } from '@/components/ui/text';
import { useAdminGuard } from '@/hooks/use-admin-guard';

export default function AdminLayout() {
  const { isAuthorized, isLoading } = useAdminGuard();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show loading screen while checking permissions
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted-foreground">Verificando permisos...</Text>
      </View>
    );
  }

  // If not authorized, guard hook will redirect
  if (!isAuthorized) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-destructive">Acceso denegado</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-light dark:bg-surface-dark">
      <AdminHeaderBar onMenuPress={() => setSidebarOpen(true)} />
      <AdminSidebar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <View className="flex-1">
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="transactions/index" />
          <Stack.Screen name="transactions/[id]" />
          <Stack.Screen name="operations/index" />
          <Stack.Screen name="operations/create" />
          <Stack.Screen name="operations/[id]" />
          <Stack.Screen name="users/index" />
          <Stack.Screen name="users/[id]" />
          <Stack.Screen name="audit-logs" />
        </Stack>
      </View>
      <AdminBottomBar />
    </View>
  );
}
