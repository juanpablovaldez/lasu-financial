import { View } from 'react-native';

import { Text } from '@/components/ui/text';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  return (
    <View className="pb-2">
      <Text className="text-3xl font-bold tracking-tight">{title}</Text>
      {subtitle && <Text className="mt-0.5 text-sm text-muted-foreground">{subtitle}</Text>}
    </View>
  );
}
