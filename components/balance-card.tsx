import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

import { Announcement } from '@/components/ui/announcement';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/colors';
import { useBalance } from '@/hooks/queries/use-balance';
import { usePendingWithdrawalsTotal } from '@/hooks/queries/use-pending-withdrawals';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency } from '@/utils/format';

const GAIN_COLOR = '#22c55e';
const LOSS_COLOR = '#ef4444';

interface BalanceCardProps {
  onDeposit: () => void;
  onWithdraw: () => void;
  netPercentage?: number;
}

export function BalanceCard({ onDeposit, onWithdraw, netPercentage }: BalanceCardProps) {
  const { data: balance, isLoading } = useBalance();
  const { data: pendingWithdrawalsTotal = 0 } = usePendingWithdrawalsTotal();
  const colorScheme = useColorScheme();
  const iconColor = Colors[colorScheme ?? 'light'].icon;

  const hasPerformance = netPercentage !== undefined;
  const isPositive = (netPercentage ?? 0) >= 0;
  const performanceColor = isPositive ? GAIN_COLOR : LOSS_COLOR;
  const percentageLabel = Intl.NumberFormat(undefined, {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'always',
  }).format((netPercentage ?? 0) / 100);

  const formattedBalance = formatCurrency(balance?.amount_usd ?? 0, 'USD');
  const hasPendingWithdrawals = pendingWithdrawalsTotal > 0;
  const availableBalance = balance ? Math.max(0, balance.amount_usd - pendingWithdrawalsTotal) : 0;

  return (
    <Card className="border-t-2 border-t-primary">
      <Announcement message={!isLoading && balance ? `${formattedBalance} disponible` : null} />
      <CardHeader>
        <CardTitle>Balance total</CardTitle>
        <CardDescription>
          {hasPendingWithdrawals
            ? `Disponible: ${formatCurrency(availableBalance, 'USD')} · ${formatCurrency(pendingWithdrawalsTotal, 'USD')} en retiros pendientes`
            : 'Balance disponible'}
        </CardDescription>
      </CardHeader>
      <CardContent className="items-center">
        {isLoading ? (
          <ActivityIndicator size="large" />
        ) : (
          <View className="flex-row items-baseline gap-3">
            <Text className="text-5xl font-bold text-foreground">{formattedBalance}</Text>
            {hasPerformance && (
              <View
                className="rounded-full px-2.5 py-1"
                style={{ backgroundColor: `${performanceColor}20` }}
              >
                <Text className="text-sm font-semibold" style={{ color: performanceColor }}>
                  {percentageLabel}
                </Text>
              </View>
            )}
          </View>
        )}
      </CardContent>
      <Separator />
      <CardFooter>
        <View className="flex-1 flex-row gap-3">
          <Button
            className="flex-1 flex-row gap-2"
            onPress={onDeposit}
            accessibilityLabel="Solicitar depósito"
          >
            <ArrowDownToLine size={16} color={iconColor} />
            <Text>Solicitar depósito</Text>
          </Button>
          <Button
            className="flex-1 flex-row gap-2"
            variant="outline"
            onPress={onWithdraw}
            accessibilityLabel="Solicitar retiro"
          >
            <ArrowUpFromLine size={16} color={iconColor} />
            <Text>Solicitar retiro</Text>
          </Button>
        </View>
      </CardFooter>
    </Card>
  );
}
