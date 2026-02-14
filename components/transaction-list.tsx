import { FlashList } from '@shopify/flash-list';
import { ActivityIndicator, View } from 'react-native';

import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useTransactions } from '@/hooks/queries/use-transactions';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/schemas';
import { formatCurrency } from '@/utils/format';

function TransactionItem({ item }: { item: Transaction }) {
  const isDeposit = item.type === 'deposit';
  const formattedDate = new Date(item.created_at).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const locale = item.currency === 'USD' ? 'en-US' : 'es-AR';

  return (
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
  );
}

export function TransactionList() {
  const { data: transactions, isLoading, error } = useTransactions(5);

  if (isLoading) {
    return (
      <View className="items-center py-8">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="items-center py-8">
        <Text className="text-destructive">Error al cargar transacciones</Text>
      </View>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <View className="items-center py-8">
        <Text className="text-muted-foreground">No hay transacciones recientes</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="mb-4 flex-row items-center justify-between gap-2">
        <Text className="text-lg font-semibold">Actividad reciente</Text>
        <Text className="text-sm text-muted-foreground">Ver todas</Text>
      </View>
      <FlashList
        data={transactions}
        renderItem={({ item }) => <TransactionItem item={item} />}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
