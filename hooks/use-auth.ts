import { useContext } from 'react';

import { AuthContext } from '@/providers/auth-provider';

/**
 * Hook to access authentication context.
 *
 * Must be used within AuthProvider.
 *
 * @throws {Error} If used outside of AuthProvider
 *
 * @example
 * ```tsx
 * function ProtectedScreen() {
 *   const { session, isLoading, isAuthenticated } = useAuth();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (!isAuthenticated) return <Redirect href="/(auth)/sign-in" />;
 *
 *   return <ActualContent />;
 * }
 * ```
 *
 * @example
 * ```tsx
 * function UserAvatar() {
 *   const { user, session } = useAuth();
 *
 *   return (
 *     <View>
 *       <Text>{session?.user.email}</Text>
 *       {user?.avatar_url && <Image source={{ uri: user.avatar_url }} />}
 *     </View>
 *   );
 * }
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }

  return context;
}
