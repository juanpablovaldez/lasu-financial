import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@/lib/storage';
import type { AdminRoleType } from '@/schemas';

interface AdminState {
  // State
  isAdmin: boolean;
  role: AdminRoleType | null;
  isHydrated: boolean;

  // Actions
  setAdminRole: (role: AdminRoleType) => void;
  clearAdminRole: () => void;
  setHydrated: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      isAdmin: false,
      role: null,
      isHydrated: false,

      // Actions
      setAdminRole: (role) =>
        set({
          role,
          isAdmin: role === 'super_admin' || role === 'admin',
        }),

      clearAdminRole: () =>
        set({
          role: null,
          isAdmin: false,
        }),

      setHydrated: () =>
        set({
          isHydrated: true,
        }),
    }),
    {
      name: 'admin-store',
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
