import { mockMenuItems } from '../mocks/mockMenuItems';
import { mockCategories } from '../mocks/mockCategories';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const menuService = {
  async getCategories() {
    await delay(200);
    return { success: true, data: mockCategories };
  },

  async getMenuItems({ category, isVeg, search } = {}) {
    await delay(300);
    let items = [...mockMenuItems];
    
    // Check local storage for restaurant-level availability overrides
    try {
      const storedAvailability = localStorage.getItem('amigos_menu_availability');
      if (storedAvailability) {
        const availabilityMap = JSON.parse(storedAvailability);
        items = items.map(item => {
          if (item.id in availabilityMap) {
            return { ...item, available: availabilityMap[item.id] };
          }
          return { ...item, available: true }; // default to available
        });
      } else {
        items = items.map(item => ({ ...item, available: true }));
      }
    } catch (e) {
      items = items.map(item => ({ ...item, available: true }));
    }

    if (category) {
      items = items.filter(item => item.category === category);
    }
    
    if (isVeg !== undefined && isVeg !== null) {
      items = items.filter(item => item.isVeg === isVeg);
    }
    
    if (search) {
      const query = search.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
      );
    }
    
    return { success: true, data: items };
  },

  async getMenuItem(id) {
    await delay(200);
    const items = [...mockMenuItems];
    
    // Map availability
    let available = true;
    try {
      const storedAvailability = localStorage.getItem('amigos_menu_availability');
      if (storedAvailability) {
        const availabilityMap = JSON.parse(storedAvailability);
        if (id in availabilityMap) {
          available = availabilityMap[id];
        }
      }
    } catch (e) {}

    const item = items.find(i => i.id === id);
    if (!item) {
      return { success: false, error: 'Item not found' };
    }
    
    return { success: true, data: { ...item, available } };
  },

  async updateItemAvailability(id, available) {
    await delay(200);
    try {
      const storedAvailability = localStorage.getItem('amigos_menu_availability') || '{}';
      const availabilityMap = JSON.parse(storedAvailability);
      availabilityMap[id] = available;
      localStorage.setItem('amigos_menu_availability', JSON.stringify(availabilityMap));
      return { success: true, data: { id, available } };
    } catch (e) {
      return { success: false, error: 'Failed to update availability' };
    }
  }
};
