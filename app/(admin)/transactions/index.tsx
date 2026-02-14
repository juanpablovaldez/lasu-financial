import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { ActivityIndicator, RefreshControl, View } from 'react-native';

import { TransactionCard } from '@/components/admin';
import { Text } from '@/components/ui/text';
import { usePendingTransactions } from '@/hooks/queries/use-pending-transactions';

export default function PendingTransactionsScreen() {
  const router = useRouter();
  const { data: transactions, isLoading, refetch, isRefetching } = usePendingTransactions();

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
            onPress={() => router.push(`/(admin)/transactions/${item.id}` as any)}
          />
        )}
        estimatedItemSize={150}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#fff" />
        }
      />
    </View>
  );
}
