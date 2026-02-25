import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import {
  createPaymentMethodRequestSchema,
  paymentMethodSchema,
  updatePaymentMethodRequestSchema,
  type CreatePaymentMethodRequest,
  type PaymentMethod,
  type UpdatePaymentMethodRequest,
} from '@/schemas';
import { useAuthStore } from '@/stores/auth-store';

import { paymentMethodKeys } from '../queries/use-payment-methods';

async function createPaymentMethod(
  request: CreatePaymentMethodRequest,
  userId: string,
): Promise<PaymentMethod> {
  const validated = createPaymentMethodRequestSchema.parse(request);

  const { data, error } = await supabase
    .from('user_payment_methods')
    .insert({ ...validated, user_id: userId })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create payment method: ${error.message}`);
  }

  return paymentMethodSchema.parse(data);
}

async function updatePaymentMethod(request: UpdatePaymentMethodRequest): Promise<PaymentMethod> {
  const validated = updatePaymentMethodRequestSchema.parse(request);
  const { id, ...fields } = validated;

  const { data, error } = await supabase
    .from('user_payment_methods')
    .update(fields)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update payment method: ${error.message}`);
  }

  return paymentMethodSchema.parse(data);
}

async function deletePaymentMethod(id: string): Promise<void> {
  const { error } = await supabase.from('user_payment_methods').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete payment method: ${error.message}`);
  }
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);

  return useMutation({
    mutationFn: (request: CreatePaymentMethodRequest) => createPaymentMethod(request, userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodKeys.all });
    },
  });
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdatePaymentMethodRequest) => updatePaymentMethod(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodKeys.all });
    },
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentMethodKeys.all });
    },
  });
}
