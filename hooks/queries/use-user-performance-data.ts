import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';

import { buildCumulativeChartData, type PerformanceData } from './use-performance-data';

export const userPerformanceKeys = {
  all: ['user-performance'] as const,
  user: (userId: string) => [...userPerformanceKeys.all, userId] as const,
};

async function fetchUserPerformanceData(userId: string): Promise<PerformanceData> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase
    .from('operations')
    .select('operation_type, total_amount_usd, created_at')
    .eq('user_id', userId)
    .in('operation_type', ['gain', 'loss'])
    .eq('status', 'completed')
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Error fetching user performance data: ${error.message}`);
  }

  const { chartData, totalGainsUsd, totalLossesUsd } = buildCumulativeChartData(data ?? []);
  const netUsd = totalGainsUsd - totalLossesUsd;
  const netPercentage = totalGainsUsd > 0 ? (netUsd / totalGainsUsd) * 100 : 0;

  return { chartData, totalGainsUsd, totalLossesUsd, netUsd, netPercentage };
}

export function useUserPerformanceData() {
  const userId = useAuthStore((state) => state.userId);

  return useQuery({
    queryKey: userPerformanceKeys.user(userId!),
    queryFn: () => fetchUserPerformanceData(userId!),
    enabled: !!userId,
    staleTime: 30_000,
  });
}
