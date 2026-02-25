import { useQuery } from '@tanstack/react-query';

import type { PerformanceChartDataPoint } from '@/components/performance-chart';
import { supabase } from '@/lib/supabase';

export interface PerformanceData {
  chartData: PerformanceChartDataPoint[];
  totalGainsUsd: number;
  totalLossesUsd: number;
  netUsd: number;
  netPercentage: number;
}

type OperationRow = {
  operation_type: string;
  total_amount_usd: number;
  created_at: string;
};

/**
 * Aggregates raw operation rows into a cumulative portfolio performance curve.
 *
 * Each data point represents the running portfolio P&L up to that date:
 * gains increase the cumulative value, losses decrease it.
 * Entries are sorted explicitly by date so the curve is always chronological.
 */
export function buildCumulativeChartData(
  rows: OperationRow[],
): Pick<PerformanceData, 'chartData' | 'totalGainsUsd' | 'totalLossesUsd'> {
  const byDate = new Map<string, number>();
  let totalGainsUsd = 0;
  let totalLossesUsd = 0;

  for (const row of rows) {
    const date = row.created_at.split('T')[0];
    const delta = row.operation_type === 'gain' ? row.total_amount_usd : -row.total_amount_usd;

    byDate.set(date, (byDate.get(date) ?? 0) + delta);

    if (row.operation_type === 'gain') {
      totalGainsUsd += row.total_amount_usd;
    } else {
      totalLossesUsd += row.total_amount_usd;
    }
  }

  // Sort by date string (ISO format is lexicographically chronological)
  const sortedEntries = Array.from(byDate.entries()).sort(([a], [b]) => a.localeCompare(b));

  // Running cumulative sum → each point reflects total portfolio P&L up to that day
  let cumulative = 0;
  const chartData: PerformanceChartDataPoint[] = sortedEntries.map(([date, dailyNet]) => {
    cumulative += dailyNet;
    return {
      value: cumulative,
      date,
      label: new Date(`${date}T12:00:00`).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
      }),
    };
  });

  return { chartData, totalGainsUsd, totalLossesUsd };
}

export const performanceKeys = {
  all: ['performance'] as const,
  admin: () => [...performanceKeys.all, 'admin'] as const,
};

async function fetchPerformanceData(): Promise<PerformanceData> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase
    .from('operations')
    .select('operation_type, total_amount_usd, created_at')
    .in('operation_type', ['gain', 'loss'])
    .eq('status', 'completed')
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Error fetching performance data: ${error.message}`);
  }

  const { chartData, totalGainsUsd, totalLossesUsd } = buildCumulativeChartData(data ?? []);
  const netUsd = totalGainsUsd - totalLossesUsd;
  const netPercentage = totalGainsUsd > 0 ? (netUsd / totalGainsUsd) * 100 : 0;

  return { chartData, totalGainsUsd, totalLossesUsd, netUsd, netPercentage };
}

/**
 * Admin hook: fetches all gain + loss operations grouped by date for chart display.
 */
export function usePerformanceData() {
  return useQuery({
    queryKey: performanceKeys.admin(),
    queryFn: fetchPerformanceData,
    staleTime: 30_000,
  });
}
