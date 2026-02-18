import { useAdminRole } from './use-admin-role';

/**
 * Hook to protect admin routes.
 * Returns auth state for the layout to render <Redirect> declaratively.
 *
 * @example
 * ```tsx
 * export default function AdminLayout() {
 *   const { isAuthorized, isLoading } = useAdminGuard();
 *
 *   if (isLoading) return <LoadingScreen />;
 *   if (!isAuthorized) return <Redirect href="/(tabs)" />;
 *
 *   return <Stack>...</Stack>;
 * }
 * ```
 */
export function useAdminGuard() {
  const { isAdmin, isLoading } = useAdminRole();

  return {
    isAuthorized: isAdmin,
    isLoading,
  };
}
