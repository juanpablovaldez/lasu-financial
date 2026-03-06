import { useMemo } from 'react';

import { useTransactions } from './use-transactions';
import { useUserOperations } from './use-user-operations';

export interface ActivityItem {
  id: string;
  date: string;
  kind: 'transaction' | 'operation';
  label: string;
  amount: number;
  isPositive: boolean;
  status: string;
  percentage?: number;
  originalId: string;
}

/**
 * Combines recent transactions and gain/loss operations into a unified activity feed.
 * Sorted by created_at DESC, capped at 10 items.
 */
export function useUserActivity(limit = 10) {
  const { data: transactions, isLoading: txLoading, error: txError } = useTransactions(limit);
  const { data: operations, isLoading: opLoading, error: opError } = useUserOperations();

  const activity = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];

    for (const tx of transactions ?? []) {
      items.push({
        id: `tx-${tx.id}`,
        date: tx.created_at,
        kind: 'transaction',
        label: tx.type === 'deposit' ? 'Depósito' : 'Retiro',
        amount: tx.amount,
        isPositive: tx.type === 'deposit',
        status: tx.status,
        originalId: tx.id,
      });
    }

    for (const op of operations ?? []) {
      const isPositive = op.operation_type === 'ganancia' || op.operation_type === 'ingreso';
      const percentage =
        op.metadata && typeof op.metadata === 'object' && 'percentage' in op.metadata
          ? Number(op.metadata.percentage)
          : undefined;

      const OPERATION_LABELS: Record<string, string> = {
        ganancia: 'Ganancia',
        perdida: 'Pérdida',
        ingreso: 'Ingreso',
        egreso: 'Egreso',
      };

      items.push({
        id: `op-${op.id}`,
        date: op.created_at,
        kind: 'operation',
        label: OPERATION_LABELS[op.operation_type] ?? op.operation_type,
        amount: op.total_amount_usd,
        isPositive,
        status: op.status,
        percentage,
        originalId: op.id,
      });
    }

    return items
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }, [transactions, operations, limit]);

  return {
    data: activity,
    isLoading: txLoading || opLoading,
    error: txError ?? opError,
  };
}
