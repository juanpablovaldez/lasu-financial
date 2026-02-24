import { useForm } from '@tanstack/react-form';
import { View } from 'react-native';

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
import { useCreateTransaction } from '@/hooks/mutations/use-wallet-mutations';
import { useBalance } from '@/hooks/queries/use-balance';
import { useExchangeRate } from '@/hooks/queries/use-exchange-rate';
import { convertUsdToArs } from '@/lib/currency';
import { toast } from '@/stores/toast-store';
import { useWalletStore } from '@/stores/wallet-store';

type TransactionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'deposit' | 'withdrawal';
};

export function TransactionDialog({ open, onOpenChange, type }: TransactionDialogProps) {
  const preferredCurrency = useWalletStore((state) => state.preferredCurrency);
  const { mutate, isPending, error } = useCreateTransaction();
  const { data: balance } = useBalance();
  const { data: exchangeRate } = useExchangeRate();

  const getAvailableBalance = (): number | null => {
    if (!balance) return null;
    if (preferredCurrency === 'ARS') {
      if (!exchangeRate) return null;
      return convertUsdToArs(balance.amount_usd, exchangeRate.usd_to_ars);
    }
    return balance.amount_usd;
  };

  const validateWithdrawalAmount = (value: string): string | undefined => {
    if (type !== 'withdrawal') return undefined;
    const amount = parseFloat(value);
    if (isNaN(amount) || amount <= 0) return undefined;
    const available = getAvailableBalance();
    if (available === null) return undefined;
    if (amount > available) {
      return `Saldo insuficiente. Disponible: ${available.toFixed(2)} ${preferredCurrency}`;
    }
    return undefined;
  };

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

      if (type === 'withdrawal') {
        const available = getAvailableBalance();
        if (available !== null && amount > available) {
          return;
        }
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
            const actionText = type === 'deposit' ? 'depósito' : 'retiro';
            toast.success(`Solicitud de ${actionText} enviada`, 'Pendiente de aprobación');
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
                return validateWithdrawalAmount(value);
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
          <Button onPress={() => form.handleSubmit()} disabled={isPending}>
            <Text>{isPending ? 'Procesando...' : actionLabel}</Text>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
