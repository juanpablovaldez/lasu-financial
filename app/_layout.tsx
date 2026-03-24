import '../global.css';

import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { Toaster } from '@/components/ui/toaster';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { NAV_THEME } from '@/lib/constants';
import { AuthProvider } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://e10f7df8f39993398515cc3e3f0c33d1@o4510976541786112.ingest.us.sentry.io/4510976553451520',
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],
  // spotlight: __DEV__,
});

export default Sentry.wrap(function RootLayout() {
  const colorScheme = useColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    setColorScheme(colorScheme);
  }, [colorScheme, setColorScheme]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const color = colorScheme === 'dark' ? '#151718' : '#ffffff';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', color);
    try {
      localStorage.setItem('lasu-theme-color', color);
    } catch {}
  }, [colorScheme]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider value={NAV_THEME[colorScheme]}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(admin)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen
              name="transaction/[id]"
              options={{
                title: 'Detalle de transacción',
                headerBackTitle: 'Volver',
              }}
            />
            <Stack.Screen
              name="payment-methods"
              options={{
                title: 'Métodos de pago',
                headerBackTitle: 'Volver',
              }}
            />
            <Stack.Screen
              name="payment-method-form"
              options={{
                title: 'Método de pago',
                headerBackTitle: 'Volver',
              }}
            />
            <Stack.Screen name="+not-found" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
          <Toaster />
          <PortalHost />
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
});
