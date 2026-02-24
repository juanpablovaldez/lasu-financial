import { ActivityIndicator } from 'react-native';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useBalance } from '@/hooks/queries/use-balance';
import { formatCurrency } from '@/utils/format';

export function BalanceCard() {
  const { data: balance, isLoading } = useBalance();

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
    </Card>
  );
}
