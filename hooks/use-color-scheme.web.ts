import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { useAppStore } from '@/stores/app-store';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web.
 * Respects the user's theme preference from the app store.
 */
export function useColorScheme(): 'light' | 'dark' {
  const [hasHydrated, setHasHydrated] = useState(false);
  const themeMode = useAppStore((s) => s.themeMode);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const systemScheme = useRNColorScheme();

  if (!hasHydrated) {
    return 'light';
  }

  if (themeMode === 'system') {
    return systemScheme ?? 'light';
  }

  return themeMode;
}
