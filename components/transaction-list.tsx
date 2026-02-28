import { Link, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useUserActivity, type ActivityItem } from '@/hooks/queries/use-user-activity';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/format';

function ActivityItemRow({ item }: { item: ActivityItem }) {
  const router = useRouter();
  const formattedDate = new Date(item.date).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePress = () => {
    if (item.kind === 'transaction') {
      router.push(`/transaction/${item.originalId}`);
    }
  };

  const amountFormatted = formatCurrency(item.amount, 'USD');
  const sign = item.isPositive ? '+' : '-';

  return (
    <Pressable onPress={handlePress} disabled={item.kind === 'operation'}>
      <Card className="mb-2">
        <CardContent className="flex-row items-center justify-between py-4">
          <View className="gap-1">
            <Text className="font-medium">{item.label}</Text>
            <Text className="text-sm text-muted-foreground">{formattedDate}</Text>
          </View>
          <View className="items-end gap-1">
            <View className="flex-row items-center gap-1.5">
              {item.percentage !== undefined && (
                <View
                  className={cn(
                    'rounded-full px-1.5 py-0.5',
                    item.isPositive ? 'bg-green-500/10' : 'bg-red-500/10',
                  )}
                >
                  <Text
                    className={cn(
                      'text-xs font-semibold',
                      item.isPositive
                        ? 'text-green-600 dark:text-green-500'
                        : 'text-red-600 dark:text-red-500',
                    )}
                  >
                    {item.isPositive ? '+' : ''}
                    {item.percentage.toFixed(2)}%
                  </Text>
                </View>
              )}
              <Text
                className={cn(
                  'text-lg font-semibold',
                  item.isPositive ? 'text-green-600 dark:text-green-500' : 'text-destructive',
                )}
              >
                {sign}
                {amountFormatted}
              </Text>
            </View>
            <Text className="text-xs capitalize text-muted-foreground">
              {item.status === 'pending' && 'Pendiente'}
              {item.status === 'completed' && 'Completado'}
              {item.status === 'failed' && 'Fallido'}
              {item.status === 'cancelled' && 'Cancelado'}
            </Text>
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
}

export function TransactionList() {
  const { data: activity, isLoading, error } = useUserActivity(5);

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
        <Text className="text-destructive">Error al cargar actividad</Text>
      </View>
    );
  }

  if (!activity || activity.length === 0) {
    return (
      <View className="items-center py-8">
        <Text className="text-muted-foreground">No hay actividad reciente</Text>
      </View>
    );
  }

  return (
    <View>
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg font-semibold">Actividad reciente</Text>
        <Link href="/(tabs)/transactions" asChild>
          <Button variant="ghost" size="sm">
            <Text>Ver todas</Text>
          </Button>
        </Link>
      </View>
      {activity.map((item) => (
        <ActivityItemRow key={item.id} item={item} />
      ))}
      <Link href="/(tabs)/transactions" asChild>
        <Button variant="outline" className="mt-3 w-full">
          <Text>Ver todas las transacciones</Text>
        </Button>
      </Link>
    </View>
  );
}
