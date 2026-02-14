import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Transaction, TransactionApprovalRequest } from '@/schemas';
import { transactionSchema } from '@/schemas';
import { useAuthStore } from '@/stores/auth-store';

import { adminKeys } from '../queries/use-admin-dashboard';
import { balanceKeys } from '../queries/use-balance';
import { transactionKeys } from '../queries/use-transactions';

/**
 * Approve or reject a transaction
 */
async function processTransactionApproval(
  request: TransactionApprovalRequest,
  adminId: string,
): Promise<Transaction> {
  const { transaction_id, action, reason, admin_notes } = request;

  // Build update data based on action
  const updateData =
    action === 'approve'
      ? {
          status: 'completed' as const,
          approved_by: adminId,
          admin_notes: admin_notes || null,
        }
      : {
          status: 'failed' as const,
          rejected_by: adminId,
          rejection_reason: reason || 'No reason provided',
          admin_notes: admin_notes || null,
        };

  const { data, error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', transaction_id)
    .eq('status', 'pending') // Ensure transaction is still pending
    .select()
    .single();

  if (error) {
    throw new Error(`Error ${action}ing transaction: ${error.message}`);
  }

  if (!data) {
    throw new Error('Transaction not found or already processed');
  }

  return transactionSchema.parse(data);
}

/**
 * Mutation hook for approving or rejecting transactions.
 * Invalidates relevant queries on success.
 */
export function useTransactionApproval() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);

  return useMutation({
    mutationFn: (request: TransactionApprovalRequest) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }
      return processTransactionApproval(request, userId);
    },
    onSuccess: (transaction) => {
      // Invalidate admin queries
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: adminKeys.transactionsPending() });
      queryClient.invalidateQueries({ queryKey: adminKeys.auditLogs() });

      // Invalidate user transaction queries
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({
        queryKey: adminKeys.transactionDetail(transaction.id),
      });

      // Invalidate user balance (if approved)
      if (transaction.status === 'completed') {
        queryClient.invalidateQueries({ queryKey: balanceKeys.balance(transaction.user_id) });
      }
    },
  });
}
