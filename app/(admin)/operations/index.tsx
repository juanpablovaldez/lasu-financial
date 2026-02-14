import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { ActivityIndicator, RefreshControl, View } from 'react-native';

import { OperationCard } from '@/components/admin';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAdminOperations } from '@/hooks/queries/use-admin-operations';

export default function OperationsScreen() {
  const router = useRouter();
  const { data: operations, isLoading, refetch, isRefetching } = useAdminOperations();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted-foreground">Cargando operaciones...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="p-4">
        <Button onPress={() => router.push('/(admin)/operations/create' as any)}>
          <Text>+ Crear operación</Text>
        </Button>
      </View>

      {!operations || operations.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-center text-muted-foreground">No hay operaciones registradas</Text>
        </View>
      ) : (
        <FlashList
          data={operations}
          renderItem={({ item }) => (
            <OperationCard
              operation={item}
              onPress={() => router.push(`/(admin)/operations/${item.id}` as any)}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#fff" />
          }
        />
      )}
    </View>
  );
}
