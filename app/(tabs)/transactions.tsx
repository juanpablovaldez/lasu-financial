import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContactSupportCard } from '@/components/contact-support-card';
import { TransactionDialog } from '@/components/transaction-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useInfiniteTransactions } from '@/hooks/queries/use-infinite-transactions';
import { useUserOperations } from '@/hooks/queries/use-user-operations';
import { cn } from '@/lib/utils';
import type { Operation, Transaction } from '@/schemas';
import { formatCurrency } from '@/utils/format';

type ListItem =
  | { kind: 'transaction'; id: string; date: string; data: Transaction }
  | { kind: 'operation'; id: string; date: string; data: Operation };

const OPERATION_LABELS: Record<string, string> = {
  ganancia: 'Ganancia',
  perdida: 'Pérdida',
  ingreso: 'Ingreso',
  egreso: 'Egreso',
  buy: 'Compra',
  sell: 'Venta',
  dividend: 'Dividendo',
  fee: 'Comisión',
  transfer: 'Transferencia',
};

const POSITIVE_TYPES = new Set(['ganancia', 'ingreso', 'dividend']);

function ActionCards({ onDeposit, onWithdraw }: { onDeposit: () => void; onWithdraw: () => void }) {
  return (
    <View className="flex-row gap-3 pb-4">
      <Pressable className="flex-1" onPress={onDeposit}>
        <Card className="border-green-200 dark:border-green-800/40">
          <CardContent className="items-center gap-2 py-5">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <ArrowDownToLine size={22} color="#16a34a" />
            </View>
            <Text className="text-sm font-semibold">Solicitar depósito</Text>
          </CardContent>
        </Card>
      </Pressable>
      <Pressable className="flex-1" onPress={onWithdraw}>
        <Card className="border-red-200 dark:border-red-800/40">
          <CardContent className="items-center gap-2 py-5">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <ArrowUpFromLine size={22} color="#dc2626" />
            </View>
            <Text className="text-sm font-semibold">Solicitar retiro</Text>
          </CardContent>
        </Card>
      </Pressable>
    </View>
  );
}

function TransactionRow({ item }: { item: Transaction }) {
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
              {item.status === 'cancelled' && 'Anulado'}
            </Text>
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
}

function OperationRow({ item }: { item: Operation }) {
  const isPositive = POSITIVE_TYPES.has(item.operation_type);
  const label = OPERATION_LABELS[item.operation_type] ?? item.operation_type;
  const formattedDate = new Date(item.created_at).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card className="mb-2">
      <CardContent className="flex-row items-center justify-between py-4">
        <View className="gap-1">
          <Text className="font-medium">{label}</Text>
          <Text className="text-sm text-muted-foreground">{formattedDate}</Text>
          {item.description && (
            <Text className="text-xs text-muted-foreground">{item.description}</Text>
          )}
        </View>
        <View className="items-end gap-1">
          <Text
            className={cn(
              'text-lg font-semibold',
              isPositive ? 'text-green-600 dark:text-green-500' : 'text-destructive',
            )}
          >
            {isPositive ? '+' : '-'}
            {formatCurrency(item.total_amount_usd, 'USD', 'en-US')}
          </Text>
          <Text className="text-xs capitalize text-muted-foreground">
            {item.status === 'pending' && 'Pendiente'}
            {item.status === 'completed' && 'Completado'}
            {item.status === 'cancelled' && 'Cancelado'}
            {item.status === 'failed' && 'Fallido'}
          </Text>
        </View>
      </CardContent>
    </Card>
  );
}

function ListRow({ item }: { item: ListItem }) {
  if (item.kind === 'transaction') return <TransactionRow item={item.data} />;
  return <OperationRow item={item.data} />;
}

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const {
    data: txData,
    isLoading: txLoading,
    error: txError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTransactions();
  const { data: operations, isLoading: opLoading, error: opError } = useUserOperations();

  const isLoading = txLoading || opLoading;
  const error = txError ?? opError;

  const items = useMemo<ListItem[]>(() => {
    const result: ListItem[] = [];
    for (const tx of txData?.pages.flatMap((p) => p.transactions) ?? []) {
      result.push({ kind: 'transaction', id: `tx-${tx.id}`, date: tx.created_at, data: tx });
    }
    for (const op of operations ?? []) {
      result.push({ kind: 'operation', id: `op-${op.id}`, date: op.created_at, data: op });
    }
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [txData, operations]);

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

  if (items.length === 0) {
    return (
      <View className="flex-1 bg-background p-4">
        <ActionCards
          onDeposit={() => setDepositOpen(true)}
          onWithdraw={() => setWithdrawOpen(true)}
        />
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">No hay transacciones</Text>
        </View>
        <ContactSupportCard />
        <TransactionDialog open={depositOpen} onOpenChange={setDepositOpen} type="deposit" />
        <TransactionDialog open={withdrawOpen} onOpenChange={setWithdrawOpen} type="withdrawal" />
      </View>
    );
  }

  return (
    <>
      <View className="flex-1 bg-background">
        <FlashList
          data={items}
          renderItem={({ item }) => <ListRow item={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16 }}
          estimatedItemSize={80}
          ListHeaderComponent={
            <ActionCards
              onDeposit={() => setDepositOpen(true)}
              onWithdraw={() => setWithdrawOpen(true)}
            />
          }
          ListFooterComponent={
            <>
              {isFetchingNextPage ? (
                <View className="items-center py-4">
                  <ActivityIndicator size="small" />
                </View>
              ) : null}
              <ContactSupportCard />
            </>
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
        />
      </View>
      <TransactionDialog open={depositOpen} onOpenChange={setDepositOpen} type="deposit" />
      <TransactionDialog open={withdrawOpen} onOpenChange={setWithdrawOpen} type="withdrawal" />
    </>
  );
}
