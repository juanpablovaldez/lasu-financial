import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { paymentMethodListSchema, type PaymentMethod } from '@/schemas';
import { useAuthStore } from '@/stores/auth-store';

export const paymentMethodKeys = {
  all: ['payment-methods'] as const,
  list: (userId: string) => [...paymentMethodKeys.all, userId] as const,
};

async function fetchPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  const { data, error } = await supabase
    .from('user_payment_methods')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch payment methods: ${error.message}`);
  }

  return paymentMethodListSchema.parse(data);
}

export function usePaymentMethods() {
  const userId = useAuthStore((state) => state.userId);

  return useQuery({
    queryKey: paymentMethodKeys.list(userId ?? ''),
    queryFn: () => fetchPaymentMethods(userId!),
    enabled: !!userId,
  });
}
