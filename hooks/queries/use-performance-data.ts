import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { PerformanceChartDataPoint } from '@/components/performance-chart';

export interface PerformanceData {
  chartData: PerformanceChartDataPoint[];
  totalGainsUsd: number;
  totalLossesUsd: number;
  netUsd: number;
  netPercentage: number;
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

  const rows = data ?? [];

  // Aggregate by date
  const byDate = new Map<string, number>();
  let totalGainsUsd = 0;
  let totalLossesUsd = 0;

  for (const row of rows) {
    const date = row.created_at.split('T')[0];
    const amount = row.operation_type === 'gain' ? row.total_amount_usd : -row.total_amount_usd;

    byDate.set(date, (byDate.get(date) ?? 0) + amount);

    if (row.operation_type === 'gain') {
      totalGainsUsd += row.total_amount_usd;
    } else {
      totalLossesUsd += row.total_amount_usd;
    }
  }

  const netUsd = totalGainsUsd - totalLossesUsd;
  const netPercentage = totalGainsUsd > 0 ? (netUsd / totalGainsUsd) * 100 : 0;

  const chartData: PerformanceChartDataPoint[] = Array.from(byDate.entries()).map(
    ([date, value]) => ({
      value,
      date,
      label: new Date(date + 'T12:00:00').toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
      }),
    }),
  );

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
