import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { useCompleteOperation } from '@/hooks/mutations/use-complete-operation';
import { useCreateOperation } from '@/hooks/mutations/use-create-operation';
import { useAdminUsers } from '@/hooks/queries/use-admin-users';
import { createOperationRequestSchema } from '@/schemas';
import type { UserProfile } from '@/schemas';

export function GainLossForm() {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showUserList, setShowUserList] = useState(false);

  const { data: users } = useAdminUsers();
  const { mutateAsync: createOperation, isPending: isCreating } = useCreateOperation();
  const { mutateAsync: completeOperation, isPending: isCompleting } = useCompleteOperation();

  const isPending = isCreating || isCompleting;

  const filteredUsers = (users ?? []).filter((u) => {
    const q = search.toLowerCase();
    const emailLocal = u.email?.split('@')[0]?.split('+')[0]?.toLowerCase() ?? '';
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      emailLocal.includes(q)
    );
  });

  const form = useForm({
    defaultValues: {
      operation_type: 'gain' as 'gain' | 'loss',
      total_amount_usd: '',
      percentage: '',
      description: '',
    },
    onSubmit: async ({ value }) => {
      if (!selectedUser) return;

      const amount = parseFloat(value.total_amount_usd);
      const pct = parseFloat(value.percentage);

      const parsed = createOperationRequestSchema.safeParse({
        user_id: selectedUser.user_id,
        operation_type: value.operation_type,
        total_amount_usd: amount,
        currency: 'USD',
        fee_amount: 0,
        description: value.description || undefined,
        percentage: pct,
      });

      if (!parsed.success) return;

      const operation = await createOperation(parsed.data);

      await completeOperation({ operation_id: operation.id });

      form.reset();
      setSelectedUser(null);
      setSearch('');
    },
  });

  return (
    <ScrollView className="flex-1" keyboardShouldPersistTaps="always">
      <View className="gap-4 p-4">
        {/* User search */}
        <View className="gap-2">
          <Text className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Usuario
          </Text>
          {selectedUser ? (
            <TouchableOpacity
              onPress={() => {
                setSelectedUser(null);
                setSearch('');
                setShowUserList(true);
              }}
              activeOpacity={0.7}
            >
              <Card>
                <CardContent className="flex-row items-center justify-between py-3">
                  <View>
                    <Text className="font-medium">
                      {selectedUser.full_name ?? selectedUser.email}
                    </Text>
                    <Text className="text-sm text-muted-foreground">{selectedUser.email}</Text>
                  </View>
                  <Text className="text-sm text-primary">Cambiar</Text>
                </CardContent>
              </Card>
            </TouchableOpacity>
          ) : (
            <View>
              <Input
                placeholder="Buscar por nombre o email..."
                value={search}
                onChangeText={(t) => {
                  setSearch(t);
                  setShowUserList(true);
                }}
                onFocus={() => setShowUserList(true)}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {showUserList && (
                <Card className="mt-1">
                  <CardContent className="p-0">
                    {search.length === 0 ? (
                      <View className="px-4 py-3">
                        <Text className="text-muted-foreground">Escribe para buscar...</Text>
                      </View>
                    ) : filteredUsers.length === 0 ? (
                      <View className="px-4 py-3">
                        <Text className="text-muted-foreground">Sin resultados</Text>
                      </View>
                    ) : (
                      filteredUsers.slice(0, 6).map((u) => (
                        <TouchableOpacity
                          key={u.user_id}
                          onPress={() => {
                            setSelectedUser(u);
                            setShowUserList(false);
                            setSearch('');
                          }}
                          activeOpacity={0.7}
                          className="border-b border-border px-4 py-3 last:border-0"
                        >
                          <Text className="font-medium">{u.full_name ?? u.email}</Text>
                          <Text className="text-sm text-muted-foreground">{u.email}</Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </CardContent>
                </Card>
              )}
            </View>
          )}
        </View>

        {/* Type toggle */}
        <form.Field name="operation_type">
          {(field) => (
            <View className="gap-2">
              <Text className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Tipo
              </Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => field.handleChange('gain')}
                  activeOpacity={0.7}
                  className={`flex-1 items-center rounded-xl py-3 ${
                    field.state.value === 'gain' ? 'bg-green-500' : 'border border-border bg-card'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      field.state.value === 'gain' ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    Ganancia
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => field.handleChange('loss')}
                  activeOpacity={0.7}
                  className={`flex-1 items-center rounded-xl py-3 ${
                    field.state.value === 'loss' ? 'bg-red-500' : 'border border-border bg-card'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      field.state.value === 'loss' ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    Pérdida
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </form.Field>

        {/* Amount */}
        <form.Field name="total_amount_usd">
          {(field) => (
            <TextInput
              label="Monto (USD)"
              placeholder="0.00"
              value={field.state.value}
              onChangeText={field.handleChange}
              keyboardType="decimal-pad"
            />
          )}
        </form.Field>

        {/* Percentage */}
        <form.Field name="percentage">
          {(field) => (
            <TextInput
              label="Porcentaje (%)"
              placeholder="0.00"
              value={field.state.value}
              onChangeText={field.handleChange}
              keyboardType="decimal-pad"
            />
          )}
        </form.Field>

        {/* Description */}
        <form.Field name="description">
          {(field) => (
            <TextInput
              label="Descripción (opcional)"
              placeholder="Ej: Rendimiento mensual Q1 2026"
              value={field.state.value}
              onChangeText={field.handleChange}
            />
          )}
        </form.Field>

        {/* Submit */}
        <form.Subscribe selector={(s) => s.values.operation_type}>
          {(opType) => (
            <Button
              onPress={() => form.handleSubmit()}
              disabled={isPending || !selectedUser}
              className={opType === 'gain' ? 'bg-green-500' : 'bg-red-500'}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="font-semibold text-white">
                  {opType === 'gain' ? 'Cargar ganancia' : 'Cargar pérdida'}
                </Text>
              )}
            </Button>
          )}
        </form.Subscribe>
      </View>
    </ScrollView>
  );
}
