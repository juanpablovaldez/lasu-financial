import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BalanceCard } from '@/components/balance-card';
import { TransactionDialog } from '@/components/transaction-dialog';
import { TransactionList } from '@/components/transaction-list';
import { balanceKeys } from '@/hooks/queries/use-balance';
import { transactionKeys } from '@/hooks/queries/use-transactions';
import { useUserPerformanceData } from '@/hooks/queries/use-user-performance-data';

export default function WalletScreen() {
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { data: performance } = useUserPerformanceData();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: balanceKeys.all }),
      queryClient.invalidateQueries({ queryKey: transactionKeys.all }),
    ]);
    setIsRefreshing(false);
  }, [queryClient]);

  return (
    <>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        <View className="gap-6 p-4">
          {/* Balance Card */}
          <BalanceCard
            onDeposit={() => setDepositOpen(true)}
            onWithdraw={() => setWithdrawOpen(true)}
            netPercentage={performance?.chartData.length ? performance.netPercentage : undefined}
          />

          {/* Transaction History */}
          <TransactionList />
        </View>
      </ScrollView>

      {/* Dialogs */}
      <TransactionDialog open={depositOpen} onOpenChange={setDepositOpen} type="deposit" />
      <TransactionDialog open={withdrawOpen} onOpenChange={setWithdrawOpen} type="withdrawal" />
    </>
  );
}
