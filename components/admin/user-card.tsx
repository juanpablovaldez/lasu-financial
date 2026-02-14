import { Pressable, View } from 'react-native';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import type { UserProfile } from '@/schemas';
import { formatDateOnly } from '@/utils/format-date';

interface UserCardProps {
  user: UserProfile;
  onPress?: () => void;
}

function getAccountStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'text-green-500';
    case 'suspended':
      return 'text-destructive';
    case 'closed':
      return 'text-muted-foreground';
    case 'pending_activation':
      return 'text-yellow-500';
    default:
      return 'text-muted-foreground';
  }
}

function getAccountStatusLabel(status: string) {
  switch (status) {
    case 'active':
      return 'Activo';
    case 'suspended':
      return 'Suspendido';
    case 'closed':
      return 'Cerrado';
    case 'pending_activation':
      return 'Pendiente';
    default:
      return status;
  }
}

function getKycStatusLabel(status: string) {
  switch (status) {
    case 'not_submitted':
      return 'No enviado';
    case 'pending_review':
      return 'En revisión';
    case 'approved':
      return 'Aprobado';
    case 'rejected':
      return 'Rechazado';
    case 'requires_update':
      return 'Requiere actualización';
    default:
      return status;
  }
}

export function UserCard({ user, onPress }: UserCardProps) {
  const content = (
    <Card className="mb-3">
      <CardHeader>
        <View className="flex-row items-center justify-between">
          <Text className="font-semibold">{user.full_name || 'Sin nombre'}</Text>
          <Text className={`text-xs font-semibold ${getAccountStatusColor(user.account_status)}`}>
            {getAccountStatusLabel(user.account_status)}
          </Text>
        </View>
      </CardHeader>
      <CardContent>
        <View className="gap-2">
          {user.email && (
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Email:</Text>
              <Text className="text-sm">{user.email}</Text>
            </View>
          )}

          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">KYC:</Text>
            <Text className="text-sm">{getKycStatusLabel(user.kyc_status)}</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Registro:</Text>
            <Text className="text-xs">{formatDateOnly(user.created_at, 'es-AR')}</Text>
          </View>
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
