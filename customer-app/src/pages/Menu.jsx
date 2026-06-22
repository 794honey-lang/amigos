import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { menuService } from '@shared/services/menuService';
import { useUiStore } from '@shared/store/uiStore';
import { useCartStore } from '@shared/store/cartStore';
import { Card } from '@shared/components/ui/Card';
import { VegBadge } from '@shared/components/ui/VegBadge';
import { Button } from '@shared/components/ui/Button';

export const Menu = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useUiStore();
  const { addItem, activeStore } = useCartStore();

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Read category parameter from search URL
  const categoryParam = searchParams.get('category');

  // Load Categories & Items
  useEffect(() => {
    const fetchMenuData = async () => {
      setLoading(true);
      const catRes = await menuService.getCategories();
      if (catRes.success) {
        setCategories(catRes.data);
        // Default active category
        const initialCategory = categoryParam || catRes.data[0]?.id || '';
        setActiveCategory(initialCategory);
      }
      setLoading(false);
    };
    fetchMenuData();
  }, [categoryParam]);

  // Load Items on category, search query, or active store change
  useEffect(() => {
    const fetchItems = async () => {
      if (!activeCategory) return;
      const res = await menuService.getMenuItems({
        category: activeCategory,
        search: searchQuery,
        storeId: activeStore?.id
      });
      if (res.success) {
        setItems(res.data);
      }
    };
    fetchItems();
  }, [activeCategory, searchQuery, activeStore]);

  const handleTabChange = (categoryId) => {
    setActiveCategory(categoryId);
    setSearchParams({ category: categoryId });
  };

  return (
    <div className="flex-1 flex flex-col bg-bg">
      {/* Sticky Header & Search Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-border shadow-sm">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/home')}
            className="p-1.5 hover:bg-stone-50 rounded-full text-text-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex-1 relative flex items-center">
            <Search className="w-4.5 h-4.5 absolute left-3.5 text-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search for pizzas, combos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-pill pl-10 pr-4 py-2 text-sm font-body text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all"
            />
          </div>
          
          <button className="p-2 hover:bg-stone-50 rounded-full text-brand transition-colors">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-2.5">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleTabChange(cat.id)}
                className={`px-4 py-1.5 text-xs font-heading font-semibold rounded-pill border whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand border-brand text-white shadow-sm'
                    : 'bg-stone-50 border-stone-200 text-text-secondary hover:bg-stone-100'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable menu catalog */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Category Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-extrabold text-sm text-gold uppercase tracking-wider">
            {categories.find(c => c.id === activeCategory)?.name || 'Menu'}
          </h3>
          <span className="text-[10px] font-body text-text-muted">
            {items.length} {items.length === 1 ? 'item' : 'items'} found
          </span>
        </div>

        {/* Loading / Empty States */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 bg-stone-200/50 animate-pulse rounded-card" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-brand/5 flex items-center justify-center text-text-muted">
              <Search className="w-8 h-8" />
            </div>
            <h4 className="font-heading font-bold text-sm text-text-primary">No items found</h4>
            <p className="font-body text-xs text-text-secondary max-w-[200px]">
              We couldn't find anything matching your search query. Try another term!
            </p>
          </div>
        ) : (
          /* Item List */
          <div className="space-y-4">
            {items.map((item) => (
              <Card
                key={item.id}
                onClick={() => navigate(`/menu/${item.id}`)}
                className="p-3.5 flex items-center justify-between gap-4"
              >
                {/* Info Column */}
                <div className="flex-1 flex flex-col justify-between self-stretch min-w-0">
                  <div>
                    {/* Badge row */}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <VegBadge isVeg={item.isVeg} />
                      {item.isBestseller && (
                        <span className="bg-gold/15 text-gold text-[8px] font-heading font-extrabold rounded-pill px-1.5 py-0.2 uppercase border border-gold/25">
                          Bestseller
                        </span>
                      )}
                    </div>
                    
                    <h4 className="font-heading font-bold text-sm text-text-primary truncate">
                      {item.name}
                    </h4>
                    
                    <p className="text-[10px] text-text-secondary font-body mt-1 leading-normal line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Price & Action Row */}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[10px] font-body text-text-muted">Starts at</span>
                    <span className="font-heading font-extrabold text-brand text-sm">
                      ₹{item.basePrice}
                    </span>
                  </div>
                </div>

                {/* Thumbnail & Button Column */}
                <div className="flex flex-col items-center shrink-0 relative">
                  <div className="w-20 h-20 rounded-card overflow-hidden border border-border bg-stone-50">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Customize / ADD button */}
                  {item.customizable ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/menu/${item.id}`);
                      }}
                      className="absolute -bottom-2 px-3 py-1 bg-white hover:bg-green-50 border border-success text-success text-[10px] font-heading font-extrabold rounded-pill shadow-md transition-all active:scale-95 uppercase tracking-wider"
                    >
                      Customize
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const defaultItem = {
                          menuId: item.id,
                          name: item.name,
                          size: 'Regular',
                          crust: 'Classic',
                          toppings: [],
                          price: item.basePrice,
                          crustPrice: 0,
                          toppingsPrice: 0,
                          qty: 1,
                          isVeg: item.isVeg,
                          image: item.image
                        };
                        addItem(defaultItem);
                        addToast(`${item.name} added to cart!`, 'success');
                      }}
                      className="absolute -bottom-2 px-4 py-1 bg-white hover:bg-green-50 border border-success text-success text-[10px] font-heading font-extrabold rounded-pill shadow-md transition-all active:scale-95 uppercase tracking-wider"
                    >
                      Add
                    </button>
                  )}
                  {/* Wait, let's make a beautiful button that works for both customizable and non-customizable! */}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
