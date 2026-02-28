import { Building2, Coins, MapPin, Wallet } from 'lucide-react-native';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { PaymentMethod, PaymentMethodType } from '@/schemas';

const TYPE_ICONS: Record<PaymentMethodType, typeof Building2> = {
  bank_transfer: Building2,
  crypto: Coins,
  branch: MapPin,
  custom: Wallet,
};

const TYPE_LABELS: Record<PaymentMethodType, string> = {
  bank_transfer: 'Transferencia bancaria',
  crypto: 'Cripto',
  branch: 'Sucursal',
  custom: 'Personalizado',
};

function methodSubtitle(method: PaymentMethod): string {
  if (method.type === 'bank_transfer') {
    const parts: string[] = [];
    if (method.bank_name) parts.push(method.bank_name);
    if (method.account_number) parts.push(`···${method.account_number.slice(-4)}`);
    return parts.join(' · ') || TYPE_LABELS.bank_transfer;
  }
  if (method.type === 'crypto') {
    const parts: string[] = [];
    if (method.coin) parts.push(method.coin);
    if (method.network) parts.push(method.network);
    return parts.join(' · ') || TYPE_LABELS.crypto;
  }
  if (method.type === 'custom') {
    return method.scheduled_date
      ? `Fecha de depósito: ${method.scheduled_date}`
      : TYPE_LABELS.custom;
  }
  return TYPE_LABELS.branch;
}

type PaymentMethodSelectorProps = {
  methods: PaymentMethod[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddNew: () => void;
  isLoading: boolean;
};

export function PaymentMethodSelector({
  methods,
  selectedId,
  onSelect,
  onAddNew,
  isLoading,
}: PaymentMethodSelectorProps) {
  if (isLoading) {
    return (
      <View className="items-center py-6">
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (methods.length === 0) {
    return (
      <View className="items-center gap-4 py-4">
        <Text className="text-center text-sm text-muted-foreground">
          Aún no tienes métodos de pago guardados
        </Text>
        <Button onPress={onAddNew}>
          <Text>Agregar método de pago</Text>
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
      <View className="gap-2">
        {methods.map((method) => {
          const Icon = TYPE_ICONS[method.type];
          const isSelected = method.id === selectedId;

          return (
            <Pressable
              key={method.id}
              onPress={() => onSelect(method.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${method.alias}, ${methodSubtitle(method)}`}
              className={cn(
                'flex-row items-center gap-3 rounded-xl border px-4 py-3',
                isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card',
              )}
            >
              <View
                className={cn(
                  'h-9 w-9 items-center justify-center rounded-full',
                  isSelected ? 'bg-primary/10' : 'bg-muted',
                )}
              >
                <Icon size={18} className={isSelected ? 'text-primary' : 'text-muted-foreground'} />
              </View>

              <View className="min-w-0 flex-1">
                <Text className="text-sm font-medium" numberOfLines={1}>
                  {method.alias}
                </Text>
                <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                  {methodSubtitle(method)}
                </Text>
              </View>

              <View
                className={cn(
                  'h-5 w-5 items-center justify-center rounded-full border-2',
                  isSelected ? 'border-primary' : 'border-border',
                )}
              >
                {isSelected && <View className="h-2.5 w-2.5 rounded-full bg-primary" />}
              </View>
            </Pressable>
          );
        })}

        <Button variant="outline" className="mt-2" onPress={onAddNew}>
          <Text>Agregar nuevo método de pago</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
