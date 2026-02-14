import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@/lib/storage';
import type { CurrencyPreference } from '@/schemas';

interface WalletState {
  preferredCurrency: CurrencyPreference;
  setPreferredCurrency: (currency: CurrencyPreference) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      preferredCurrency: 'USD',
      setPreferredCurrency: (currency) => set({ preferredCurrency: currency }),
    }),
    {
      name: 'wallet-storage',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
