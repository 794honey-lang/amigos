import { create } from 'zustand';
import { mockStores } from '@shared/mocks/mockStores';
import { mockStoreHours } from '../mocks/mockStoreHours';
import { mockDeliveryZones } from '../mocks/mockDeliveryZones';
import { mockFranchises } from '@shared/mocks/mockFranchises';

export const useStoreRegistry = create((set, get) => ({
  stores: [...mockStores],
  storeHours: [...mockStoreHours],
  deliveryZones: [...mockDeliveryZones],
  franchises: [...mockFranchises],

  addFranchise: (newFranchise) => {
    const { franchises } = get();
    const maxIdNum = franchises.reduce((max, f) => {
      const match = f.id.match(/^fr_(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    const nextId = `fr_${String(maxIdNum + 1).padStart(3, '0')}`;

    const franchiseWithId = {
      id: nextId,
      ...newFranchise
    };

    set({
      franchises: [...franchises, franchiseWithId]
    });
    return franchiseWithId;
  },

  updateFranchise: (id, updatedFields) => {
    set({
      franchises: get().franchises.map(f => f.id === id ? { ...f, ...updatedFields } : f)
    });
  },

  deleteFranchise: (id) => {
    const storesToDelete = get().stores.filter(s => s.franchiseId === id);
    const storeIdsToDelete = storesToDelete.map(s => s.id);

    set({
      franchises: get().franchises.filter(f => f.id !== id),
      stores: get().stores.filter(s => s.franchiseId !== id),
      storeHours: get().storeHours.filter(h => !storeIdsToDelete.includes(h.storeId)),
      deliveryZones: get().deliveryZones.filter(z => !storeIdsToDelete.includes(z.storeId))
    });
  },

  addStore: (newStore) => {
    const { stores, storeHours, deliveryZones } = get();
    
    // Generate new unique ID
    const maxIdNum = stores.reduce((max, store) => {
      const match = store.id.match(/^store_(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    const nextId = `store_${String(maxIdNum + 1).padStart(3, '0')}`;

    const storeWithId = {
      id: nextId,
      lat: 32.7266, // Default fallback coordinates
      lng: 74.8570,
      ...newStore
    };

    // Default regular hours for the new store (11 AM to 11 PM)
    const defaultHours = {
      storeId: nextId,
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

    // Default delivery zone
    const defaultZone = {
      storeId: nextId,
      mode: 'radius',
      radiusKm: 4,
      polygonCoordinates: []
    };

    set({
      stores: [...stores, storeWithId],
      storeHours: [...storeHours, defaultHours],
      deliveryZones: [...deliveryZones, defaultZone]
    });

    return storeWithId;
  },

  updateStore: (id, updatedFields) => {
    set({
      stores: get().stores.map(s => s.id === id ? { ...s, ...updatedFields } : s)
    });
  },

  deleteStore: (id) => {
    set({
      stores: get().stores.filter(s => s.id !== id),
      storeHours: get().storeHours.filter(h => h.storeId !== id),
      deliveryZones: get().deliveryZones.filter(z => z.storeId !== id)
    });
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
          // Avoid duplicate date closures
          const filtered = closures.filter(c => c.date !== closure.date);
          return { ...h, holidayClosures: [...filtered, closure] };
        }
        return h;
      })
    });
  },

  updateDeliveryZone: (storeId, mode, radiusKm, polygonCoordinates) => {
    const { deliveryZones } = get();
    const existingIndex = deliveryZones.findIndex(z => z.storeId === storeId);

    if (existingIndex > -1) {
      set({
        deliveryZones: deliveryZones.map(z => 
          z.storeId === storeId 
            ? { ...z, mode, radiusKm, polygonCoordinates: polygonCoordinates || z.polygonCoordinates } 
            : z
        )
      });
    } else {
      set({
        deliveryZones: [...deliveryZones, { storeId, mode, radiusKm, polygonCoordinates: polygonCoordinates || [] }]
      });
    }
  }
}));
