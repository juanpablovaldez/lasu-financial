import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppStore } from '@/stores/app-store';

function getInitial(email?: string): string {
  return email?.charAt(0).toUpperCase() ?? '?';
}

interface AdminHeaderBarProps {
  onMenuPress: () => void;
}

export function AdminHeaderBar({ onMenuPress }: AdminHeaderBarProps) {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const colorScheme = useColorScheme();
  const { themeMode, setThemeMode } = useAppStore();

  const email = session?.user?.email;
  const displayName = session?.user?.user_metadata?.full_name ?? email?.split('@')[0] ?? 'User';

  const toggleTheme = () => {
    if (themeMode === 'dark') {
      setThemeMode('light');
    } else {
      setThemeMode('dark');
    }
  };

  return (
    <View
      style={{ paddingTop: insets.top + 8 }}
      className="flex-row items-center justify-between bg-background px-4 pb-3"
    >
      {/* Left: Avatar + Admin subtitle */}
      <TouchableOpacity
        onPress={onMenuPress}
        activeOpacity={0.7}
        className="flex-row items-center gap-3"
        accessibilityLabel="Abrir menú"
        accessibilityRole="button"
      >
        <Avatar alt={displayName} className="h-12 w-12">
          <AvatarFallback>
            <Text className="text-lg font-bold">{getInitial(email)}</Text>
          </AvatarFallback>
        </Avatar>
        <View>
          <Text className="text-sm text-muted-foreground">Panel de administración</Text>
          <Text className="text-lg font-bold text-foreground">{displayName}</Text>
        </View>
      </TouchableOpacity>

      {/* Right: Theme switcher */}
      <TouchableOpacity
        onPress={toggleTheme}
        activeOpacity={0.7}
        className="h-11 w-11 items-center justify-center rounded-full bg-muted"
        accessibilityLabel={
          colorScheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
        }
        accessibilityRole="button"
        accessibilityHint="Alterna entre el tema claro y oscuro"
      >
        <IconSymbol
          name={colorScheme === 'dark' ? 'sun.max.fill' : 'moon.fill'}
          size={22}
          color={colorScheme === 'dark' ? '#facc15' : '#9BA1A6'}
        />
      </TouchableOpacity>
    </View>
  );
}
