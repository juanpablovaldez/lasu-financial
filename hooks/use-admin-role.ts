import { useEffect } from 'react';

import { supabase } from '@/lib/supabase';
import type { AdminRole } from '@/schemas';
import { adminRoleSchema } from '@/schemas';
import { useAdminStore } from '@/stores/admin-store';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Hook to check and store admin role on app startup.
 * Automatically syncs admin role from database to local store.
 */
export function useAdminRole() {
  const userId = useAuthStore((state) => state.userId);
  const { isAdmin, role, isHydrated, setAdminRole, clearAdminRole } = useAdminStore();

  useEffect(() => {
    // Wait for store to hydrate before checking
    if (!isHydrated) return;

    // If no user, clear admin role
    if (!userId) {
      clearAdminRole();
      return;
    }

    // Check admin role from database
    async function checkAdminRole() {
      try {
        const { data, error } = await supabase
          .from('admin_roles')
          .select('*')
          .eq('user_id', userId)
          .is('revoked_at', null)
          .single();

        if (error) {
          // If no role found, clear admin status
          if (error.code === 'PGRST116') {
            clearAdminRole();
            return;
          }
          throw error;
        }

        if (data) {
          const adminRole = adminRoleSchema.parse(data) as AdminRole;
          setAdminRole(adminRole.role);
        } else {
          clearAdminRole();
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        clearAdminRole();
      }
    }

    checkAdminRole();
  }, [userId, isHydrated, setAdminRole, clearAdminRole]);

  return {
    isAdmin,
    role,
    isLoading: !isHydrated,
  };
}
