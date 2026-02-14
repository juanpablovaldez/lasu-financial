import { View } from 'react-native';

import { Text } from '@/components/ui/text';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  return (
    <View className="mb-4">
      <Text className="text-2xl font-bold">{title}</Text>
      {subtitle && <Text className="mt-1 text-sm text-muted-foreground">{subtitle}</Text>}
    </View>
  );
}
