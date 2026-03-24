import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, TouchableOpacity, View } from 'react-native';

import { AdminHeader, TransactionCard } from '@/components/admin';
import { Text } from '@/components/ui/text';
import { useAdminTransactions } from '@/hooks/queries/use-admin-transactions';
import { useAdminUsers } from '@/hooks/queries/use-admin-users';
import type { Transaction } from '@/schemas';

type StatusFilter = 'all' | 'pending' | 'completed' | 'failed' | 'cancelled';

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'completed', label: 'Aprobadas' },
  { value: 'failed', label: 'Rechazadas' },
];

export default function TransactionsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<StatusFilter>('all');
  const { data: transactions, isLoading, refetch, isRefetching } = useAdminTransactions();
  const { data: users } = useAdminUsers();

  const userNameMap = useMemo(() => {
    const map = new Map<string, string>();
    users?.forEach((u) => {
      if (u.full_name) map.set(u.user_id, u.full_name);
    });
    return map;
  }, [users]);

  const filteredTransactions = useMemo<Transaction[]>(() => {
    if (!transactions) return [];
    if (filter === 'all') return transactions;
    return transactions.filter((t) => t.status === filter);
  }, [transactions, filter]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted-foreground">Cargando transacciones...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pt-4">
        <AdminHeader title="Transacciones" />
      </View>

      {/* Filter tabs */}
      <View className="flex-row gap-2 px-4 pb-3 pt-2">
        {FILTERS.map(({ value, label }) => {
          const isActive = filter === value;
          return (
            <TouchableOpacity
              key={value}
              onPress={() => setFilter(value)}
              activeOpacity={0.7}
              className={`flex-1 items-center rounded-xl py-2 ${
                isActive ? 'bg-primary' : 'border border-border bg-card'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${isActive ? 'text-primary-foreground' : 'text-foreground'}`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {filteredTransactions.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-center text-muted-foreground">
            {filter === 'all'
              ? 'No hay transacciones registradas'
              : filter === 'pending'
                ? 'No hay transacciones pendientes'
                : filter === 'completed'
                  ? 'No hay transacciones aprobadas'
                  : 'No hay transacciones rechazadas'}
          </Text>
        </View>
      ) : (
        <FlashList
          data={filteredTransactions}
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
      )}
    </View>
  );
}
