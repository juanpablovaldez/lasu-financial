import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { useAdminRole } from './use-admin-role';

/**
 * Hook to protect regular user routes.
 * Redirects admin users to the admin panel.
 *
 * @example
 * ```tsx
 * export default function TabLayout() {
 *   const { isAuthorized, isLoading } = useUserGuard();
 *
 *   if (!isAuthorized) {
 *     return null;
 *   }
 *
 *   return <Tabs>...</Tabs>;
 * }
 * ```
 */
export function useUserGuard() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAdminRole();

  useEffect(() => {
    if (isLoading) return;

    if (isAdmin) {
      router.replace('/(admin)');
    }
  }, [isAdmin, isLoading, router]);

  return {
    isAuthorized: !isAdmin,
    isLoading,
  };
}
