import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useInfiniteTransactions } from '@/hooks/queries/use-infinite-transactions';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/schemas';
import { formatCurrency } from '@/utils/format';

function TransactionItem({ item }: { item: Transaction }) {
  const router = useRouter();
  const isDeposit = item.type === 'deposit';
  const formattedDate = new Date(item.created_at).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  const locale = item.currency === 'USD' ? 'en-US' : 'es-AR';

  return (
    <Pressable onPress={() => router.push(`/transaction/${item.id}`)}>
      <Card className="mb-2">
        <CardContent className="flex-row items-center justify-between py-4">
          <View className="gap-1">
            <Text className="font-medium">{isDeposit ? 'Depósito' : 'Retiro'}</Text>
            <Text className="text-sm text-muted-foreground">{formattedDate}</Text>
            {item.description && (
              <Text className="text-xs text-muted-foreground">{item.description}</Text>
            )}
          </View>
          <View className="items-end gap-1">
            <Text
              className={cn(
                'text-lg font-semibold',
                isDeposit ? 'text-green-600 dark:text-green-500' : 'text-destructive',
              )}
            >
              {isDeposit ? '+' : '-'}
              {formatCurrency(item.amount, item.currency, locale)}
            </Text>
            <Text className="text-xs capitalize text-muted-foreground">
              {item.status === 'pending' && 'Pendiente'}
              {item.status === 'completed' && 'Completado'}
              {item.status === 'failed' && 'Fallido'}
            </Text>
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
}

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteTransactions();

  const transactions = data?.pages.flatMap((page) => page.transactions) ?? [];

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
        <Text className="text-center text-destructive">Error al cargar transacciones</Text>
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">No hay transacciones</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlashList
        data={transactions}
        renderItem={({ item }) => <TransactionItem item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16 }}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="items-center py-4">
              <ActivityIndicator size="small" />
            </View>
          ) : null
        }
      />
    </View>
  );
}
