import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppStore } from '@/stores/app-store';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días,';
  if (hour < 18) return 'Buenas tardes,';
  return 'Buenas noches,';
}

function getInitial(email?: string): string {
  return email?.charAt(0).toUpperCase() ?? '?';
}

interface HeaderBarProps {
  onAvatarPress: () => void;
}

export function HeaderBar({ onAvatarPress }: HeaderBarProps) {
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
      {/* Left: Avatar + Greeting */}
      <TouchableOpacity
        onPress={onAvatarPress}
        activeOpacity={0.7}
        className="flex-row items-center gap-3"
      >
        <Avatar alt={displayName} className="h-12 w-12">
          <AvatarFallback>
            <Text className="text-lg font-bold">{getInitial(email)}</Text>
          </AvatarFallback>
        </Avatar>
        <View>
          <Text className="text-sm text-muted-foreground">{getGreeting()}</Text>
          <Text className="text-lg font-bold text-foreground">{displayName}</Text>
        </View>
      </TouchableOpacity>

      {/* Right: Theme switcher */}
      <TouchableOpacity
        onPress={toggleTheme}
        activeOpacity={0.7}
        className="h-11 w-11 items-center justify-center rounded-full bg-muted"
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
