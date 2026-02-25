import { useForm } from '@tanstack/react-form';
import { useEffect, useMemo, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { useCreatePaymentMethod } from '@/hooks/mutations/use-payment-method-mutations';
import { useCreateTransaction } from '@/hooks/mutations/use-wallet-mutations';
import { useBalance } from '@/hooks/queries/use-balance';
import { usePaymentMethods } from '@/hooks/queries/use-payment-methods';
import type { CreatePaymentMethodRequest, UpdatePaymentMethodRequest } from '@/schemas';
import { toast } from '@/stores/toast-store';

import { PaymentMethodForm } from './payment-method-form';
import { PaymentMethodSelector } from './payment-method-selector';

type DialogStep = 'amount' | 'select-method' | 'add-method';

type TransactionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'deposit' | 'withdrawal';
};

export function TransactionDialog({ open, onOpenChange, type }: TransactionDialogProps) {
  const form = useForm({
    defaultValues: {
      amount: '',
      description: '',
    },
    onSubmit: async ({ value }) => {
      const amount = parseFloat(value.amount);
      if (isNaN(amount) || amount <= 0) return;
      if (type === 'withdrawal' && balance !== undefined && amount > balance.amount_usd) return;

      setAmountData({ amount, description: value.description || undefined });
      setStep('select-method');
    },
  });

  const {
    mutate: createTransaction,
    isPending: isCreatingTransaction,
    error,
  } = useCreateTransaction();
  const { mutate: createPaymentMethod, isPending: isCreatingMethod } = useCreatePaymentMethod();
  const { data: balance } = useBalance();
  const { data: methods = [], isLoading: isLoadingMethods } = usePaymentMethods();

  const { height } = useWindowDimensions();
  const [step, setStep] = useState<DialogStep>('amount');
  const [amountData, setAmountData] = useState<{ amount: number; description?: string } | null>(
    null,
  );
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);

  const resetAll = useMemo(() => {
    return () => {
      setStep('amount');
      setAmountData(null);
      setSelectedMethodId(null);
      form.reset();
    };
  }, [form]);

  useEffect(() => {
    if (!open) {
      resetAll();
    }
  }, [open, resetAll]);

  useEffect(() => {
    if (methods.length > 0 && !selectedMethodId) {
      const defaultMethod = methods.find((m) => m.is_default) ?? methods[0];
      setSelectedMethodId(defaultMethod.id);
    }
  }, [methods, selectedMethodId]);

  const validateWithdrawalAmount = (value: string): string | undefined => {
    if (type !== 'withdrawal') return undefined;
    const amount = parseFloat(value);
    if (isNaN(amount) || amount <= 0) return undefined;
    if (!balance) return undefined;
    if (amount > balance.amount_usd) {
      return `Saldo insuficiente. Disponible: ${balance.amount_usd.toFixed(2)} USD`;
    }
    return undefined;
  };

  const handleConfirmTransaction = () => {
    if (!amountData || !selectedMethodId) return;

    const selectedMethod = methods.find((m) => m.id === selectedMethodId);
    if (!selectedMethod) return;

    createTransaction(
      {
        request: {
          type,
          amount: amountData.amount,
          currency: 'USD',
          description: amountData.description,
          payment_method_id: selectedMethodId,
        },
        paymentMethodSnapshot: selectedMethod,
      },
      {
        onSuccess: () => {
          const actionText = type === 'deposit' ? 'depósito' : 'retiro';
          toast.success(`Solicitud de ${actionText} enviada`, 'Pendiente de aprobación');
          onOpenChange(false);
        },
      },
    );
  };

  const handleAddMethod = (data: CreatePaymentMethodRequest | UpdatePaymentMethodRequest) => {
    createPaymentMethod(data as CreatePaymentMethodRequest, {
      onSuccess: (newMethod) => {
        setSelectedMethodId(newMethod.id);
        setStep('select-method');
      },
    });
  };

  const titleMap: Record<DialogStep, string> = {
    amount: type === 'deposit' ? 'Depositar fondos' : 'Retirar fondos',
    'select-method':
      type === 'deposit' ? 'Elige el método de depósito' : 'Elige el método de retiro',
    'add-method': 'Agregar método de pago',
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titleMap[step]}</AlertDialogTitle>
        </AlertDialogHeader>

        {step === 'amount' && (
          <>
            <View className="gap-4">
              <form.Field
                name="amount"
                validators={{
                  onChange: ({ value }) => {
                    const amount = parseFloat(value);
                    if (!value) return 'El monto es requerido';
                    if (isNaN(amount) || amount <= 0) return 'El monto debe ser mayor a 0';
                    return validateWithdrawalAmount(value);
                  },
                }}
              >
                {(field) => (
                  <TextInput
                    label="Monto (USD)"
                    keyboardType="decimal-pad"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    placeholder="0.00"
                    error={field.state.meta.errors[0] as string | undefined}
                  />
                )}
              </form.Field>

              <form.Field name="description">
                {(field) => (
                  <TextInput
                    label="Descripción (opcional)"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    placeholder="Ej: Depósito inicial"
                    multiline
                    numberOfLines={2}
                  />
                )}
              </form.Field>
            </View>

            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button variant="outline">
                  <Text>Cancelar</Text>
                </Button>
              </AlertDialogCancel>
              <Button onPress={() => form.handleSubmit()}>
                <Text>Siguiente</Text>
              </Button>
            </AlertDialogFooter>
          </>
        )}

        {step === 'select-method' && (
          <>
            <PaymentMethodSelector
              methods={methods}
              selectedId={selectedMethodId}
              onSelect={setSelectedMethodId}
              onAddNew={() => setStep('add-method')}
              isLoading={isLoadingMethods}
            />

            {error && <Text className="text-sm text-destructive">{error.message}</Text>}

            <AlertDialogFooter>
              <Button
                variant="outline"
                onPress={() => setStep('amount')}
                disabled={isCreatingTransaction}
              >
                <Text>Anterior</Text>
              </Button>
              <Button
                onPress={handleConfirmTransaction}
                disabled={!selectedMethodId || isCreatingTransaction}
              >
                <Text>{isCreatingTransaction ? 'Procesando...' : 'Confirmar'}</Text>
              </Button>
            </AlertDialogFooter>
          </>
        )}

        {step === 'add-method' && (
          <View style={{ maxHeight: height * 0.6 }}>
            <PaymentMethodForm
              showTypeSelector
              isPending={isCreatingMethod}
              submitLabel="Guardar y usar"
              onSubmit={handleAddMethod}
              onCancel={() => setStep('select-method')}
            />
          </View>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
