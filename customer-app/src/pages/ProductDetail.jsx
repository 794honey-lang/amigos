import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Heart, Star, ShoppingBag, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { menuService } from '@shared/services/menuService';
import { useCartStore } from '@shared/store/cartStore';
import { useAuthStore } from '@shared/store/authStore';
import { useUiStore } from '@shared/store/uiStore';
import { RadioCard } from '@shared/components/ui/RadioCard';
import { QuantityStepper } from '@shared/components/ui/QuantityStepper';
import { VegBadge } from '@shared/components/ui/VegBadge';
import { ToppingsBottomSheet } from '@shared/components/shared/ToppingsBottomSheet';

const CRUST_OPTIONS = [
  { id: 'classic', name: 'Classic', price: 0 },
  { id: 'cheese-burst', name: 'Cheese Burst', price: 80 },
  { id: 'stuffed-crust', name: 'Stuffed Crust', price: 100 }
];

export const ProductDetail = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { user, updateUser } = useAuthStore();
  const { addToast } = useUiStore();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState('medium'); // 'regular' | 'medium' | 'large'
  const [selectedCrust, setSelectedCrust] = useState('classic'); // option ID
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [toppingsSheetOpen, setToppingsSheetOpen] = useState(false);

  // Load item details
  useEffect(() => {
    const fetchItemDetails = async () => {
      setLoading(true);
      const res = await menuService.getMenuItem(itemId);
      if (res.success) {
        setItem(res.data);
        // Default size based on available prices
        if (res.data.prices) {
          const sizes = Object.keys(res.data.prices);
          if (sizes.includes('medium')) {
            setSelectedSize('medium');
          } else {
            setSelectedSize(sizes[0]);
          }
        }
      } else {
        addToast(res.error, 'error');
        navigate('/menu');
      }
      setLoading(false);
    };

    fetchItemDetails();
  }, [itemId, navigate]);

  if (loading || !item) {
    return (
      <div className="flex-1 bg-bg flex items-center justify-center min-h-[80vh]">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isPizza = item.category === 'veg-pizza' || item.category === 'non-veg-pizza';
  
  // Favourites toggle
  const isFavourite = user?.favourites?.includes(item.id) || false;
  
  const handleToggleFavourite = (e) => {
    e.stopPropagation();
    if (!user) {
      addToast('Please login to save favourites', 'error');
      return;
    }
    
    let updatedFavourites = [...(user.favourites || [])];
    if (isFavourite) {
      updatedFavourites = updatedFavourites.filter(id => id !== item.id);
      addToast('Removed from favourites', 'info');
    } else {
      updatedFavourites.push(item.id);
      addToast('Saved to favourites', 'success');
    }
    
    updateUser({ ...user, favourites: updatedFavourites });
  };

  // Prices calculation
  const basePrice = item.prices ? (item.prices[selectedSize] || item.basePrice) : item.basePrice;
  const crustPrice = isPizza ? (CRUST_OPTIONS.find(c => c.id === selectedCrust)?.price || 0) : 0;
  const toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);
  const singleItemTotal = basePrice + crustPrice + toppingsPrice;
  const liveTotal = singleItemTotal * qty;

  const handleAddToCart = () => {
    const crustName = isPizza ? CRUST_OPTIONS.find(c => c.id === selectedCrust)?.name : 'Classic';
    
    const composedItem = {
      menuId: item.id,
      name: item.name,
      size: isPizza ? selectedSize.charAt(0).toUpperCase() + selectedSize.slice(1) : 'Regular',
      crust: isPizza ? crustName : 'Classic',
      toppings: selectedToppings,
      price: basePrice,
      crustPrice,
      toppingsPrice,
      qty,
      isVeg: item.isVeg,
      image: item.image
    };

    addItem(composedItem);
    addToast(`${item.name} added to cart!`, 'success');
    navigate(-1); // Go back
  };

  return (
    <div className="flex-1 flex flex-col bg-white relative pb-28">
      {/* Hero Image Section */}
      <div className="h-64 relative bg-stone-100">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        
        {/* Floating Top Bar */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md text-text-primary transition-all active:scale-95"
          >
            <ChevronLeft className="w-5.5 h-5.5" />
          </button>
          
          <button
            onClick={handleToggleFavourite}
            className="w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md text-brand transition-all active:scale-95"
          >
            <Heart className={`w-5 h-5 ${isFavourite ? 'fill-brand text-brand' : 'text-brand'}`} />
          </button>
        </div>
      </div>

      {/* Item info block */}
      <div className="px-5 py-4 space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <VegBadge isVeg={item.isVeg} />
            <span className="font-heading font-semibold text-xs text-text-secondary uppercase tracking-wider">
              {item.category.replace('-', ' ')}
            </span>
          </div>
          
          <h2 className="font-heading font-extrabold text-xl text-text-primary leading-tight">
            {item.name}
          </h2>
          
          <div className="flex items-center gap-1.5 pt-0.5">
            <Star className="w-4 h-4 fill-gold text-gold" />
            <span className="font-heading font-bold text-xs text-text-primary mt-0.5">
              {item.rating || '4.5'}
            </span>
            <span className="text-[10px] text-text-muted font-body mt-0.5">
              ({item.reviews || '80'} reviews)
            </span>
          </div>
        </div>

        <p className="text-xs text-text-secondary font-body leading-relaxed bg-stone-50 border border-border p-3.5 rounded-card">
          {item.description}
        </p>

        {/* CUSTOMIZATION OPTIONS (PIZZAS ONLY) */}
        {isPizza && (
          <div className="space-y-6 pt-2">
            
            {/* Size selector */}
            <div className="space-y-3">
              <h3 className="font-heading font-bold text-sm text-text-primary">
                Choose Size
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <RadioCard
                  selected={selectedSize === 'regular'}
                  onClick={() => setSelectedSize('regular')}
                  title="Regular"
                  subtitle="4 Slices"
                  price={item.prices?.regular}
                />
                <RadioCard
                  selected={selectedSize === 'medium'}
                  onClick={() => setSelectedSize('medium')}
                  title="Medium"
                  subtitle="6 Slices"
                  price={item.prices?.medium}
                  badge="Popular"
                />
                <RadioCard
                  selected={selectedSize === 'large'}
                  onClick={() => setSelectedSize('large')}
                  title="Large"
                  subtitle="8 Slices"
                  price={item.prices?.large}
                />
              </div>
            </div>

            {/* Crust selector */}
            <div className="space-y-3">
              <h3 className="font-heading font-bold text-sm text-text-primary">
                Choose Crust
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {CRUST_OPTIONS.map(crust => {
                  const isSelected = selectedCrust === crust.id;
                  return (
                    <button
                      key={crust.id}
                      onClick={() => setSelectedCrust(crust.id)}
                      className={`px-4 py-2 text-xs font-heading font-semibold rounded-pill border transition-all ${
                        isSelected
                          ? 'bg-amber-50 border-gold text-gold shadow-sm'
                          : 'bg-white border-stone-200 text-text-secondary hover:bg-stone-50'
                      }`}
                    >
                      {crust.name} {crust.price > 0 && `(+₹${crust.price})`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Toppings Selector */}
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-sm text-text-primary">
                  Pizza Toppings
                </h3>
                <button
                  onClick={() => setToppingsSheetOpen(true)}
                  className="text-xs font-heading font-bold text-brand hover:underline"
                >
                  {selectedToppings.length > 0 ? 'Edit' : 'Add Toppings'}
                </button>
              </div>

              {selectedToppings.length > 0 ? (
                <div className="p-3 bg-stone-50 border border-border rounded-card flex flex-wrap gap-1.5">
                  {selectedToppings.map(t => (
                    <span 
                      key={t.id}
                      className="bg-white border border-stone-200 rounded-pill px-2.5 py-0.5 text-[10px] font-heading font-medium text-text-secondary"
                    >
                      {t.name} (+₹{t.price})
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-text-muted font-body leading-normal">
                  No extra toppings selected. Customize your pizza with delicious extra options!
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-border px-5 py-4 flex items-center justify-between z-40 shadow-2xl rounded-t-sheet">
        <div className="flex flex-col">
          <span className="text-[10px] font-body text-text-muted uppercase tracking-wider">
            Total Price
          </span>
          <span className="font-heading font-extrabold text-brand text-lg">
            ₹{liveTotal}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <QuantityStepper value={qty} onChange={setQty} />
          
          <button
            onClick={handleAddToCart}
            className="bg-brand hover:bg-brand-accent text-white font-heading font-semibold rounded-pill px-6 py-3.5 shadow-md hover:shadow-lg active:scale-95 transition-all text-sm whitespace-nowrap"
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Toppings Sheet overlay */}
      {isPizza && (
        <ToppingsBottomSheet
          isOpen={toppingsSheetOpen}
          onClose={() => setToppingsSheetOpen(false)}
          isVeg={item.isVeg}
          selectedToppings={selectedToppings}
          onApplyToppings={setSelectedToppings}
        />
      )}
    </div>
  );
};

export default ProductDetail;
