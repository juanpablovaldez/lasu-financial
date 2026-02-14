import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { Animated, Dimensions, Pressable, Text, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/stores/app-store';

import { useDevice } from '@/hooks/use-device';
import { useDismiss } from '@/hooks/use-dismiss';
import { formatDate } from 'date-fns';

const SIDEBAR_WIDTH = Dimensions.get('window').width * 0.78;
const SIDEBAR_HEIGHT = Dimensions.get('window').height * 1;

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

export function Sidebar({ visible, onClose }: SidebarProps) {
  const router = useRouter();
  const { session } = useAuth();
  const { themeMode, setThemeMode } = useAppStore();
  const { isPhone } = useDevice();
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);
  const isVisible = useRef(false);

  const email = session?.user?.email;
  const displayName = session?.user?.user_metadata?.full_name ?? email?.split('@')[0] ?? 'User';
  const lastSignIn = formatDate(new Date(session?.user?.last_sign_in_at ?? ''), 'dd/MM/yyyy HH:mm');

  useEffect(() => {
    if (visible) {
      isVisible.current = true;
      isAnimating.current = true;
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start(() => {
        isAnimating.current = false;
      });
    } else if (isVisible.current) {
      isAnimating.current = true;
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => {
        isAnimating.current = false;
        isVisible.current = false;
      });
    }
  }, [visible, slideAnim, backdropAnim]);
  const handleSignOut = useCallback(async () => {
    onClose();
    await supabase.auth.signOut();
    router.replace('/(auth)/sign-in');
  }, [onClose, router]);

  const themeModes = [
    { mode: 'light' as const, label: 'Claro', icon: 'sun.max.fill' as const },
    { mode: 'dark' as const, label: 'Oscuro', icon: 'moon.fill' as const },
    { mode: 'system' as const, label: 'Sistema', icon: 'iphone' as const },
  ];

  useDismiss({
    visible,
    onDismiss: onClose,
    isAnimating,
  });

  if (!visible && !isVisible.current) return null;

  return (
    <View className="absolute inset-0 z-50" pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View style={{ opacity: backdropAnim }} className="absolute inset-0 bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />
      </Animated.View>

      {/* Sidebar panel */}
      <Animated.View
        style={{
          transform: [{ translateX: slideAnim }],
          width: SIDEBAR_WIDTH,
          height: SIDEBAR_HEIGHT,
        }}
        className="absolute bottom-0 left-0 top-0 bg-background shadow-2xl"
      >
        <View className="flex-1 pt-16">
          {/* User header */}
          <View className="border-b border-border px-5 pb-5">
            <View className="flex-row items-center gap-3">
              <View className="h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-muted">
                <Text className="text-xl font-bold text-foreground">
                  {email?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-foreground">{displayName}</Text>
                <Text className="text-sm text-muted-foreground">{email}</Text>
              </View>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <IconSymbol name="xmark" size={22} color="#9BA1A6" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Session info */}
          <View className="border-b border-border px-5 py-4">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Sesión
            </Text>
            <Text className="text-sm text-foreground">Último inicio de sesión: {lastSignIn}</Text>
          </View>

          {/* Theme switcher */}
          <View className="border-b border-border px-5 py-4">
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Apariencia
            </Text>
            <View className="flex-row gap-2">
              {themeModes.map(({ mode, label, icon }) => {
                const isActive = themeMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => setThemeMode(mode)}
                    activeOpacity={0.7}
                    className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2.5 ${
                      isActive ? 'bg-primary/10' : 'bg-muted'
                    }`}
                  >
                    <IconSymbol name={icon} size={16} color={isActive ? '#3b82f6' : '#9BA1A6'} />
                    <Text
                      className={`text-xs font-medium ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Spacer */}
          <View className="flex-1" />

          {/* Sign out */}
          <View className={`border-t border-border px-5 ${isPhone ? 'py-8' : 'py-4'}`}>
            <TouchableOpacity
              onPress={handleSignOut}
              activeOpacity={0.7}
              className="flex-row items-center gap-3 rounded-lg bg-destructive/10 px-4 py-3"
            >
              <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#ef4444" />
              <Text className="text-base font-semibold text-destructive">Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
