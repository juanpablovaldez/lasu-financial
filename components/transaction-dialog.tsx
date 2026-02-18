import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { View } from 'react-native';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Announcement } from '@/components/ui/announcement';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { useCreateTransaction } from '@/hooks/mutations/use-wallet-mutations';
import { useWalletStore } from '@/stores/wallet-store';

type TransactionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'deposit' | 'withdrawal';
};

export function TransactionDialog({ open, onOpenChange, type }: TransactionDialogProps) {
  const preferredCurrency = useWalletStore((state) => state.preferredCurrency);
  const { mutate, isPending, error, isSuccess } = useCreateTransaction();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      amount: '',
      description: '',
    },
    onSubmit: async ({ value }) => {
      const amount = parseFloat(value.amount);

      if (isNaN(amount) || amount <= 0) {
        return;
      }

      mutate(
        {
          type,
          amount,
          currency: preferredCurrency,
          description: value.description || undefined,
        },
        {
          onSuccess: () => {
            const actionText = type === 'deposit' ? 'Depósito' : 'Retiro';
            setSuccessMessage(`${actionText} completado exitosamente`);
            setTimeout(() => setSuccessMessage(null), 3000);
            onOpenChange(false);
            form.reset();
          },
        },
      );
    },
  });

  const title = type === 'deposit' ? 'Depositar fondos' : 'Retirar fondos';
  const actionLabel = type === 'deposit' ? 'Depositar' : 'Retirar';

  return (
    <>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </AlertDialogHeader>

          <View className="gap-4">
            <form.Field
              name="amount"
              validators={{
                onChange: ({ value }) => {
                  const amount = parseFloat(value);
                  if (!value) return 'El monto es requerido';
                  if (isNaN(amount) || amount <= 0) return 'El monto debe ser mayor a 0';
                  return undefined;
                },
              }}
            >
              {(field) => (
                <TextInput
                  label="Monto"
                  keyboardType="decimal-pad"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  placeholder={`0.00 ${preferredCurrency}`}
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

            {error && <Text className="text-sm text-destructive">{error.message}</Text>}
          </View>

          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" disabled={isPending}>
                <Text>Cancelar</Text>
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onPress={() => form.handleSubmit()} disabled={isPending}>
                <Text>{isPending ? 'Procesando...' : actionLabel}</Text>
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {successMessage && <Announcement message={successMessage} />}
    </>
  );
}
