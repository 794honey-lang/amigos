import { create } from 'zustand';
import { mockStores } from '@shared/mocks/mockStores';
import { mockStoreHours } from '../mocks/mockStoreHours';
import { mockDeliveryZones } from '../mocks/mockDeliveryZones';
import { mockFranchises } from '@shared/mocks/mockFranchises';

const API_URL = 'http://localhost:5050/api';

export const useStoreRegistry = create((set, get) => ({
  stores: [...mockStores],
  storeHours: [...mockStoreHours],
  deliveryZones: (() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem('amigos_delivery_zones');
        return stored ? JSON.parse(stored) : [...mockDeliveryZones];
      }
      return [...mockDeliveryZones];
    } catch (e) {
      return [...mockDeliveryZones];
    }
  })(),
  franchises: [...mockFranchises],

  fetchRegistry: async () => {
    try {
      const [storesRes, franchisesRes] = await Promise.all([
        fetch(`${API_URL}/stores`),
        fetch(`${API_URL}/franchises`)
      ]);
      const storesData = await storesRes.json();
      const franchisesData = await franchisesRes.json();
      
      if (storesData.success) {
        set({ stores: storesData.data });
      }
      if (franchisesData.success) {
        const mappedFranchises = franchisesData.data.map(f => {
          const { stores, ...rest } = f;
          return rest;
        });
        set({ franchises: mappedFranchises });
      }
    } catch (e) {
      console.error('Failed to fetch store registry from backend:', e);
    }
  },

  addFranchise: async (newFranchise) => {
    try {
      const res = await fetch(`${API_URL}/franchises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFranchise)
      });
      const data = await res.json();
      if (data.success) {
        const created = data.data;
        set((state) => ({
          franchises: [...state.franchises, created]
        }));
        return created;
      }
    } catch (e) {
      console.error('Failed to add franchise in database:', e);
    }
  },

  updateFranchise: async (id, updatedFields) => {
    try {
      const res = await fetch(`${API_URL}/franchises/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (data.success) {
        set((state) => ({
          franchises: state.franchises.map(f => f.id === id ? data.data : f)
        }));
      }
    } catch (e) {
      console.error('Failed to update franchise in database:', e);
    }
  },

  deleteFranchise: async (id) => {
    try {
      const res = await fetch(`${API_URL}/franchises/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        const storesToDelete = get().stores.filter(s => s.franchiseId === id);
        const storeIdsToDelete = storesToDelete.map(s => s.id);

        set({
          franchises: get().franchises.filter(f => f.id !== id),
          stores: get().stores.filter(s => s.franchiseId !== id),
          storeHours: get().storeHours.filter(h => !storeIdsToDelete.includes(h.storeId)),
          deliveryZones: get().deliveryZones.filter(z => !storeIdsToDelete.includes(z.storeId))
        });
      }
    } catch (e) {
      console.error('Failed to delete franchise in database:', e);
    }
  },

  addStore: async (newStore) => {
    try {
      const res = await fetch(`${API_URL}/stores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStore)
      });
      const data = await res.json();
      if (data.success) {
        const created = data.data;

        const defaultHours = {
          storeId: created.id,
          regularHours: {
            Monday: { open: '11:00 AM', close: '11:00 PM', closed: false },
            Tuesday: { open: '11:00 AM', close: '11:00 PM', closed: false },
            Wednesday: { open: '11:00 AM', close: '11:00 PM', closed: false },
            Thursday: { open: '11:00 AM', close: '11:00 PM', closed: false },
            Friday: { open: '11:00 AM', close: '11:00 PM', closed: false },
            Saturday: { open: '11:00 AM', close: '11:00 PM', closed: false },
            Sunday: { open: '11:00 AM', close: '11:00 PM', closed: false }
          },
          holidayClosures: []
        };

        const defaultZone = {
          storeId: created.id,
          mode: 'radius',
          radiusKm: 4,
          polygonCoordinates: []
        };

        set((state) => ({
          stores: [...state.stores, created],
          storeHours: [...state.storeHours, defaultHours],
          deliveryZones: [...state.deliveryZones, defaultZone]
        }));

        return created;
      }
    } catch (e) {
      console.error('Failed to add store in database:', e);
    }
  },

  updateStore: async (id, updatedFields) => {
    try {
      const res = await fetch(`${API_URL}/stores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (data.success) {
        set((state) => ({
          stores: state.stores.map(s => s.id === id ? data.data : s)
        }));
      }
    } catch (e) {
      console.error('Failed to update store in database:', e);
    }
  },

  deleteStore: async (id) => {
    try {
      const res = await fetch(`${API_URL}/stores/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        set({
          stores: get().stores.filter(s => s.id !== id),
          storeHours: get().storeHours.filter(h => h.storeId !== id),
          deliveryZones: get().deliveryZones.filter(z => z.storeId !== id)
        });
      }
    } catch (e) {
      console.error('Failed to delete store in database:', e);
    }
  },

  updateStoreHours: (storeId, regularHours, holidayClosures) => {
    const { storeHours } = get();
    const existingIndex = storeHours.findIndex(h => h.storeId === storeId);

    if (existingIndex > -1) {
      set({
        storeHours: storeHours.map(h => 
          h.storeId === storeId 
            ? { ...h, regularHours: regularHours || h.regularHours, holidayClosures: holidayClosures || h.holidayClosures } 
            : h
        )
      });
    } else {
      set({
        storeHours: [...storeHours, { storeId, regularHours: regularHours || {}, holidayClosures: holidayClosures || [] }]
      });
    }
  },

  bulkUpdateStoreHours: (storeIds, regularHours) => {
    const { storeHours } = get();
    set({
      storeHours: storeHours.map(h => {
        if (storeIds.includes(h.storeId)) {
          return { ...h, regularHours: { ...regularHours } };
        }
        return h;
      })
    });
  },

  bulkAddHolidayClosure: (storeIds, closure) => {
    const { storeHours } = get();
    set({
      storeHours: storeHours.map(h => {
        if (storeIds.includes(h.storeId)) {
          const closures = h.holidayClosures || [];
          const filtered = closures.filter(c => c.date !== closure.date);
          return { ...h, holidayClosures: [...filtered, closure] };
        }
        return h;
      })
    });
  },

  updateDeliveryZone: (storeId, mode, radiusKm, polygonCoordinates, deliveryCharge, minOrderValue, extraKmCharge, enableFreeDelivery, freeDeliveryMinOrder) => {
    const { deliveryZones } = get();
    const existingIndex = deliveryZones.findIndex(z => z.storeId === storeId);

    const updatedData = {
      mode,
      radiusKm,
      polygonCoordinates: polygonCoordinates || [],
      deliveryCharge: deliveryCharge !== undefined ? Number(deliveryCharge) : 30,
      minOrderValue: minOrderValue !== undefined ? Number(minOrderValue) : 200,
      extraKmCharge: extraKmCharge !== undefined ? Number(extraKmCharge) : 10,
      enableFreeDelivery: enableFreeDelivery !== undefined ? Boolean(enableFreeDelivery) : false,
      freeDeliveryMinOrder: freeDeliveryMinOrder !== undefined ? Number(freeDeliveryMinOrder) : 500
    };

    let newZones;
    if (existingIndex > -1) {
      newZones = deliveryZones.map(z => 
        z.storeId === storeId 
          ? { ...z, ...updatedData } 
          : z
      );
    } else {
      newZones = [...deliveryZones, { storeId, ...updatedData }];
    }

    set({ deliveryZones: newZones });
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('amigos_delivery_zones', JSON.stringify(newZones));
      }
    } catch (e) {
      console.error(e);
    }
  }
}));
