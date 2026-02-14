import { Pressable, View } from 'react-native';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import type { AuditLog } from '@/schemas';
import { formatDate } from '@/utils/format-date';

const ACTION_LABELS: Record<string, string> = {
  transaction_approved: 'Transacción aprobada',
  transaction_rejected: 'Transacción rechazada',
  operation_created: 'Operación creada',
  operation_completed: 'Operación completada',
  operation_cancelled: 'Operación cancelada',
  admin_role_granted: 'Rol de admin otorgado',
  admin_role_revoked: 'Rol de admin revocado',
  user_account_suspended: 'Cuenta suspendida',
  user_account_activated: 'Cuenta activada',
  balance_adjusted: 'Balance ajustado',
};

interface AuditLogCardProps {
  log: AuditLog;
  onPress?: () => void;
}

export function AuditLogCard({ log, onPress }: AuditLogCardProps) {
  const content = (
    <Card className="mb-3">
      <CardHeader>
        <View className="flex-row items-center justify-between">
          <Text className="font-semibold">{ACTION_LABELS[log.action] || log.action}</Text>
          <Text className="text-xs text-muted-foreground">
            {formatDate(log.performed_at, 'es-AR', {
              dateStyle: 'short',
              timeStyle: 'medium',
            })}
          </Text>
        </View>
      </CardHeader>
      <CardContent>
        <View className="gap-2">
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Tipo:</Text>
            <Text className="text-sm">{log.entity_type}</Text>
          </View>

          <View>
            <Text className="text-muted-foreground">ID de entidad:</Text>
            <Text className="font-mono text-xs">{log.entity_id}</Text>
          </View>

          {log.performed_by && (
            <View>
              <Text className="text-muted-foreground">Realizado por:</Text>
              <Text className="font-mono text-xs">{log.performed_by}</Text>
            </View>
          )}

          {log.reason && (
            <View>
              <Text className="text-muted-foreground">Razón:</Text>
              <Text className="text-sm">{log.reason}</Text>
            </View>
          )}
        </View>
      </CardContent>
    </Card>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-70">
        {content}
      </Pressable>
    );
  }

  return content;
}
