import { FlashList } from '@shopify/flash-list';
import { ActivityIndicator, RefreshControl, View } from 'react-native';

import { AuditLogCard } from '@/components/admin';
import { Text } from '@/components/ui/text';
import { useAuditLogs } from '@/hooks/queries/use-audit-logs';

export default function AuditLogsScreen() {
  const { data: logs, isLoading, refetch, isRefetching } = useAuditLogs();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted-foreground">Cargando registros...</Text>
      </View>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-4">
        <Text className="text-center text-muted-foreground">
          No hay registros de auditoría disponibles
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlashList
        data={logs}
        renderItem={({ item }) => <AuditLogCard log={item} />}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#fff" />
        }
      />
    </View>
  );
}
