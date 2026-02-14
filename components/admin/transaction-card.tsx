import { Pressable, View } from 'react-native';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import type { Transaction } from '@/schemas';
import { formatCurrency } from '@/utils/format';
import { formatDate } from '@/utils/format-date';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionCard({ transaction, onPress }: TransactionCardProps) {
  const typeLabel = transaction.type === 'deposit' ? 'Depósito' : 'Retiro';
  const typeColor = transaction.type === 'deposit' ? 'text-green-500' : 'text-yellow-500';

  const content = (
    <Card className="mb-3">
      <CardHeader>
        <View className="flex-row items-center justify-between">
          <Text className={`font-semibold ${typeColor}`}>{typeLabel}</Text>
          <Text className="text-xs text-muted-foreground">
            {formatDate(transaction.created_at, 'es-AR')}
          </Text>
        </View>
      </CardHeader>
      <CardContent>
        <View className="gap-2">
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Monto:</Text>
            <Text className="font-semibold">
              {formatCurrency(transaction.amount, transaction.currency, 'es-AR')}
            </Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Usuario:</Text>
            <Text className="font-mono text-xs">{transaction.user_id.slice(0, 8)}...</Text>
          </View>

          {transaction.description && (
            <View>
              <Text className="text-muted-foreground">Descripción:</Text>
              <Text className="text-sm">{transaction.description}</Text>
            </View>
          )}

          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Estado:</Text>
            <StatusBadge status={transaction.status} />
          </View>
        </View>
      </CardContent>
    </Card>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-70">
        {content}
      </Pressable>
    );
  }

  return content;
}

function StatusBadge({ status }: { status: string }) {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'pending':
        return 'Pendiente';
      case 'failed':
        return 'Fallida';
      default:
        return status;
    }
  };

  return <Text className={`text-xs font-semibold ${getStatusColor()}`}>{getStatusLabel()}</Text>;
}
