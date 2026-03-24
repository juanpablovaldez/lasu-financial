import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { UserPlus } from 'lucide-react-native';
import { ActivityIndicator, RefreshControl, TouchableOpacity, View } from 'react-native';

import { AdminHeader, UserCard } from '@/components/admin';
import { Text } from '@/components/ui/text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAdminUserIds, useAdminUsers } from '@/hooks/queries/use-admin-users';
import { useAdminUsersFinancials } from '@/hooks/queries/use-admin-users-financials';

export default function UsersScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { data: users, isLoading, refetch, isRefetching } = useAdminUsers();
  const { data: financialsMap } = useAdminUsersFinancials();
  const { data: adminUserIds } = useAdminUserIds();
  // primary-foreground: near-white in light mode, near-black in dark mode
  const fabIconColor = colorScheme === 'dark' ? '#171717' : '#fafafa';

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
      <View className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-center text-muted-foreground">No hay usuarios registrados</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(admin)/users/create' as any)}
          className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg"
          accessibilityLabel="Registrar cliente"
          accessibilityRole="button"
        >
          <UserPlus size={24} color={fabIconColor} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-4">
        <AdminHeader title="Clientes" />
      </View>
      <FlashList
        data={users}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            financials={adminUserIds?.has(item.user_id) ? undefined : financialsMap?.[item.user_id]}
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

      <TouchableOpacity
        onPress={() => router.push('/(admin)/users/create' as any)}
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg"
        accessibilityLabel="Registrar cliente"
        accessibilityRole="button"
      >
        <UserPlus size={24} color={fabIconColor} />
      </TouchableOpacity>
    </View>
  );
}
