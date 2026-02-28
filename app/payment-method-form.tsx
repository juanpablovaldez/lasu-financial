import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PaymentMethodForm } from '@/components/payment-method-form';
import { Text } from '@/components/ui/text';
import {
  useCreatePaymentMethod,
  useUpdatePaymentMethod,
} from '@/hooks/mutations/use-payment-method-mutations';
import { usePaymentMethods } from '@/hooks/queries/use-payment-methods';
import type { CreatePaymentMethodRequest, UpdatePaymentMethodRequest } from '@/schemas';
import { toast } from '@/stores/toast-store';

export default function PaymentMethodFormScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const { data: methods = [], isLoading } = usePaymentMethods();
  const { mutate: create, isPending: isCreating } = useCreatePaymentMethod();
  const { mutate: update, isPending: isUpdating } = useUpdatePaymentMethod();

  const existing = id ? methods.find((m) => m.id === id) : undefined;

  const handleSubmit = (data: CreatePaymentMethodRequest | UpdatePaymentMethodRequest) => {
    if (id && existing) {
      update(data as UpdatePaymentMethodRequest, {
        onSuccess: () => {
          toast.success('Método de pago actualizado');
          router.back();
        },
        onError: (err) => {
          toast.error('Error al actualizar', err.message);
        },
      });
    } else {
      create(data as CreatePaymentMethodRequest, {
        onSuccess: () => {
          toast.success('Método de pago guardado');
          router.back();
        },
        onError: (err) => {
          toast.error('Error al guardar', err.message);
        },
      });
    }
  };

  if (id && isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (id && !isLoading && !existing) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-4">
        <Text className="text-center text-destructive">Método de pago no encontrado</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background px-4 pt-4" style={{ paddingBottom: insets.bottom + 16 }}>
      <PaymentMethodForm
        initialType={existing?.type}
        initialValues={existing}
        editId={id}
        showTypeSelector={!id}
        isPending={isCreating || isUpdating}
        submitLabel={id ? 'Actualizar' : 'Guardar'}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        fullScreen
      />
    </View>
  );
}
