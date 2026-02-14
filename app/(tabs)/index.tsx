import { FlashList } from '@shopify/flash-list';
import { ActivityIndicator, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useInstruments } from '@/hooks/queries/use-instruments';
import type { Instrument } from '@/schemas';

export default function HomeScreen() {
  const { data: instruments, isLoading, error } = useInstruments();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-4">
        <Text className="text-center text-destructive">
          Failed to load instruments: {error.message}
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Instrument }) => (
    <View className="border-b border-border px-4 py-4">
      <Text className="text-base text-foreground">{item.name}</Text>
      {item.symbol && <Text className="mt-0.5 text-sm text-muted-foreground">{item.symbol}</Text>}
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <FlashList
        data={instruments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}
