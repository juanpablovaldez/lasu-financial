import { View, ActivityIndicator } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useBalance } from '@/hooks/queries/use-balance';
import { useExchangeRate } from '@/hooks/queries/use-exchange-rate';
import { convertUsdToArs } from '@/lib/currency';
import { useWalletStore } from '@/stores/wallet-store';
import { formatCurrency } from '@/utils/format';

export function BalanceCard() {
  const { data: balance, isLoading: balanceLoading } = useBalance();
  const { data: exchangeRate, isLoading: rateLoading } = useExchangeRate();
  const preferredCurrency = useWalletStore((state) => state.preferredCurrency);
  const setPreferredCurrency = useWalletStore((state) => state.setPreferredCurrency);

  const isLoading = balanceLoading || rateLoading;

  const displayAmount =
    balance && exchangeRate
      ? preferredCurrency === 'USD'
        ? balance.amount_usd
        : convertUsdToArs(balance.amount_usd, exchangeRate.usd_to_ars)
      : 0;

  const locale = preferredCurrency === 'USD' ? 'en-US' : 'es-AR';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance disponible</CardTitle>
      </CardHeader>
      <CardContent className="items-center gap-4">
        {isLoading ? (
          <ActivityIndicator size="large" />
        ) : (
          <Text className="text-4xl font-bold text-foreground">
            {formatCurrency(displayAmount, preferredCurrency, locale)}
          </Text>
        )}

        {/* Currency Toggle */}
        <View className="flex-row gap-2">
          <Button
            variant={preferredCurrency === 'USD' ? 'default' : 'outline'}
            size="sm"
            onPress={() => setPreferredCurrency('USD')}
            disabled={isLoading}
          >
            <Text>USD</Text>
          </Button>
          <Button
            variant={preferredCurrency === 'ARS' ? 'default' : 'outline'}
            size="sm"
            onPress={() => setPreferredCurrency('ARS')}
            disabled={isLoading}
          >
            <Text>ARS</Text>
          </Button>
        </View>

        {exchangeRate && preferredCurrency === 'ARS' && (
          <Text className="text-sm text-muted-foreground">
            1 USD = {exchangeRate.usd_to_ars.toFixed(2)} ARS
          </Text>
        )}
      </CardContent>
    </Card>
  );
}
