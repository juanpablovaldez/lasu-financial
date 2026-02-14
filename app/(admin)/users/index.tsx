import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { ActivityIndicator, RefreshControl, View } from 'react-native';

import { UserCard } from '@/components/admin';
import { Text } from '@/components/ui/text';
import { useAdminUsers } from '@/hooks/queries/use-admin-users';

export default function UsersScreen() {
  const router = useRouter();
  const { data: users, isLoading, refetch, isRefetching } = useAdminUsers();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted-foreground">Cargando usuarios...</Text>
      </View>
    );
  }

  if (!users || users.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-4">
        <Text className="text-center text-muted-foreground">No hay usuarios registrados</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlashList
        data={users}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            onPress={() =>
              router.push(
                `/(admin)/users/${item.user_id}` as any, // TODO: remove cast when Expo Router generates admin route types
              )
            }
          />
        )}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#fff" />
        }
      />
    </View>
  );
}
