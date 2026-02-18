import { useLocalSearchParams, useRouter } from 'expo-router';
import { CircleAlert } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useTransactionApproval } from '@/hooks/mutations/use-transaction-approval';
import { useAdminTransaction } from '@/hooks/queries/use-admin-transaction';
import { formatCurrency } from '@/utils/format';
import { formatDate } from '@/utils/format-date';

export default function TransactionApprovalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: transaction, isLoading } = useAdminTransaction(id);
  const { mutate: processApproval, isPending } = useTransactionApproval();

  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleApprove = () => {
    processApproval(
      {
        transaction_id: id,
        action: 'approve',
      },
      {
        onSuccess: () => {
          setShowApproveDialog(false);
          router.back();
        },
        onError: (error) => {
          setShowApproveDialog(false);
          setErrorMessage(error.message);
        },
      },
    );
  };

  const handleReject = () => {
    processApproval(
      {
        transaction_id: id,
        action: 'reject',
        reason: 'Rechazada por el administrador',
      },
      {
        onSuccess: () => {
          setShowRejectDialog(false);
          router.back();
        },
        onError: (error) => {
          setShowRejectDialog(false);
          setErrorMessage(error.message);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted-foreground">Cargando transacción...</Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-destructive">Transacción no encontrada</Text>
      </View>
    );
  }

  const typeLabel = transaction.type === 'deposit' ? 'Depósito' : 'Retiro';
  const canApprove = transaction.status === 'pending';

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-4 p-4">
        {/* Transaction Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la transacción</CardTitle>
          </CardHeader>
          <CardContent className="gap-3">
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Tipo:</Text>
              <Text className="font-semibold">{typeLabel}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Monto:</Text>
              <Text className="font-semibold">
                {formatCurrency(transaction.amount, transaction.currency, 'es-AR')}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Moneda:</Text>
              <Text>{transaction.currency}</Text>
            </View>

            {transaction.exchange_rate && (
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Tipo de cambio:</Text>
                <Text>{transaction.exchange_rate.toFixed(2)}</Text>
              </View>
            )}

            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Estado:</Text>
              <Text className="font-semibold capitalize">{transaction.status}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Fecha de creación:</Text>
              <Text className="text-xs">{formatDate(transaction.created_at, 'es-AR')}</Text>
            </View>

            <View>
              <Text className="text-muted-foreground">ID de usuario:</Text>
              <Text className="text-xs">{transaction.user_id}</Text>
            </View>

            {transaction.description && (
              <View>
                <Text className="text-muted-foreground">Descripción:</Text>
                <Text>{transaction.description}</Text>
              </View>
            )}
          </CardContent>
        </Card>

        {errorMessage && (
          <Alert icon={CircleAlert} variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        {canApprove && (
          <View className="gap-3">
            <Button
              variant="default"
              onPress={() => setShowApproveDialog(true)}
              disabled={isPending}
            >
              <Text>✓ Aprobar transacción</Text>
            </Button>

            <Button
              variant="destructive"
              onPress={() => setShowRejectDialog(true)}
              disabled={isPending}
            >
              <Text>✗ Rechazar transacción</Text>
            </Button>
          </View>
        )}

        {!canApprove && (
          <Card>
            <CardContent className="py-4">
              <Text className="text-center text-muted-foreground">
                Esta transacción ya fue procesada
              </Text>
            </CardContent>
          </Card>
        )}
      </View>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar aprobación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas aprobar esta transacción? El saldo del usuario se
              actualizará inmediatamente.
              {'\n\n'}
              Monto: {formatCurrency(transaction.amount, transaction.currency, 'es-AR')}
              {'\n'}
              Tipo: {typeLabel}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              <Text>Cancelar</Text>
            </AlertDialogCancel>
            <AlertDialogAction onPress={handleApprove} disabled={isPending}>
              <Text>Aprobar</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar rechazo</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas rechazar esta transacción? El usuario será notificado del
              rechazo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              <Text>Cancelar</Text>
            </AlertDialogCancel>
            <AlertDialogAction onPress={handleReject} disabled={isPending}>
              <Text>Rechazar</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ScrollView>
  );
}
