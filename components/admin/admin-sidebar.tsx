import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, Text, TouchableOpacity, View } from 'react-native';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Text as UIText } from '@/components/ui/text';
import { useAuth } from '@/hooks/use-auth';
import { useDevice } from '@/hooks/use-device';
import { useDismiss } from '@/hooks/use-dismiss';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { useAppStore } from '@/stores/app-store';
import { formatDate } from '@/utils/format-date';

const SIDEBAR_WIDTH = Dimensions.get('window').width * 0.7;
const SIDEBAR_HEIGHT = Dimensions.get('window').height * 1;

interface MenuItem {
  label: string;
  icon: string;
  path: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: 'chart.bar.fill',
    path: '/(admin)',
  },
  {
    label: 'Transacciones',
    icon: 'arrow.left.arrow.right',
    path: '/(admin)/transactions',
  },
  {
    label: 'Operaciones',
    icon: 'briefcase.fill',
    path: '/(admin)/operations',
  },
  {
    label: 'Usuarios',
    icon: 'person.3.fill',
    path: '/(admin)/users',
  },
  {
    label: 'Auditoría',
    icon: 'doc.text.fill',
    path: '/(admin)/audit-logs',
  },
];

interface AdminSidebarProps {
  visible: boolean;
  onClose: () => void;
}

export function AdminSidebar({ visible, onClose }: AdminSidebarProps) {
  const router = useRouter();
  const { session } = useAuth();
  const { themeMode, setThemeMode } = useAppStore();
  const { isPhone, isDesktop } = useDevice();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [showExitDialog, setShowExitDialog] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);
  const isVisible = useRef(false);

  const email = session?.user?.email;
  const displayName = session?.user?.user_metadata?.full_name ?? email?.split('@')[0] ?? 'User';
  const lastSignIn = session?.user?.last_sign_in_at
    ? formatDate(session.user.last_sign_in_at, 'es-MX')
    : 'Desconocido';

  const themeModes = [
    { mode: 'light' as const, label: 'Claro', icon: 'sun.max.fill' as const },
    { mode: 'dark' as const, label: 'Oscuro', icon: 'moon.fill' as const },
    { mode: 'system' as const, label: 'Sistema', icon: 'iphone' as const },
  ];

  useEffect(() => {
    const openDuration = prefersReducedMotion ? 0 : 280;
    const closeDuration = prefersReducedMotion ? 0 : 220;

    if (visible) {
      isVisible.current = true;
      isAnimating.current = true;
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: openDuration,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: openDuration,
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
          duration: closeDuration,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: closeDuration,
          useNativeDriver: true,
        }),
      ]).start(() => {
        isAnimating.current = false;
        isVisible.current = false;
      });
    }
  }, [visible, slideAnim, backdropAnim, prefersReducedMotion]);

  const handleMenuPress = useCallback(
    (path: string) => {
      onClose();
      router.push(path as any);
    },
    [onClose, router],
  );

  const handleExitAdmin = useCallback(() => {
    setShowExitDialog(false);
    onClose();
    router.replace('/(tabs)');
  }, [onClose, router]);

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
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: SIDEBAR_WIDTH,
          height: SIDEBAR_HEIGHT,
          ...(isDesktop && { overscrollBehavior: 'contain' }),
        }}
      >
        <View className="flex-1 bg-background pt-16 shadow-2xl">
          {/* User header */}
          <View className="border-b border-border px-5 pb-5">
            <View className="flex-row items-center gap-3">
              <View className="h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-muted">
                <Text className="text-xl font-bold text-foreground">
                  {email?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-lg font-bold text-foreground" numberOfLines={1}>
                  {displayName}
                </Text>
                <Text className="text-sm text-muted-foreground" numberOfLines={1}>
                  {email}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.7}
                accessibilityLabel="Cerrar menú"
                accessibilityRole="button"
              >
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

          {/* Navigation menu */}
          <View className="border-b border-border px-5 py-4">
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Navegación
            </Text>
            <View className="gap-2">
              {MENU_ITEMS.map((item) => (
                <TouchableOpacity
                  key={item.path}
                  onPress={() => handleMenuPress(item.path)}
                  activeOpacity={0.7}
                  className="flex-row items-center gap-3 rounded-lg px-4 py-3 active:bg-muted"
                >
                  <IconSymbol name={item.icon as any} size={20} color="#9BA1A6" />
                  <UIText className="text-base text-foreground">{item.label}</UIText>
                </TouchableOpacity>
              ))}
            </View>
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

          {/* Exit admin button */}
          <View className={`border-t border-border px-5 ${isPhone ? 'py-8' : 'py-4'}`}>
            <TouchableOpacity
              onPress={() => setShowExitDialog(true)}
              activeOpacity={0.7}
              className="flex-row items-center gap-3 rounded-lg bg-destructive/10 px-4 py-3"
            >
              <IconSymbol name="arrow.left" size={20} color="#ef4444" />
              <UIText className="text-base font-semibold text-destructive">Volver a la app</UIText>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Exit confirmation dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Salir del panel de administración</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres volver a la aplicación principal?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <UIText>Cancelar</UIText>
            </AlertDialogCancel>
            <AlertDialogAction onPress={handleExitAdmin}>
              <UIText>Salir</UIText>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
}
