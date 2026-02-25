import { useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useOperation } from '@/hooks/queries/use-admin-operations';
import { formatCurrency } from '@/utils/format';
import { formatDate } from '@/utils/format-date';

export default function OperationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: operation, isLoading } = useOperation(id);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Cargando operación...</Text>
      </View>
    );
  }

  if (!operation) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-destructive">Operación no encontrada</Text>
      </View>
    );
  }

  const typeLabels = {
    buy: 'Compra',
    sell: 'Venta',
    dividend: 'Dividendo',
    fee: 'Comisión',
    transfer: 'Transferencia',
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la operación</CardTitle>
          </CardHeader>
          <CardContent className="gap-3">
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Tipo:</Text>
              <Text className="font-semibold">
                {typeLabels[operation.operation_type as keyof typeof typeLabels] ??
                  operation.operation_type.charAt(0).toUpperCase() +
                    operation.operation_type.slice(1)}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Monto:</Text>
              <Text className="font-semibold">
                {formatCurrency(operation.total_amount_usd, 'USD', 'es-AR')}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Comisión:</Text>
              <Text>{formatCurrency(operation.fee_amount, 'USD', 'es-AR')}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Estado:</Text>
              <Text className="capitalize">{operation.status}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Fecha de creación:</Text>
              <Text className="text-xs">{formatDate(operation.created_at, 'es-AR')}</Text>
            </View>

            {operation.executed_at && (
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Fecha de ejecución:</Text>
                <Text className="text-xs">{formatDate(operation.executed_at, 'es-AR')}</Text>
              </View>
            )}

            {operation.description && (
              <View>
                <Text className="text-muted-foreground">Descripción:</Text>
                <Text>{operation.description}</Text>
              </View>
            )}

            <View>
              <Text className="text-muted-foreground">ID de usuario:</Text>
              <Text className="text-xs">{operation.user_id}</Text>
            </View>

            {operation.executed_by && (
              <View>
                <Text className="text-muted-foreground">Ejecutada por:</Text>
                <Text className="text-xs">{operation.executed_by}</Text>
              </View>
            )}
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}
