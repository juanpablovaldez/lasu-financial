import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/colors';
import { useBalance } from '@/hooks/queries/use-balance';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency } from '@/utils/format';

interface BalanceCardProps {
  onDeposit: () => void;
  onWithdraw: () => void;
}

export function BalanceCard({ onDeposit, onWithdraw }: BalanceCardProps) {
  const { data: balance, isLoading } = useBalance();
  const colorScheme = useColorScheme();
  const iconColor = Colors[colorScheme ?? 'light'].icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance disponible</CardTitle>
      </CardHeader>
      <CardContent className="items-center">
        {isLoading ? (
          <ActivityIndicator size="large" />
        ) : (
          <Text className="text-4xl font-bold text-foreground">
            {formatCurrency(balance?.amount_usd ?? 0, 'USD', 'en-US')}
          </Text>
        )}
      </CardContent>
      <CardFooter>
        <View className="flex-1 flex-row gap-3">
          <Button className="flex-1 flex-row gap-2" onPress={onDeposit}>
            <ArrowDownToLine size={16} color={iconColor} />
            <Text>Solicitar depósito</Text>
          </Button>
          <Button className="flex-1 flex-row gap-2" variant="outline" onPress={onWithdraw}>
            <ArrowUpFromLine size={16} color={iconColor} />
            <Text>Solicitar retiro</Text>
          </Button>
        </View>
      </CardFooter>
    </Card>
  );
}
