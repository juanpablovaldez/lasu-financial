import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import {
  useActivateUser,
  useDeleteUser,
  useSuspendUser,
  useUpdateKycStatus,
} from '@/hooks/mutations/use-user-management';
import { useAdminUser, useAdminUserRole } from '@/hooks/queries/use-admin-users';
import { useAdminUserOperations } from '@/hooks/queries/use-admin-operations';
import type { KycStatus } from '@/schemas';
import { formatCurrency } from '@/utils/format';
import { formatDate, formatDateOnly } from '@/utils/format-date';

const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  suspended: 'Suspendido',
  closed: 'Cerrado',
  pending_activation: 'Pendiente de activación',
};

const KYC_STATUS_LABELS: Record<string, string> = {
  not_submitted: 'No enviado',
  pending_review: 'En revisión',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  requires_update: 'Requiere actualización',
};

const KYC_DIALOG_LABELS: Record<
  'approved' | 'rejected' | 'requires_update',
  { title: string; description: (name: string) => string; action: string }
> = {
  approved: {
    title: '¿Aprobar KYC?',
    description: (name) => `Se aprobará la verificación KYC de ${name}.`,
    action: 'Aprobar',
  },
  rejected: {
    title: '¿Rechazar KYC?',
    description: (name) => `Se rechazará la verificación KYC de ${name}.`,
    action: 'Rechazar',
  },
  requires_update: {
    title: '¿Solicitar actualización?',
    description: (name) => `Se le solicitará a ${name} que actualice su documentación KYC.`,
    action: 'Solicitar',
  },
};

