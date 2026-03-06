import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useCompleteOperation } from '@/hooks/mutations/use-complete-operation';
import { useDeleteOperation } from '@/hooks/mutations/use-delete-operation';
import { useOperation } from '@/hooks/queries/use-admin-operations';
import { useAdminUser } from '@/hooks/queries/use-admin-users';
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
  completed: 'Completada',
  cancelled: 'Cancelada',
  failed: 'Fallida',
};

export default function OperationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: operation, isLoading } = useOperation(id);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { mutate: completeOperation, isPending: isCompleting } = useCompleteOperation();
  const { mutate: deleteOperation, isPending: isDeleting } = useDeleteOperation(
    operation?.user_id ?? '',
  );
  const { data: userProfile } = useAdminUser(operation?.user_id);

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

  function handleComplete() {
    completeOperation({ operation_id: id }, { onSuccess: () => router.back() });
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteOperation(id, { onSuccess: () => router.back() });
  }

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
                {TYPE_LABELS[operation.operation_type] ??
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

            {operation.fee_amount > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Comisión:</Text>
                <Text>{formatCurrency(operation.fee_amount, 'USD', 'es-AR')}</Text>
              </View>
            )}

            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Estado:</Text>
              <Text className="font-semibold">
                {STATUS_LABELS[operation.status] ?? operation.status}
              </Text>
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

            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Usuario:</Text>
              <View className="items-end">
                <Text className="font-semibold">
                  {userProfile?.full_name ?? userProfile?.email ?? '—'}
                </Text>
                <Text className="text-xs text-muted-foreground">{operation.user_id}</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="gap-3 pt-4">
            {operation.status === 'pending' && (
              <Button onPress={handleComplete} disabled={isCompleting || isDeleting}>
                <Text>{isCompleting ? 'Ejecutando...' : 'Ejecutar operación'}</Text>
              </Button>
            )}

            <Separator />

            {confirmDelete ? (
              <View className="gap-2">
                <Text className="text-center text-sm text-muted-foreground">
                  ¿Confirmar eliminación?
                </Text>
                <View className="flex-row gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onPress={() => setConfirmDelete(false)}
                    disabled={isDeleting}
                  >
                    <Text>Cancelar</Text>
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onPress={handleDelete}
                    disabled={isDeleting}
                  >
                    <Text>{isDeleting ? 'Eliminando...' : 'Eliminar'}</Text>
                  </Button>
                </View>
              </View>
            ) : (
              <Button
                variant="destructive"
                onPress={handleDelete}
                disabled={isCompleting || isDeleting}
              >
                <Text>Eliminar operación</Text>
              </Button>
            )}
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}
