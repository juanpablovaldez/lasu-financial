import { useLocalSearchParams } from 'expo-router';
import { ArrowDownToLine, ArrowUpFromLine, Building2, Coins, MapPin } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useTransaction } from '@/hooks/queries/use-transaction';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/format';
import { formatDate } from '@/utils/format-date';

function StatusBadge({ status }: { status: string }) {
  const label =
    status === 'pending' ? 'Pendiente' : status === 'completed' ? 'Completado' : 'Fallido';

  return (
    <View
      className={cn(
        'self-start rounded-full px-3 py-1',
        status === 'pending' && 'bg-yellow-100 dark:bg-yellow-900/30',
        status === 'completed' && 'bg-green-100 dark:bg-green-900/30',
        status === 'failed' && 'bg-red-100 dark:bg-red-900/30',
      )}
    >
      <Text
        className={cn(
          'text-xs font-medium',
          status === 'pending' && 'text-yellow-700 dark:text-yellow-400',
          status === 'completed' && 'text-green-700 dark:text-green-400',
          status === 'failed' && 'text-red-700 dark:text-red-400',
        )}
      >
        {label}
      </Text>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="text-sm font-medium">{value}</Text>
    </View>
  );
}

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: transaction, isLoading, error } = useTransaction(id);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !transaction) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-4">
        <Text className="text-center text-destructive">
          {error ? 'Error al cargar la transacción' : 'Transacción no encontrada'}
        </Text>
      </View>
    );
  }

  const isDeposit = transaction.type === 'deposit';
  const Icon = isDeposit ? ArrowDownToLine : ArrowUpFromLine;
  const pmType = transaction.metadata?.payment_method_type as string | undefined;
  const pmSnapshot = transaction.metadata?.payment_method_snapshot as
    | { alias?: string }
    | undefined;

  return (
    <View className="flex-1 bg-background" style={{ paddingBottom: insets.bottom + 16 }}>
      <View className="gap-6 p-4">
        {/* Type Icon + Amount */}
        <View className="items-center gap-3 pt-4">
          <View
            className={cn(
              'h-16 w-16 items-center justify-center rounded-full',
              isDeposit ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30',
            )}
          >
            <Icon size={28} color={isDeposit ? '#16a34a' : '#dc2626'} />
          </View>
          <Text className="text-lg text-muted-foreground">{isDeposit ? 'Depósito' : 'Retiro'}</Text>
          <Text
            className={cn(
              'text-3xl font-bold',
              isDeposit ? 'text-green-600 dark:text-green-500' : 'text-destructive',
            )}
          >
            {isDeposit ? '+' : '-'}
            {formatCurrency(transaction.amount, 'USD', 'en-US')}
          </Text>
          <StatusBadge status={transaction.status} />
        </View>

        {/* Details Card */}
        <Card>
          <CardContent className="py-2">
            <DetailRow label="Tipo" value={isDeposit ? 'Depósito' : 'Retiro'} />
            <Separator />
            <DetailRow label="Moneda" value={transaction.currency} />
            <Separator />
            <DetailRow label="Fecha de creación" value={formatDate(transaction.created_at)} />
            {transaction.completed_at && (
              <>
                <Separator />
                <DetailRow
                  label="Fecha de completado"
                  value={formatDate(transaction.completed_at)}
                />
              </>
            )}
            {transaction.description && (
              <>
                <Separator />
                <DetailRow label="Descripción" value={transaction.description} />
              </>
            )}
          </CardContent>
        </Card>

        {/* Payment Method */}
        {!!pmType && (
          <Card>
            <CardContent className="py-2">
              <View className="flex-row items-center gap-3 py-3">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-muted">
                  {pmType === 'bank_transfer' && <Building2 size={16} color="#9BA1A6" />}
                  {pmType === 'crypto' && <Coins size={16} color="#9BA1A6" />}
                  {pmType === 'branch' && <MapPin size={16} color="#9BA1A6" />}
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="text-sm text-muted-foreground">Método de pago</Text>
                  <Text className="text-sm font-medium">
                    {pmType === 'bank_transfer'
                      ? 'Transferencia bancaria'
                      : pmType === 'crypto'
                        ? 'Cripto'
                        : 'Sucursal'}
                  </Text>
                  {pmSnapshot?.alias && (
                    <Text className="text-xs text-muted-foreground">{pmSnapshot.alias}</Text>
                  )}
                </View>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Transaction ID */}
        <View className="items-center">
          <Text className="text-xs text-muted-foreground">ID: {transaction.id}</Text>
        </View>
      </View>
    </View>
  );
}
