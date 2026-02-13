import { FlashList } from '@shopify/flash-list';
import { ActivityIndicator, Text, View } from 'react-native';

import { useInstruments } from '@/hooks/queries/use-instruments';
import type { Instrument } from '@/schemas';

export default function HomeScreen() {
  const { data: instruments, isLoading, error } = useInstruments();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-light dark:bg-surface-dark">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-light px-4 dark:bg-surface-dark">
        <Text className="text-center text-red-500">
          Failed to load instruments: {error.message}
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Instrument }) => (
    <View className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
      <Text className="text-base text-gray-900 dark:text-gray-100">{item.name}</Text>
      {item.symbol && (
        <Text className="mt-0.5 text-sm text-muted-light dark:text-muted-dark">{item.symbol}</Text>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-surface-light dark:bg-surface-dark">
      <FlashList
        data={instruments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}
