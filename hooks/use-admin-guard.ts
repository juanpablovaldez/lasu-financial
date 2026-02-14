import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { useAdminRole } from './use-admin-role';

/**
 * Hook to protect admin routes.
 * Redirects non-admin users to the main app.
 *
 * @example
 * ```tsx
 * export default function AdminLayout() {
 *   const { isAuthorized } = useAdminGuard();
 *
 *   if (!isAuthorized) {
 *     return <LoadingScreen />;
 *   }
 *
 *   return <Stack>...</Stack>;
 * }
 * ```
 */
export function useAdminGuard() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAdminRole();

  useEffect(() => {
    if (isLoading) return;

    if (!isAdmin) {
      router.replace('/(tabs)');
    }
  }, [isAdmin, isLoading, router]);

  return {
    isAuthorized: isAdmin,
    isLoading,
  };
}
