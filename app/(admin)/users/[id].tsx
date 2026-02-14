import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, View } from 'react-native';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useAdminUser } from '@/hooks/queries/use-admin-users';
import { formatDate, formatDateOnly } from '@/utils/format-date';

export default function UserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: user, isLoading } = useAdminUser(id);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-muted-foreground">Cargando usuario...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-destructive">Usuario no encontrado</Text>
      </View>
    );
  }

  const accountStatusLabels: Record<string, string> = {
    active: 'Activo',
    suspended: 'Suspendido',
    closed: 'Cerrado',
    pending_activation: 'Pendiente de activación',
  };

  const kycStatusLabels: Record<string, string> = {
    not_submitted: 'No enviado',
    pending_review: 'En revisión',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    requires_update: 'Requiere actualización',
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="gap-4 p-4">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle>Información básica</CardTitle>
          </CardHeader>
          <CardContent className="gap-3">
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Nombre:</Text>
              <Text className="font-semibold">{user.full_name || 'Sin nombre'}</Text>
            </View>

            {user.email && (
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Email:</Text>
                <Text>{user.email}</Text>
              </View>
            )}

            {user.phone && (
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Teléfono:</Text>
                <Text>{user.phone}</Text>
              </View>
            )}

            {user.country && (
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">País:</Text>
                <Text>{user.country}</Text>
              </View>
            )}

            {user.date_of_birth && (
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Fecha de nacimiento:</Text>
                <Text>{formatDateOnly(user.date_of_birth, 'es-AR')}</Text>
              </View>
            )}

            <View>
              <Text className="text-muted-foreground">ID de usuario:</Text>
              <Text className="text-xs">{user.user_id}</Text>
            </View>
          </CardContent>
        </Card>

        {/* Account status */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de cuenta</CardTitle>
          </CardHeader>
          <CardContent className="gap-3">
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Estado:</Text>
              <Text className="font-semibold">
                {accountStatusLabels[user.account_status] || user.account_status}
              </Text>
            </View>

            {user.suspended_at && (
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Suspendido el:</Text>
                <Text className="text-xs">{formatDate(user.suspended_at, 'es-AR')}</Text>
              </View>
            )}

            {user.suspension_reason && (
              <View>
                <Text className="text-muted-foreground">Motivo de suspensión:</Text>
                <Text>{user.suspension_reason}</Text>
              </View>
            )}

            {user.last_login_at && (
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Último acceso:</Text>
                <Text className="text-xs">{formatDate(user.last_login_at, 'es-AR')}</Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* KYC info */}
        <Card>
          <CardHeader>
            <CardTitle>Información KYC</CardTitle>
          </CardHeader>
          <CardContent className="gap-3">
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Estado KYC:</Text>
              <Text className="font-semibold">
                {kycStatusLabels[user.kyc_status] || user.kyc_status}
              </Text>
            </View>

            {user.kyc_submitted_at && (
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Enviado el:</Text>
                <Text className="text-xs">{formatDate(user.kyc_submitted_at, 'es-AR')}</Text>
              </View>
            )}

            {user.kyc_approved_at && (
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Aprobado el:</Text>
                <Text className="text-xs">{formatDate(user.kyc_approved_at, 'es-AR')}</Text>
              </View>
            )}
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle>Fechas</CardTitle>
          </CardHeader>
          <CardContent className="gap-3">
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Registro:</Text>
              <Text className="text-xs">{formatDate(user.created_at, 'es-AR')}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Última actualización:</Text>
              <Text className="text-xs">{formatDate(user.updated_at, 'es-AR')}</Text>
            </View>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}
