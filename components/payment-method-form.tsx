import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import type {
  CreatePaymentMethodRequest,
  PaymentMethod,
  PaymentMethodType,
  UpdatePaymentMethodRequest,
} from '@/schemas';

type PaymentMethodFormProps = {
  initialType?: PaymentMethodType;
  initialValues?: Partial<PaymentMethod>;
  onSubmit: (data: CreatePaymentMethodRequest | UpdatePaymentMethodRequest) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel?: string;
  showTypeSelector?: boolean;
  editId?: string;
};

const TYPE_LABELS: Record<PaymentMethodType, string> = {
  bank_transfer: 'Transferencia bancaria',
  crypto: 'Cripto',
  branch: 'Sucursal',
};

export function PaymentMethodForm({
  initialType = 'bank_transfer',
  initialValues,
  onSubmit,
  onCancel,
  isPending,
  submitLabel = 'Guardar',
  showTypeSelector = false,
  editId,
}: PaymentMethodFormProps) {
  const { height } = useWindowDimensions();
  const [type, setType] = useState<PaymentMethodType>(initialType);

  const form = useForm({
    defaultValues: {
      alias: initialValues?.alias ?? '',
      bank_name: initialValues?.bank_name ?? '',
      account_holder: initialValues?.account_holder ?? '',
      document: initialValues?.document ?? '',
      account_number: initialValues?.account_number ?? '',
      account_type: initialValues?.account_type ?? '',
      cbu: initialValues?.cbu ?? '',
      cbu_alias: initialValues?.cbu_alias ?? '',
      network: initialValues?.network ?? '',
      coin: initialValues?.coin ?? '',
      wallet_address: initialValues?.wallet_address ?? '',
      scheduled_date: initialValues?.scheduled_date
        ? new Date(initialValues.scheduled_date)
        : (null as Date | null),
      is_default: initialValues?.is_default ?? false,
    },
    onSubmit: async ({ value }) => {
      if (type === 'bank_transfer') {
        const base = {
          type: 'bank_transfer' as const,
          alias: value.alias,
          bank_name: value.bank_name,
          account_holder: value.account_holder,
          document: value.document || undefined,
          account_number: value.account_number,
          account_type: (value.account_type || undefined) as 'checking' | 'savings' | undefined,
          cbu: value.cbu,
          cbu_alias: value.cbu_alias || undefined,
          is_default: value.is_default,
        };
        onSubmit(editId ? { ...base, id: editId } : base);
      } else if (type === 'crypto') {
        const base = {
          type: 'crypto' as const,
          alias: value.alias,
          network: value.network,
          coin: value.coin,
          wallet_address: value.wallet_address,
          is_default: value.is_default,
        };
        onSubmit(editId ? { ...base, id: editId } : base);
      } else {
        const base = {
          type: 'branch' as const,
          alias: value.alias,
          scheduled_date: value.scheduled_date
            ? value.scheduled_date.toISOString().split('T')[0]
            : undefined,
          is_default: value.is_default,
        };
        onSubmit(editId ? { ...base, id: editId } : base);
      }
    },
  });

  return (
    <View className="gap-4">
      <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: height * 0.5 }}>
        <View className="gap-4">
          {showTypeSelector && (
            <View className="gap-2">
              <Text className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Tipo
              </Text>
              <View className="flex-row gap-2">
                {(['bank_transfer', 'crypto', 'branch'] as PaymentMethodType[]).map((t) => (
                  <Button
                    key={t}
                    variant={type === t ? 'default' : 'outline'}
                    className="flex-1"
                    onPress={() => setType(t)}
                  >
                    <Text className="text-xs">
                      {t === 'bank_transfer' ? 'Banco' : t === 'crypto' ? 'Cripto' : 'Sucursal'}
                    </Text>
                  </Button>
                ))}
              </View>
              <Text className="text-xs text-muted-foreground">{TYPE_LABELS[type]}</Text>
            </View>
          )}

          <form.Field
            name="alias"
            validators={{
              onChange: ({ value }) => (!value ? 'El alias es requerido' : undefined),
            }}
          >
            {(field) => (
              <TextInput
                label="Alias"
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="Ej: Mi cuenta principal"
                error={field.state.meta.errors[0] as string | undefined}
              />
            )}
          </form.Field>

          {type === 'bank_transfer' && (
            <>
              <form.Field
                name="bank_name"
                validators={{
                  onChange: ({ value }) =>
                    !value ? 'El nombre del banco es requerido' : undefined,
                }}
              >
                {(field) => (
                  <TextInput
                    label="Banco"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    placeholder="Ej: Banco Santander"
                    error={field.state.meta.errors[0] as string | undefined}
                  />
                )}
              </form.Field>

              <form.Field
                name="account_holder"
                validators={{
                  onChange: ({ value }) =>
                    !value ? 'El titular de la cuenta es requerido' : undefined,
                }}
              >
                {(field) => (
                  <TextInput
                    label="Titular de la cuenta"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    placeholder="Ej: Juan García"
                    error={field.state.meta.errors[0] as string | undefined}
                  />
                )}
              </form.Field>

              <form.Field name="document">
                {(field) => (
                  <TextInput
                    label="DNI / CUIT (opcional)"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    placeholder="Ej: DNI 45961426 o 20-45961426-6"
                    keyboardType="default"
                  />
                )}
              </form.Field>

              <form.Field
                name="account_number"
                validators={{
                  onChange: ({ value }) =>
                    !value ? 'El número de cuenta es requerido' : undefined,
                }}
              >
                {(field) => (
                  <TextInput
                    label="Número de cuenta"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    placeholder="Ej: 1302709663001"
                    keyboardType="default"
                    error={field.state.meta.errors[0] as string | undefined}
                  />
                )}
              </form.Field>

              <View className="gap-2">
                <Text className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Tipo de cuenta (opcional)
                </Text>
                <View className="flex-row gap-2">
                  {(['checking', 'savings', ''] as const).map((at) => (
                    <form.Field name="account_type" key={at}>
                      {(field) => (
                        <Button
                          variant={field.state.value === at ? 'default' : 'outline'}
                          className="flex-1"
                          onPress={() => field.handleChange(at)}
                        >
                          <Text className="text-xs">
                            {at === 'checking' ? 'Corriente' : at === 'savings' ? 'Ahorro' : 'N/A'}
                          </Text>
                        </Button>
                      )}
                    </form.Field>
                  ))}
                </View>
              </View>

              <form.Field
                name="cbu"
                validators={{
                  onChange: ({ value }) => {
                    if (!value) return 'El CBU es requerido';
                    if (value.length !== 22) return 'El CBU debe tener 22 dígitos';
                    if (!/^\d+$/.test(value)) return 'El CBU solo debe contener números';
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <TextInput
                    label="CBU"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    placeholder="Ej: 1234567890123456789012"
                    keyboardType="numeric"
                    maxLength={22}
                    error={field.state.meta.errors[0] as string | undefined}
                  />
                )}
              </form.Field>

              <form.Field name="cbu_alias">
                {(field) => (
                  <TextInput
                    label="Alias CBU (opcional)"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    placeholder="Ej: ALIAS.EJEMPLO.123"
                    autoCapitalize="characters"
                  />
                )}
              </form.Field>
            </>
          )}

          {type === 'crypto' && (
            <>
              <form.Field
                name="network"
                validators={{
                  onChange: ({ value }) => (!value ? 'La red es requerida' : undefined),
                }}
              >
                {(field) => (
                  <TextInput
                    label="Red"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    placeholder="Ej: Ethereum, Bitcoin, Solana"
                    error={field.state.meta.errors[0] as string | undefined}
                  />
                )}
              </form.Field>

              <form.Field
                name="coin"
                validators={{
                  onChange: ({ value }) => (!value ? 'La moneda es requerida' : undefined),
                }}
              >
                {(field) => (
                  <TextInput
                    label="Moneda"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    placeholder="Ej: ETH, BTC, USDT"
                    error={field.state.meta.errors[0] as string | undefined}
                  />
                )}
              </form.Field>

              <form.Field
                name="wallet_address"
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? 'La dirección es requerida'
                      : value.length < 10
                        ? 'La dirección debe tener al menos 10 caracteres'
                        : undefined,
                }}
              >
                {(field) => (
                  <TextInput
                    label="Dirección de billetera"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    placeholder="0x..."
                    autoCapitalize="none"
                    error={field.state.meta.errors[0] as string | undefined}
                  />
                )}
              </form.Field>
            </>
          )}

          {type === 'branch' && (
            <form.Field name="scheduled_date">
              {(field) => (
                <DatePicker
                  label="Fecha de visita"
                  value={field.state.value}
                  onChange={field.handleChange}
                  minimumDate={new Date()}
                  placeholder="Seleccionar fecha (opcional)"
                />
              )}
            </form.Field>
          )}
        </View>
      </ScrollView>

      <View className="flex-row gap-3 pt-2">
        <Button variant="outline" className="flex-1" onPress={onCancel} disabled={isPending}>
          <Text>Cancelar</Text>
        </Button>
        <Button className="flex-1" onPress={() => form.handleSubmit()} disabled={isPending}>
          <Text>{isPending ? 'Guardando...' : submitLabel}</Text>
        </Button>
      </View>
    </View>
  );
}
