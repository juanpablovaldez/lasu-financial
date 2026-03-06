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

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return (email ?? '?').slice(0, 2).toUpperCase();
}

export function UserCard({ user, financials, onPress }: UserCardProps) {
  const initials = getInitials(user.full_name, user.email);
  const isPositive = (financials?.rentability_pct ?? 0) >= 0;

  const content = (
    <Card className="mb-3">
      <CardHeader>
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/15">
            <Text className="text-sm font-bold text-primary">{initials}</Text>
          </View>
          <View className="flex-1">
            <Text className="font-semibold">{user.full_name || 'Sin nombre'}</Text>
            {user.email && <Text className="text-xs text-muted-foreground">{user.email}</Text>}
          </View>
        </View>
      </CardHeader>
      <CardContent>
        <View className="gap-2">
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Registro:</Text>
            <Text className="text-xs">{formatDateOnly(user.created_at, 'es-AR')}</Text>
          </View>

          {financials && (
            <>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Balance:</Text>
                <Text className="text-base font-bold">
                  {formatCurrency(financials.current_balance)}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Capital aportado:</Text>
                <Text className="text-sm">{formatCurrency(financials.net_invested)}</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Rendimiento:</Text>
                <View className="items-end gap-1">
                  <Text
                    className={`text-sm font-semibold ${financials.rentability_usd >= 0 ? 'text-green-500' : 'text-destructive'}`}
                  >
                    {formatCurrency(financials.rentability_usd)}
                  </Text>
                  <View
                    className={`rounded-full px-2 py-0.5 ${isPositive ? 'bg-green-500/10' : 'bg-destructive/10'}`}
                  >
                    <Text
                      className={`text-xs font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                    >
                      {formatPercentage(financials.rentability_pct / 100)}
                    </Text>
                  </View>
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