export default function UserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: user, isLoading } = useAdminUser(id);
  const { data: operations } = useAdminUserOperations(id);
  const { data: adminRole } = useAdminUserRole(id);
  const isAdmin = adminRole !== null && adminRole !== undefined;

  const [suspendFormVisible, setSuspendFormVisible] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [activateDialogOpen, setActivateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [kycDialogAction, setKycDialogAction] = useState<
    'approved' | 'rejected' | 'requires_update' | null
  >(null);

  const { mutate: suspendUser, isPending: isSuspending } = useSuspendUser();
  const { mutate: activateUser, isPending: isActivating } = useActivateUser();
  const { mutate: updateKyc, isPending: isUpdatingKyc } = useUpdateKycStatus();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  function handleSuspend() {
    if (!user || suspendReason.trim().length < 10) return;
    suspendUser(
      { user_id: user.user_id, reason: suspendReason.trim() },
      {
        onSuccess: () => {
          setSuspendFormVisible(false);
          setSuspendReason('');
        },
      },
    );
  }

  function handleActivate() {
    if (!user) return;
    activateUser({ user_id: user.user_id }, { onSuccess: () => setActivateDialogOpen(false) });
  }

  function handleKycConfirm() {
    if (!user || !kycDialogAction) return;
    updateKyc(
      { user_id: user.user_id, kyc_status: kycDialogAction as KycStatus },
      { onSuccess: () => setKycDialogAction(null) },
    );
  }

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

  const userName = user.full_name || user.email || 'este usuario';
  const isSuspended = user.account_status === 'suspended';
  const canBlock = user.account_status === 'active' || user.account_status === 'pending_activation';
  const suspendReasonError =
    suspendReason.trim().length > 0 && suspendReason.trim().length < 10
      ? 'El motivo debe tener al menos 10 caracteres'
      : undefined;

  const kycDialogMeta = kycDialogAction ? KYC_DIALOG_LABELS[kycDialogAction] : null;

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
                {ACCOUNT_STATUS_LABELS[user.account_status] || user.account_status}
              </Text>
            </View>

            {user.suspended_at && (
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Suspendido el:</Text>
                <Text className="text-xs">{formatDate(user.suspended_at, 'es-AR')}</Text>
              </View>
            )}

            {user.suspension_reason && (
              <View className="gap-1">
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

            {(isSuspended || canBlock) && <Separator className="my-1" />}

            {/* Activate action */}
            {isSuspended && (
              <Button
                variant="outline"
                disabled={isActivating}
                onPress={() => setActivateDialogOpen(true)}
              >
                <Text>{isActivating ? 'Activando...' : 'Activar cuenta'}</Text>
              </Button>
            )}

            {/* Block action */}
            {canBlock && !suspendFormVisible && (
              <Button variant="destructive" onPress={() => setSuspendFormVisible(true)}>
                <Text>Bloquear cuenta</Text>
              </Button>
            )}

            {/* Inline suspend form */}
            {suspendFormVisible && (
              <View className="gap-3">
                <TextInput
                  label="MOTIVO DE BLOQUEO"
                  placeholder="Describe el motivo del bloqueo..."
                  value={suspendReason}
                  onChangeText={setSuspendReason}
                  multiline
                  numberOfLines={3}
                  error={suspendReasonError}
                  autoFocus
                />
                <View className="flex-row gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled={isSuspending}
                    onPress={() => {
                      setSuspendFormVisible(false);
                      setSuspendReason('');
                    }}
                  >
                    <Text>Cancelar</Text>
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={isSuspending || suspendReason.trim().length < 10}
                    onPress={handleSuspend}
                  >
                    <Text>{isSuspending ? 'Bloqueando...' : 'Confirmar'}</Text>
                  </Button>
                </View>
              </View>
            )}
          </CardContent>
        </Card>

        {/* KYC info */}
        <Card>
          <CardHeader>
            <CardTitle>Verificación KYC</CardTitle>
          </CardHeader>
          <CardContent className="gap-3">
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Estado KYC:</Text>
              <Text className="font-semibold">
                {KYC_STATUS_LABELS[user.kyc_status] || user.kyc_status}
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

            <Separator className="my-1" />

            {/* KYC action buttons */}
            {user.kyc_status !== 'approved' && (
              <Button disabled={isUpdatingKyc} onPress={() => setKycDialogAction('approved')}>
                <Text>{isUpdatingKyc ? 'Actualizando...' : 'Aprobar KYC'}</Text>
              </Button>
            )}

            {user.kyc_status !== 'rejected' && (
              <Button
                variant="destructive"
                disabled={isUpdatingKyc}
                onPress={() => setKycDialogAction('rejected')}
              >
                <Text>{isUpdatingKyc ? 'Actualizando...' : 'Rechazar KYC'}</Text>
              </Button>
            )}

            {user.kyc_status !== 'requires_update' && (
              <Button
                variant="outline"
                disabled={isUpdatingKyc}
                onPress={() => setKycDialogAction('requires_update')}
              >
                <Text>{isUpdatingKyc ? 'Actualizando...' : 'Solicitar actualización'}</Text>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Operations — hidden for admin users */}
        {!isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Operaciones</CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
              {!operations || operations.length === 0 ? (
                <Text className="text-muted-foreground">Sin operaciones registradas</Text>
              ) : (
                operations.map((op, index) => {
                  const TYPE_LABELS: Record<string, string> = {
                    ganancia: 'Ganancia',
                    perdida: 'Pérdida',
                    ingreso: 'Ingreso',
                    egreso: 'Egreso',
                  };
                  const isPositive = ['ingreso', 'ganancia'].includes(op.operation_type);
                  return (
                    <View key={op.id}>
                      {index > 0 && <Separator className="mb-3" />}
                      <View className="flex-row justify-between">
                        <Text className="font-medium">
                          {TYPE_LABELS[op.operation_type] ?? op.operation_type}
                        </Text>
                        <Text
                          className={`font-semibold ${isPositive ? 'text-green-500' : 'text-destructive'}`}
                        >
                          {isPositive ? '+' : '-'}
                          {formatCurrency(op.total_amount_usd)}
                        </Text>
                      </View>
                      <View className="mt-1 flex-row justify-between">
                        <Text className="text-xs text-muted-foreground">
                          {formatDate(op.created_at, 'es-AR')}
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                          {{
                            pending: 'Pendiente',
                            completed: 'Completado',
                            cancelled: 'Cancelado',
                            failed: 'Fallido',
                          }[op.status] ?? op.status}
                        </Text>
                      </View>
                      {op.description && (
                        <Text className="mt-1 text-xs text-muted-foreground">{op.description}</Text>
                      )}
                    </View>
                  );
                })
              )}
            </CardContent>
          </Card>
        )}

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

        {/* Danger zone */}
        {!isAdmin && (
          <Button
            variant="destructive"
            onPress={() => setDeleteDialogOpen(true)}
            disabled={isDeleting}
          >
            <Text>{isDeleting ? 'Eliminando...' : 'Eliminar cliente'}</Text>
          </Button>
        )}
      </View>

      {/* Activate account dialog */}
      <AlertDialog open={activateDialogOpen} onOpenChange={setActivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Activar cuenta?</AlertDialogTitle>
            <AlertDialogDescription>
              Se restaurará el acceso de {userName} a la plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>Cancelar</Text>
            </AlertDialogCancel>
            <AlertDialogAction onPress={handleActivate}>
              <Text>Activar</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete user dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el perfil de {userName}. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              <Text>Cancelar</Text>
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive"
              disabled={isDeleting}
              onPress={() => deleteUser(user.user_id)}
            >
              <Text>Eliminar</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* KYC action dialog */}
      <AlertDialog
        open={kycDialogAction !== null}
        onOpenChange={(open) => !open && setKycDialogAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{kycDialogMeta?.title}</AlertDialogTitle>
            <AlertDialogDescription>{kycDialogMeta?.description(userName)}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>Cancelar</Text>
            </AlertDialogCancel>
            <AlertDialogAction
              className={kycDialogAction === 'rejected' ? 'bg-destructive' : undefined}
              onPress={handleKycConfirm}
            >
              <Text>{kycDialogMeta?.action}</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ScrollView>
  );
}
