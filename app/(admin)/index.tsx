import { useRouter } from 'expo-router';
import { RefreshControl, ScrollView, View } from 'react-native';

import { AdminHeader, StatCard } from '@/components/admin';
import { Button } from '@/components/ui/button';
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
                    <StatCard title="Usuarios totales" value={stats?.total_users_count || 0} />
                  </View>
                  <View className="flex-1">
                    <StatCard
                      title="Usuarios activos"
                      value={stats?.active_users_count || 0}
                      variant="success"
                    />
                  </View>
                </View>

                {stats && stats.suspended_users_count > 0 && (
                  <StatCard
                    title="Usuarios suspendidos"
                    value={stats.suspended_users_count}
                    variant="warning"
                  />
                )}
              </View>
            </View>

            {/* Today's Activity */}
            <View>
              <Text className="mb-2 text-lg font-semibold">Actividad de hoy</Text>
              <View className="gap-3">
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <StatCard title="Transacciones" value={stats?.transactions_today_count || 0} />
                  </View>
                  <View className="flex-1">
                    <StatCard title="Operaciones" value={stats?.operations_today_count || 0} />
                  </View>
                </View>

                <StatCard
                  title="Depósitos hoy"
                  value={formatCurrency(stats?.deposits_today_usd || 0, 'USD', 'es-AR')}
                  variant="success"
                />

                <StatCard
                  title="Retiros hoy"
                  value={formatCurrency(stats?.withdrawals_today_usd || 0, 'USD', 'es-AR')}
                  variant="warning"
                />

                <StatCard
                  title="Operaciones ejecutadas hoy"
                  value={formatCurrency(stats?.operations_today_usd || 0, 'USD', 'es-AR')}
                />
              </View>
            </View>

            {/* Quick Actions */}
            <View>
              <Text className="mb-2 text-lg font-semibold">Acciones rápidas</Text>
              <View className="gap-3">
                <Button
                  variant="default"
                  onPress={() => router.push('/(admin)/transactions' as any)}
                >
                  <Text>Ver transacciones pendientes</Text>
                </Button>

                <Button
                  variant="outline"
                  onPress={() => router.push('/(admin)/operations/create' as any)}
                >
                  <Text>Crear operación</Text>
                </Button>

                <Button variant="outline" onPress={() => router.push('/(admin)/users' as any)}>
                  <Text>Ver usuarios</Text>
                </Button>

                <Button variant="ghost" onPress={() => router.push('/(admin)/audit-logs' as any)}>
                  <Text>Registro de auditoría</Text>
                </Button>
              </View>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
