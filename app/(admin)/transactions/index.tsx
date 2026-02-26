import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';

import { TransactionCard } from '@/components/admin';
import { Text } from '@/components/ui/text';
import { useAdminUsers } from '@/hooks/queries/use-admin-users';
import { usePendingTransactions } from '@/hooks/queries/use-pending-transactions';

export default function PendingTransactionsScreen() {
  const router = useRouter();
  const { data: transactions, isLoading, refetch, isRefetching } = usePendingTransactions();
  const { data: users } = useAdminUsers();

  const userNameMap = useMemo(() => {
    const map = new Map<string, string>();
    users?.forEach((u) => {
      if (u.full_name) map.set(u.user_id, u.full_name);
    });
    return map;
  }, [users]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted-foreground">Cargando transacciones...</Text>
      </View>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-4">
        <Text className="text-center text-muted-foreground">
          No hay transacciones pendientes de aprobación
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlashList
        data={transactions}
        renderItem={({ item }) => (
          <TransactionCard
            transaction={item}
            userName={userNameMap.get(item.user_id)}
            onPress={() => router.push(`/(admin)/transactions/${item.id}` as any)}
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
