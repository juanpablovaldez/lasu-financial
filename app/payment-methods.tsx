import { useRouter } from 'expo-router';
import { Building2, Coins, MapPin, Pencil, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useDeletePaymentMethod } from '@/hooks/mutations/use-payment-method-mutations';
import { usePaymentMethods } from '@/hooks/queries/use-payment-methods';
import type { PaymentMethod, PaymentMethodType } from '@/schemas';
import { toast } from '@/stores/toast-store';

const TYPE_ICONS: Record<PaymentMethodType, typeof Building2> = {
  bank_transfer: Building2,
  crypto: Coins,
  branch: MapPin,
};

const TYPE_LABELS: Record<PaymentMethodType, string> = {
  bank_transfer: 'Transferencia bancaria',
  crypto: 'Cripto',
  branch: 'Sucursal',
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
  return TYPE_LABELS.branch;
}

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: methods = [], isLoading } = usePaymentMethods();
  const { mutate: deleteMethod, isPending: isDeleting } = useDeletePaymentMethod();

  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMethod(deleteTarget.id, {
      onSuccess: () => {
        toast.success('Método de pago eliminado');
        setDeleteTarget(null);
      },
      onError: (err) => {
        toast.error('Error al eliminar', err.message);
        setDeleteTarget(null);
      },
    });
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingBottom: insets.bottom + 16 }}>
      <View className="flex-row items-center justify-between px-4 py-4">
        <Text className="text-lg font-semibold">Mis métodos de pago</Text>
        <Button onPress={() => router.push('/payment-method-form')}>
          <Text>Agregar</Text>
        </Button>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : methods.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Text className="text-center text-muted-foreground">
            Aún no tienes métodos de pago guardados
          </Text>
          <Button onPress={() => router.push('/payment-method-form')}>
            <Text>Agregar método de pago</Text>
          </Button>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4">
          <View className="gap-3">
            {methods.map((method) => {
              const Icon = TYPE_ICONS[method.type];
              return (
                <Card key={method.id}>
                  <CardContent className="py-4">
                    <View className="flex-row items-center gap-3">
                      <View className="h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <Icon size={20} className="text-muted-foreground" />
                      </View>

                      <View className="min-w-0 flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text className="font-medium" numberOfLines={1}>
                            {method.alias}
                          </Text>
                          {method.is_default && (
                            <View className="rounded-full bg-primary/10 px-2 py-0.5">
                              <Text className="text-xs text-primary">Predeterminado</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                          {methodSubtitle(method)}
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                          {TYPE_LABELS[method.type]}
                        </Text>
                      </View>

                      <View className="flex-row gap-2">
                        <Pressable
                          onPress={() =>
                            router.push({
                              pathname: '/payment-method-form',
                              params: { id: method.id },
                            })
                          }
                          accessibilityLabel="Editar método de pago"
                          accessibilityRole="button"
                          className="p-2"
                        >
                          <Pencil size={18} className="text-muted-foreground" />
                        </Pressable>
                        <Pressable
                          onPress={() => setDeleteTarget(method)}
                          accessibilityLabel="Eliminar método de pago"
                          accessibilityRole="button"
                          className="p-2"
                        >
                          <Trash2 size={18} className="text-destructive" />
                        </Pressable>
                      </View>
                    </View>
                  </CardContent>
                </Card>
              );
            })}
          </View>
        </ScrollView>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar método de pago</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar &quot;{deleteTarget?.alias}&quot;? Esta acción no
              se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              <Text>Cancelar</Text>
            </AlertDialogCancel>
            <AlertDialogAction onPress={handleDelete} disabled={isDeleting}>
              <Text>{isDeleting ? 'Eliminando...' : 'Eliminar'}</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
}
