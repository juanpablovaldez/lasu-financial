import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useCancelOperation } from '@/hooks/mutations/use-cancel-operation';
import { useCompleteOperation } from '@/hooks/mutations/use-complete-operation';
import { useOperation } from '@/hooks/queries/use-admin-operations';
import { useAdminUser } from '@/hooks/queries/use-admin-users';
import { formatCurrency } from '@/utils/format';
import { formatDate } from '@/utils/format-date';

const TYPE_LABELS: Record<string, string> = {
  buy: 'Compra',
  sell: 'Venta',
  dividend: 'Dividendo',
  fee: 'Comisión',
  transfer: 'Transferencia',
  gain: 'Ganancia',
  loss: 'Pérdida',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  completed: 'Completada',
  cancelled: 'Cancelada',
  failed: 'Fallida',
};

export default function OperationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: operation, isLoading } = useOperation(id);
  const { mutate: completeOperation, isPending: isCompleting } = useCompleteOperation();
  const { mutate: cancelOperation, isPending: isCancelling } = useCancelOperation();
  const { data: userProfile } = useAdminUser(operation?.user_id);

  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

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

  const isPending = operation.status === 'pending';
  const isActionPending = isCompleting || isCancelling;

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
                {TYPE_LABELS[operation.operation_type] ?? operation.operation_type}
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

            {isPending && (
              <>
                <Separator className="my-1" />
                <Button onPress={() => setShowCompleteDialog(true)} disabled={isActionPending}>
                  <Text>{isCompleting ? 'Completando...' : 'Completar operación'}</Text>
                </Button>
                <Button
                  variant="destructive"
                  onPress={() => setShowCancelDialog(true)}
                  disabled={isActionPending}
                >
                  <Text>{isCancelling ? 'Cancelando...' : 'Cancelar operación'}</Text>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </View>

      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Completar operación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto ejecutará la operación y actualizará el saldo del usuario inmediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCompleting}>
              <Text>Cancelar</Text>
            </AlertDialogCancel>
            <AlertDialogAction
              onPress={() =>
                completeOperation(
                  { operation_id: operation.id },
                  { onSuccess: () => setShowCompleteDialog(false) },
                )
              }
              disabled={isCompleting}
            >
              <Text>Completar</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar operación?</AlertDialogTitle>
            <AlertDialogDescription>
              La operación quedará cancelada y no afectará el saldo del usuario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              <Text>Volver</Text>
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              onPress={() =>
                cancelOperation(operation.id, {
                  onSuccess: () => setShowCancelDialog(false),
                })
              }
              disabled={isCancelling}
            >
              <Text>Cancelar operación</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ScrollView>
  );
}
