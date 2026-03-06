import { useColorScheme as useRNColorScheme } from 'react-native';

import { useAppStore } from '@/stores/app-store';

/**
 * Returns the effective color scheme based on the user's preference.
 * When themeMode is 'system', falls back to the OS setting.
 */
export function useColorScheme(): 'light' | 'dark' {
  const systemScheme = useRNColorScheme();
  const themeMode = useAppStore((s) => s.themeMode);

  if (themeMode === 'system') {
    return systemScheme ?? 'dark';
  }

  return themeMode;
}
