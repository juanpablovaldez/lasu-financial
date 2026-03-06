import { Pressable, View } from 'react-native';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import type { UserFinancialSummary, UserProfile } from '@/schemas';
import { formatCurrency, formatPercentage } from '@/utils/format';
import { formatDateOnly } from '@/utils/format-date';

interface UserCardProps {
  user: UserProfile;
  financials?: UserFinancialSummary;
  onPress?: () => void;
}

export function UserCard({ user, financials, onPress }: UserCardProps) {
  const content = (
    <Card className="mb-3">
      <CardHeader>
        <Text className="font-semibold">{user.full_name || 'Sin nombre'}</Text>
      </CardHeader>
      <CardContent>
        <View className="gap-2">
          {user.email && (
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Email:</Text>
              <Text className="text-sm">{user.email}</Text>
            </View>
          )}

          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Registro:</Text>
            <Text className="text-xs">{formatDateOnly(user.created_at, 'es-AR')}</Text>
          </View>

          {financials && (
            <>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Balance:</Text>
                <Text className="text-sm font-semibold">
                  {formatCurrency(financials.current_balance)}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Capital aportado:</Text>
                <Text className="text-sm">{formatCurrency(financials.net_invested)}</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Rendimiento:</Text>
                <View className="items-end">
                  <Text
                    className={`text-sm font-semibold ${financials.rentability_usd >= 0 ? 'text-green-500' : 'text-destructive'}`}
                  >
                    {formatCurrency(financials.rentability_usd)}
                  </Text>
                  <Text
                    className={`text-xs ${financials.rentability_pct >= 0 ? 'text-green-500' : 'text-destructive'}`}
                  >
                    {formatPercentage(financials.rentability_pct / 100)}
                  </Text>
                </View>
              </View>
            </>
          )}
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
