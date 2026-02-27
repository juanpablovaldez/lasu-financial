import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
import { useSignOut } from '@/hooks/mutations/use-auth-mutations';
import { useAuth } from '@/hooks/use-auth';
import { useAppStore } from '@/stores/app-store';

import { useDevice } from '@/hooks/use-device';
import { useDismiss } from '@/hooks/use-dismiss';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { formatDate } from '@/utils/format-date';

const SIDEBAR_WIDTH = Dimensions.get('window').width * 0.7;
const SIDEBAR_HEIGHT = Dimensions.get('window').height * 1;

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

export function Sidebar({ visible, onClose }: SidebarProps) {
  const router = useRouter();
  const { session } = useAuth();
  const { themeMode, setThemeMode } = useAppStore();
  const colorScheme = useColorScheme();
  const { isPhone, isDesktop } = useDevice();
  const prefersReducedMotion = usePrefersReducedMotion();
  const { mutate: signOut, isPending: isSigningOut } = useSignOut();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);
  const isVisible = useRef(false);

  const email = session?.user?.email;
  const displayName = session?.user?.user_metadata?.full_name ?? email?.split('@')[0] ?? 'User';
  const lastSignIn = session?.user?.last_sign_in_at
    ? formatDate(session.user.last_sign_in_at, 'es-MX')
    : 'Desconocido';

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

  const handleSignOut = useCallback(() => {
    setShowSignOutDialog(true);
  }, []);

  const executeSignOut = useCallback(() => {
    setShowSignOutDialog(false);
    onClose();
    signOut(undefined, {
      onSuccess: () => {
        router.replace('/(auth)/sign-in');
      },
    });
  }, [onClose, router, signOut]);

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
          <ScrollView
            className="flex-1"
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {/* Logo */}
            <View className="items-center border-b border-border px-5 pb-4 pt-2">
              <Image
                source={require('@/assets/images/lasucompleto.png')}
                style={{
                  width: 140,
                  height: 46,
                  tintColor: colorScheme === 'dark' ? '#ffffff' : '#000000',
                }}
                resizeMode="contain"
                accessibilityLabel="Lasu Financial"
                accessibilityRole="image"
              />
            </View>

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
                  accessibilityLabel="Cerrar menú lateral"
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
                      <IconSymbol
                        name={icon}
                        size={16}
                        color={
                          isActive ? (colorScheme === 'dark' ? '#ffffff' : '#000000') : '#9BA1A6'
                        }
                      />
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

            {/* Navigation links */}
            <View className="border-b border-border px-5 py-4">
              <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Cuenta
              </Text>
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  router.push('/payment-methods');
                }}
                activeOpacity={0.7}
                className="flex-row items-center gap-3 rounded-lg px-3 py-2.5"
                accessibilityRole="button"
                accessibilityLabel="Métodos de pago"
              >
                <IconSymbol name="creditcard" size={20} color="#9BA1A6" />
                <Text className="text-base text-foreground">Métodos de pago</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Sign out */}
          <View className={`border-t border-border px-5 ${isPhone ? 'py-8' : 'py-4'}`}>
            <TouchableOpacity
              onPress={handleSignOut}
              activeOpacity={0.7}
              disabled={isSigningOut}
              className="flex-row items-center gap-3 rounded-lg bg-destructive/10 px-4 py-3"
            >
              <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="#ef4444" />
              <Text className="text-base font-semibold text-destructive">
                {isSigningOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Sign out confirmation dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cerrar sesión</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres cerrar sesión?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSigningOut}>
              <UIText>Cancelar</UIText>
            </AlertDialogCancel>
            <AlertDialogAction onPress={executeSignOut} disabled={isSigningOut}>
              <UIText>{isSigningOut ? 'Cerrando...' : 'Cerrar sesión'}</UIText>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
}
