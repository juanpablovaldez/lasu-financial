import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { useCreateOperation } from '@/hooks/mutations/use-create-operation';
import { createOperationRequestSchema } from '@/schemas';

const OPERATION_TYPES = [
  { value: 'buy', label: 'Compra' },
  { value: 'sell', label: 'Venta' },
  { value: 'dividend', label: 'Dividendo' },
  { value: 'fee', label: 'Comisión' },
  { value: 'transfer', label: 'Transferencia' },
] as const;

const CURRENCIES = [
  { value: 'USD', label: 'USD' },
  { value: 'ARS', label: 'ARS' },
] as const;

export default function CreateOperationScreen() {
  const router = useRouter();
  const { mutate: createOperation, isPending } = useCreateOperation();

  const [userId, setUserId] = useState('');
  const [operationType, setOperationType] = useState<string>('buy');
  const [totalAmountUsd, setTotalAmountUsd] = useState('');
  const [currency, setCurrency] = useState<string>('USD');
  const [feeAmount, setFeeAmount] = useState('');
  const [description, setDescription] = useState('');
  const [instrumentId, setInstrumentId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');

  const isBuySell = operationType === 'buy' || operationType === 'sell';

  const handleSubmit = () => {
    const rawData = {
      user_id: userId.trim(),
      operation_type: operationType,
      total_amount_usd: parseFloat(totalAmountUsd) || 0,
      currency,
      fee_amount: parseFloat(feeAmount) || 0,
      description: description.trim() || undefined,
      ...(isBuySell && {
        instrument_id: parseInt(instrumentId, 10) || undefined,
        quantity: parseFloat(quantity) || undefined,
        price_per_unit: parseFloat(pricePerUnit) || undefined,
      }),
    };

    const result = createOperationRequestSchema.safeParse(rawData);

    if (!result.success) {
      const firstError = result.error.errors[0];
      Alert.alert('Error de validación', firstError?.message || 'Datos inválidos');
      return;
    }

    createOperation(result.data, {
      onSuccess: () => {
        Alert.alert('Éxito', 'Operación creada correctamente');
        router.back();
      },
      onError: (error) => {
        Alert.alert('Error', error.message);
      },
    });
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-4 p-4">
        <Text className="text-xl font-bold">Crear operación</Text>

        {/* User ID */}
        <View className="gap-1">
          <Text className="text-sm font-medium text-muted-foreground">ID de usuario</Text>
          <TextInput
            value={userId}
            onChangeText={setUserId}
            placeholder="UUID del usuario"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Operation type */}
        <View className="gap-1">
          <Text className="text-sm font-medium text-muted-foreground">Tipo de operación</Text>
          <View className="flex-row flex-wrap gap-2">
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

        {/* Currency */}
        <View className="gap-1">
          <Text className="text-sm font-medium text-muted-foreground">Moneda</Text>
          <View className="flex-row gap-2">
            {CURRENCIES.map(({ value, label }) => (
              <Button
                key={value}
                variant={currency === value ? 'default' : 'outline'}
                size="sm"
                onPress={() => setCurrency(value)}
              >
                <Text>{label}</Text>
              </Button>
            ))}
          </View>
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

        {/* Conditional buy/sell fields */}
        {isBuySell && (
          <>
            <View className="gap-1">
              <Text className="text-sm font-medium text-muted-foreground">ID de instrumento</Text>
              <TextInput
                value={instrumentId}
                onChangeText={setInstrumentId}
                placeholder="ID numérico del instrumento"
                keyboardType="number-pad"
              />
            </View>

            <View className="gap-1">
              <Text className="text-sm font-medium text-muted-foreground">Cantidad</Text>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                placeholder="0"
                keyboardType="decimal-pad"
              />
            </View>

            <View className="gap-1">
              <Text className="text-sm font-medium text-muted-foreground">Precio por unidad</Text>
              <TextInput
                value={pricePerUnit}
                onChangeText={setPricePerUnit}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>
          </>
        )}

        {/* Submit */}
        <Button onPress={handleSubmit} disabled={isPending}>
          <Text>{isPending ? 'Creando...' : 'Crear operación'}</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
