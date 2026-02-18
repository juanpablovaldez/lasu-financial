import { useAdminRole } from './use-admin-role';

/**
 * Hook to protect regular user routes.
 * Returns auth state for the layout to render <Redirect> declaratively.
 *
 * @example
 * ```tsx
 * export default function TabLayout() {
 *   const { isAuthorized, isLoading } = useUserGuard();
 *
 *   if (isLoading) return <LoadingScreen />;
 *   if (!isAuthorized) return <Redirect href="/(admin)" />;
 *
 *   return <Tabs>...</Tabs>;
 * }
 * ```
 */
export function useUserGuard() {
  const { isAdmin, isLoading } = useAdminRole();

  return {
    isAuthorized: !isAdmin,
    isLoading,
  };
}
