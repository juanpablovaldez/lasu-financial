import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { ActivityIndicator, RefreshControl, TouchableOpacity, View } from 'react-native';

import { OperationCard } from '@/components/admin';
import { Text } from '@/components/ui/text';
import { useAdminOperations } from '@/hooks/queries/use-admin-operations';
import { useAdminUsers } from '@/hooks/queries/use-admin-users';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function OperationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { data: operations, isLoading, refetch, isRefetching } = useAdminOperations();
  const { data: users } = useAdminUsers();
  const userNameMap = Object.fromEntries(
    (users ?? []).map((u) => [u.user_id, u.full_name ?? u.email ?? u.user_id]),
  );
  const userEmailMap = Object.fromEntries(
    (users ?? []).map((u) => [u.user_id, u.email ?? u.user_id]),
  );

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
              userName={userNameMap[item.user_id]}
              userEmail={userEmailMap[item.user_id]}
              onPress={() => router.push(`/(admin)/operations/${item.id}` as any)}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#fff" />
          }
        />
      )}

      <TouchableOpacity
        onPress={() => router.push('/(admin)/operations/create' as any)}
        activeOpacity={0.8}
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg"
      >
        <Plus size={24} color={colorScheme === 'dark' ? '#000' : '#fff'} />
      </TouchableOpacity>
    </View>
  );
}
