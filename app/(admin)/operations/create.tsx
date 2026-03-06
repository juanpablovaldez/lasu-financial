import { useRouter } from 'expo-router';
import { CircleAlert } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { UserPickerField } from '@/components/admin/user-picker-field';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { useCompleteOperation } from '@/hooks/mutations/use-complete-operation';
import { useCreateOperation } from '@/hooks/mutations/use-create-operation';
import { createOperationRequestSchema } from '@/schemas';

const OPERATION_TYPES = [
  { value: 'ingreso', label: 'Ingreso' },
  { value: 'egreso', label: 'Egreso' },
  { value: 'ganancia', label: 'Ganancia' },
  { value: 'perdida', label: 'Pérdida' },
] as const;

type OperationTypeValue = (typeof OPERATION_TYPES)[number]['value'];

export default function CreateOperationScreen() {
  const router = useRouter();
  const { mutateAsync: createOperation, isPending: isCreating } = useCreateOperation();
  const { mutateAsync: completeOperation, isPending: isCompleting } = useCompleteOperation();
  const isPending = isCreating || isCompleting;
  const [alertMessage, setAlertMessage] = useState<{ title: string; description: string } | null>(
    null,
  );

  const [selectedUserId, setSelectedUserId] = useState('');
  const [operationType, setOperationType] = useState<OperationTypeValue>('ingreso');
  const [totalAmountUsd, setTotalAmountUsd] = useState('');
  const [feeAmount, setFeeAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    const rawData = {
      user_id: selectedUserId,
      operation_type: operationType,
      total_amount_usd: parseFloat(totalAmountUsd) || 0,
      currency: 'USD',
      fee_amount: parseFloat(feeAmount) || 0,
      description: description.trim() || undefined,
    };

    const result = createOperationRequestSchema.safeParse(rawData);

    if (!result.success) {
      const firstError = result.error.errors[0];
      setAlertMessage({
        title: 'Error de validación',
        description: firstError?.message || 'Datos inválidos',
      });
      return;
    }

    setAlertMessage(null);
    try {
      const operation = await createOperation(result.data);
      await completeOperation({ operation_id: operation.id });
      router.back();
    } catch (error: any) {
      setAlertMessage({
        title: 'Error',
        description: error?.message ?? 'Ocurrió un error inesperado',
      });
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-4 p-4">
        <Text className="text-xl font-bold">Crear operación</Text>

        {/* User picker */}
        <UserPickerField value={selectedUserId} onSelect={setSelectedUserId} />

        {/* Operation type */}
        <View className="gap-1">
          <Text className="text-sm font-medium text-muted-foreground">Tipo de operación</Text>
          <View className="flex-row gap-2">
            {OPERATION_TYPES.map(({ value, label }) => (
              <Button
                key={value}
                variant={operationType === value ? 'default' : 'outline'}
                size="sm"
                onPress={() => setOperationType(value)}
              >
                <Text>{label}</Text>
              </Button>
            ))}
          </View>
        </View>

        {/* Amount */}
        <View className="gap-1">
          <Text className="text-sm font-medium text-muted-foreground">Monto total (USD)</Text>
          <TextInput
            value={totalAmountUsd}
            onChangeText={setTotalAmountUsd}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        </View>

        {/* Fee */}
        <View className="gap-1">
          <Text className="text-sm font-medium text-muted-foreground">Comisión</Text>
          <TextInput
            value={feeAmount}
            onChangeText={setFeeAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        </View>

        {/* Description */}
        <View className="gap-1">
          <Text className="text-sm font-medium text-muted-foreground">Descripción (opcional)</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Descripción de la operación"
            multiline
          />
        </View>

        {alertMessage && (
          <Alert icon={CircleAlert} variant="destructive">
            <AlertTitle>{alertMessage.title}</AlertTitle>
            <AlertDescription>{alertMessage.description}</AlertDescription>
          </Alert>
        )}

        {/* Submit */}
        <Button onPress={handleSubmit} disabled={isPending}>
          <Text>{isPending ? 'Creando...' : 'Crear operación'}</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
