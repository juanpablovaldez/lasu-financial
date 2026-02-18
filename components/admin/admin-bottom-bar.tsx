import { usePathname, useRouter } from 'expo-router';
import { Platform, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Text } from '@/components/ui/text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDevice } from '@/hooks/use-device';

interface BottomBarItem {
  label: string;
  icon: string;
  path: string;
}

const ITEMS: BottomBarItem[] = [
  {
    label: 'Inicio',
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
];

export function AdminBottomBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { isDesktop } = useDevice();
  const colorScheme = useColorScheme();

  const handlePress = (path: string) => {
    if (pathname === path || pathname === path.replace('/(admin)', '')) return;
    router.push(path as any);
  };

  const isActive = (path: string) => {
    const normalizedPath = path.replace('/(admin)', '');
    // Exact match for root dashboard, prefix match for subsections
    if (normalizedPath === '' || normalizedPath === '/') {
      return pathname === path || pathname === '/' || pathname === '';
    }
    return pathname === path || pathname.startsWith(path + '/') || pathname === normalizedPath;
  };

  return (
    <View
      style={{
        paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
        ...(isDesktop && { maxWidth: 480, alignSelf: 'center' as const, width: '100%' as any }),
      }}
      className="border-t border-border bg-background px-2 pt-2"
    >
      <View className="flex-row">
        {ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <TouchableOpacity
              key={item.path}
              onPress={() => handlePress(item.path)}
              activeOpacity={active ? 1 : 0.7}
              disabled={active}
              className="flex-1 items-center gap-1 py-2"
              accessibilityLabel={item.label}
              accessibilityRole="button"
            >
              <IconSymbol
                name={item.icon as any}
                size={22}
                color={active ? (colorScheme === 'dark' ? '#ffffff' : '#000000') : '#9BA1A6'}
              />
              <Text
                className={`text-xs font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
