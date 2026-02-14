import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { HeaderBar } from '@/components/header-bar';
import { Sidebar } from '@/components/sidebar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import TabBarBackground from '@/components/ui/tab-bar-background';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { session, isLoading, isInitialized } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isInitialized && !isLoading && !session) {
      router.replace('/(auth)/sign-in');
    }
  }, [session, isLoading, isInitialized, router]);

  if (!isInitialized || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-dark">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <View className="flex-1 bg-surface-light dark:bg-surface-dark">
      <HeaderBar onAvatarPress={() => setSidebarOpen(true)} />
      <Sidebar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Billetera',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="dollarsign" color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
