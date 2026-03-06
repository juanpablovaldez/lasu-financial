import { Pressable, View } from 'react-native';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import type { Operation } from '@/schemas';
import { formatCurrency } from '@/utils/format';
import { formatDate } from '@/utils/format-date';

const TYPE_LABELS: Record<string, string> = {
  ingreso: 'Ingreso',
  egreso: 'Egreso',
  ganancia: 'Ganancia',
  perdida: 'Pérdida',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  completed: 'Completado',
  cancelled: 'Cancelado',
  failed: 'Fallido',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-500',
  completed: 'text-green-500',
  cancelled: 'text-muted-foreground',
  failed: 'text-destructive',
};

interface OperationCardProps {
  operation: Operation;
  userName?: string;
  userEmail?: string;
  onPress?: () => void;
}

export function OperationCard({ operation, userName, userEmail, onPress }: OperationCardProps) {
  const content = (
    <Card className="mb-3">
      <CardHeader>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-semibold">{TYPE_LABELS[operation.operation_type]}</Text>
            {userName && <Text className="text-sm text-muted-foreground">{userName}</Text>}
            {userEmail && <Text className="text-sm text-muted-foreground">{userEmail}</Text>}
          </View>
          <Text className={`text-xs capitalize ${STATUS_COLORS[operation.status]}`}>
            {STATUS_LABELS[operation.status] ?? operation.status}
          </Text>
        </View>
      </CardHeader>
      <CardContent>
        <View className="gap-2">
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Monto:</Text>
            <Text className="font-semibold">
              {formatCurrency(operation.total_amount_usd, 'USD', 'es-AR')}
            </Text>
          </View>

          {operation.fee_amount > 0 && (
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Comisión:</Text>
              <Text>{formatCurrency(operation.fee_amount, 'USD', 'es-AR')}</Text>
            </View>
          )}

          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Fecha:</Text>
            <Text className="text-xs">{formatDate(operation.created_at, 'es-AR')}</Text>
          </View>

          {operation.description && (
            <View>
              <Text className="text-muted-foreground">Descripción:</Text>
              <Text className="text-sm">{operation.description}</Text>
            </View>
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
