import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockPromotions } from '../mocks/mockPromotions';

export const usePromotionStore = create(
  persist(
    (set, get) => ({
      promotions: [...mockPromotions],
      storePromoOverrides: {}, // storeId -> promoCode -> boolean

      createPromotion: (newPromo) => {
        set((state) => ({
          promotions: [...state.promotions, { ...newPromo, isActive: true }]
        }));
      },

      togglePromotionStatus: (code, isActive) => {
        set((state) => ({
          promotions: state.promotions.map((p) =>
            p.code === code ? { ...p, isActive } : p
          )
        }));
      },

      updateStorePromoOverride: (storeId, promoCode, isEnabled) => {
        set((state) => {
          const overrides = { ...state.storePromoOverrides };
          if (!overrides[storeId]) {
            overrides[storeId] = {};
          }
          overrides[storeId] = {
            ...overrides[storeId],
            [promoCode]: isEnabled
          };
          return { storePromoOverrides: overrides };
        });
      },

      bulkUpdateStorePromoOverrides: (storeIds, promoCode, isEnabled) => {
        set((state) => {
          const overrides = { ...state.storePromoOverrides };
          storeIds.forEach((storeId) => {
            if (!overrides[storeId]) {
              overrides[storeId] = {};
            }
            overrides[storeId] = {
              ...overrides[storeId],
              [promoCode]: isEnabled
            };
          });
          return { storePromoOverrides: overrides };
        });
      },

      resetStore: () => {
        set({
          promotions: [...mockPromotions],
          storePromoOverrides: {}
        });
      }
    }),
    {
      name: 'amigos_promotions_storage'
    }
  )
);
