import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useScopeStore } from '../../store/scopeStore';
import { useUiStore } from '../../store/uiStore';
import { AdminLayout } from '../../components/shared/AdminLayout';
import { Toggle } from '../../components/ui/Toggle';
import { menuService } from '../../services/menuService';
import { Search, ToggleLeft, ToggleRight, Sparkles, AlertCircle } from 'lucide-react';

export const Inventory = () => {
  const { scope } = useAuthStore();
  const { currentStoreId } = useScopeStore();
  const { addToast } = useUiStore();

  const activeStoreId = currentStoreId || scope.storeId || 'store_001';

  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { key: 'all', label: 'All Items' },
    { key: 'veg-pizza', label: 'Veg Pizza' },
    { key: 'non-veg-pizza', label: 'Non-Veg' },
    { key: 'sandwiches', label: 'Sandwiches' },
    { key: 'combos', label: 'Combos' },
    { key: 'desserts', label: 'Desserts' },
    { key: 'drinks', label: 'Drinks' }
  ];

  const loadMenu = async () => {
    const res = await menuService.getMenuItems({ storeId: activeStoreId });
    if (res.success) {
      setMenuItems(res.data);
    }
  };

  useEffect(() => {
    loadMenu();
  }, [activeStoreId]);

  // Optimistic UI Toggle
  const handleToggleAvailability = async (itemId, currentVal) => {
    const newVal = !currentVal;
    
    // 1. Update state immediately (optimistic UI)
    setMenuItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, isAvailable: newVal };
      }
      return item;
    }));
    
    addToast(
      newVal ? `Item is now marked as Available` : `Item is now marked as Out of Stock`,
      newVal ? 'success' : 'warning'
    );

    // 2. Call service in background
    const res = await menuService.toggleStoreAvailability(activeStoreId, itemId, newVal);
    if (!res.success) {
      // Revert state on failure
      setMenuItems(prev => prev.map(item => {
        if (item.id === itemId) {
          return { ...item, isAvailable: currentVal };
        }
        return item;
      }));
      addToast('Failed to update availability. Reverting change.', 'error');
    }
  };

  // Bulk Category Out of Stock Action
  const handleBulkDeactivate = async () => {
    if (selectedCategory === 'all') {
      addToast('Please select a specific category first.', 'error');
      return;
    }

    const categoryLabel = categories.find(c => c.key === selectedCategory)?.label;
    if (window.confirm(`Are you sure you want to mark ALL ${categoryLabel} items as OUT OF STOCK?`)) {
      const itemsToDeactivate = menuItems.filter(item => item.category === selectedCategory && item.isAvailable);
      
      if (itemsToDeactivate.length === 0) {
        addToast(`No active items found in ${categoryLabel}`, 'warning');
        return;
      }

      // Optimistic UI update
      setMenuItems(prev => prev.map(item => {
        if (item.category === selectedCategory) {
          return { ...item, isAvailable: false };
        }
        return item;
      }));
      addToast(`Category ${categoryLabel} marked out of stock.`, 'success');

      // Call services
      for (const item of itemsToDeactivate) {
        await menuService.toggleStoreAvailability(activeStoreId, item.id, false);
      }
      loadMenu(); // reload to sync
    }
  };

  // Filtering
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-card border border-border shadow-sm">
          <div>
            <h1 className="text-base font-heading font-extrabold text-text-primary">
              Inventory & Availability
            </h1>
            <p className="text-[10px] font-body text-text-secondary mt-0.5">
              Mark ingredients or items out of stock instantly to prevent customer orders
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDeactivate}
              disabled={selectedCategory === 'all'}
              className="px-4 py-2 border border-danger/25 hover:bg-red-50 text-danger font-heading font-semibold rounded-pill text-xs disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Bulk Disable Category
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-border p-4 rounded-card shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative w-full md:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                <Search className="w-4.5 h-4.5" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search menu items..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body bg-stone-50/50"
              />
            </div>

            {/* Category selection scroll */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar w-full py-0.5">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-pill text-xs font-heading font-semibold border transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat.key
                      ? 'bg-brand text-white border-brand shadow-sm'
                      : 'bg-stone-50 border-stone-200 text-text-secondary hover:bg-stone-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Inventory Item Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className={`p-4 border rounded-card shadow-sm flex gap-4 transition-all duration-200 bg-white ${
                item.isAvailable 
                  ? 'border-border' 
                  : 'border-danger/10 bg-red-50/5 opacity-80'
              }`}
            >
              {/* Item Thumbnail */}
              <div className="w-16 h-16 rounded-card overflow-hidden shrink-0 border border-border relative">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className={`w-full h-full object-cover ${!item.isAvailable && 'grayscale'}`}
                />
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-brand text-white text-[8px] font-heading font-bold px-1 py-0.5 rounded-sm uppercase tracking-wide">
                      OOS
                    </span>
                  </div>
                )}
              </div>

              {/* Detail Info & Toggle */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.isVeg !== false ? 'bg-success' : 'bg-danger'}`} />
                    <h4 className="font-heading font-bold text-xs text-text-primary truncate">
                      {item.name}
                    </h4>
                  </div>
                  <p className="text-[10px] text-text-secondary font-body line-clamp-1">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-heading font-extrabold text-xs text-text-primary">
                    ₹{item.basePrice}
                  </span>
                  
                  {/* Instant Toggle Control */}
                  <Toggle 
                    checked={item.isAvailable} 
                    onChange={() => handleToggleAvailability(item.id, item.isAvailable)}
                  />
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full py-16 bg-white border border-border rounded-card text-center flex flex-col items-center justify-center gap-3 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-stone-50 border border-border flex items-center justify-center text-text-muted">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-heading font-bold text-xs text-text-primary">No items matches query</h4>
                <p className="text-[11px] font-body text-text-secondary">Try adjusting the search query or category filters.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Inventory;
