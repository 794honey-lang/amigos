import { create } from 'zustand';

export const useScopeStore = create((set) => ({
  currentFranchiseId: null,
  currentStoreId: null,

  setFranchiseScope: (franchiseId) => set({ currentFranchiseId: franchiseId, currentStoreId: null }),
  setStoreScope: (storeId) => set({ currentStoreId: storeId }),
  resetScope: () => set({ currentFranchiseId: null, currentStoreId: null }),
  
  resetToUserScope: (authScope) => set({
    currentFranchiseId: authScope?.franchiseId || null,
    currentStoreId: authScope?.storeId || null
  })
}));
