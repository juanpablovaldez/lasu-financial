import { useRouter } from 'expo-router';
import { RefreshControl, ScrollView, View } from 'react-native';

import { AdminHeader, StatCard } from '@/components/admin';
import { Text } from '@/components/ui/text';
import { useAdminDashboard } from '@/hooks/queries/use-admin-dashboard';
import { formatCurrency } from '@/utils/format';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { data: stats, isLoading, refetch, isRefetching } = useAdminDashboard();

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#fff" />
      }
    >
      <View className="gap-4 p-4">
        <AdminHeader
          title="Panel de administración"
          subtitle="Gestión de transacciones y usuarios"
        />

        {isLoading ? (
          <View className="items-center py-8">
            <Text className="text-muted-foreground">Cargando estadísticas...</Text>
          </View>
        ) : (
          <>
            {/* Pending Transactions Alert */}
            {stats && stats.pending_transactions_count > 0 && (
              <StatCard
                title="⚠️ Transacciones pendientes"
                value={stats.pending_transactions_count}
                subtitle="Requieren aprobación"
                variant="warning"
                onPress={() => router.push('/(admin)/transactions' as any)}
              />
            )}

            {/* System Overview */}
            <View>
              <Text className="mb-2 text-lg font-semibold">Vista general del sistema</Text>
              <View className="gap-3">
                <StatCard
                  title="Balance total del sistema"
                  value={formatCurrency(stats?.total_balance_usd || 0, 'USD', 'es-AR')}
                  variant="primary"
                />

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <StatCard
                      title="Usuarios activos"
                      value={stats?.active_users_count || 0}
                      variant="success"
                    />
                  </View>
                  <View className="flex-1">
                    <StatCard
                      title="Usuarios suspendidos"
                      value={stats?.suspended_users_count || 0}
                      variant="warning"
                    />
                  </View>
                </View>
              </View>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
