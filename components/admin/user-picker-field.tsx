import { Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Text } from '@/components/ui/text';
import { TextInput } from '@/components/ui/text-input';
import { useAdminUsers } from '@/hooks/queries/use-admin-users';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/schemas';

import { FlashList } from '@shopify/flash-list';

interface UserPickerFieldProps {
  value: string;
  onSelect: (userId: string) => void;
}

function UserRow({ user, onPress }: { user: UserProfile; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="px-2 py-3 active:bg-muted">
      <Text className="font-medium">{user.full_name || 'Sin nombre'}</Text>
      {user.email && <Text className="text-sm text-muted-foreground">{user.email}</Text>}
    </Pressable>
  );
}

export function UserPickerField({ value, onSelect }: UserPickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { data: users, isLoading } = useAdminUsers();

  const selectedUser = useMemo(() => users?.find((u) => u.user_id === value), [users, value]);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!search.trim()) return users;
    const query = search.toLowerCase();
    return users.filter(
      (u) => u.full_name?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query),
    );
  }, [users, search]);

  const handleSelect = (userId: string) => {
    onSelect(userId);
    setOpen(false);
    setSearch('');
  };

  return (
    <View className="gap-1">
      <Text className="text-sm font-medium text-muted-foreground">Usuario</Text>
      <Pressable
        onPress={() => setOpen(true)}
        className={cn(
          'flex-row items-center rounded-xl bg-input px-4 py-3.5',
          !selectedUser && 'opacity-60',
        )}
      >
        {selectedUser ? (
          <View className="flex-1">
            <Text className="font-medium">{selectedUser.full_name || 'Sin nombre'}</Text>
            {selectedUser.email && (
              <Text className="text-sm text-muted-foreground">{selectedUser.email}</Text>
            )}
          </View>
        ) : (
          <Text className="flex-1 text-muted-foreground">Seleccionar usuario...</Text>
        )}
      </Pressable>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-h-[80%]">
          <AlertDialogHeader>
            <AlertDialogTitle>Seleccionar usuario</AlertDialogTitle>
          </AlertDialogHeader>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por nombre o email..."
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon={<Search size={18} className="text-muted-foreground" />}
          />

          <View className="h-64">
            {isLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator />
              </View>
            ) : (
              <FlashList
                data={filteredUsers}
                keyExtractor={(item) => item.user_id}
                renderItem={({ item }) => (
                  <UserRow user={item} onPress={() => handleSelect(item.user_id)} />
                )}
                ListEmptyComponent={
                  <View className="items-center py-8">
                    <Text className="text-muted-foreground">No se encontraron usuarios</Text>
                  </View>
                }
              />
            )}
          </View>

          <AlertDialogFooter>
            <AlertDialogCancel onPress={() => setSearch('')}>
              <Text>Cancelar</Text>
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
}
