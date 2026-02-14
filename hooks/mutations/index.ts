/**
 * Mutation hooks directory.
 *
 * Place TanStack Query useMutation hooks here.
 * Follow the pattern: use-[action]-[resource].ts
 *
 * @example
 * ```ts
 * // hooks/mutations/use-create-instrument.ts
 * export function useCreateInstrument() {
 *   return useMutation({
 *     mutationFn: (data: NewInstrument) => supabase.from('instruments').insert(data),
 *     onSuccess: () => queryClient.invalidateQueries({ queryKey: instrumentKeys.all }),
 *   });
 * }
 * ```
 */
export { useCreateTransaction } from './use-wallet-mutations';
export { useTransactionApproval } from './use-transaction-approval';
export { useCreateOperation } from './use-create-operation';
export { useCompleteOperation } from './use-complete-operation';
