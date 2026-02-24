import { useQueryClient } from '@tanstack/react-query';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BalanceCard } from '@/components/balance-card';
import { TransactionDialog } from '@/components/transaction-dialog';
import { TransactionList } from '@/components/transaction-list';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/colors';
import { balanceKeys } from '@/hooks/queries/use-balance';
import { transactionKeys } from '@/hooks/queries/use-transactions';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function WalletScreen() {
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const iconColor = Colors[colorScheme ?? 'light'].icon;
  const queryClient = useQueryClient();

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
          <BalanceCard />

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <Button className="flex-1 flex-row gap-2" onPress={() => setDepositOpen(true)}>
              <ArrowDownToLine size={16} color={iconColor} />
              <Text>Solicitar depósito</Text>
            </Button>
            <Button
              className="flex-1 flex-row gap-2"
              variant="outline"
              onPress={() => setWithdrawOpen(true)}
            >
              <ArrowUpFromLine size={16} color={iconColor} />
              <Text>Solicitar retiro</Text>
            </Button>
          </View>

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
