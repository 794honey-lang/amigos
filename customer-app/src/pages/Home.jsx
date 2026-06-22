import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronDown, Bell, Search, SlidersHorizontal, Plus, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@shared/store/cartStore';
import { useUiStore } from '@shared/store/uiStore';
import { useAuthStore } from '@shared/store/authStore';
import { menuService } from '@shared/services/menuService';
import { couponService } from '@shared/services/couponService';
import { storeService } from '@shared/services/storeService';
import { Card } from '@shared/components/ui/Card';
import { VegBadge } from '@shared/components/ui/VegBadge';

// Helper to calculate distance between coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Helper to check if user location coordinates are inside store delivery boundary
const isInsideStoreZone = (store, lat, lng) => {
  if (!store.deliveryZone) return false;
  const zone = typeof store.deliveryZone === 'string'
    ? JSON.parse(store.deliveryZone)
    : store.deliveryZone;
  
  if (!zone || !zone.mode) return false;
  
  const distanceKm = calculateDistance(store.lat, store.lng, lat, lng);
  
  if (zone.mode === 'radius') {
    return distanceKm <= (zone.radiusKm || 5);
  } else if (zone.mode === 'polygon') {
    if (zone.polygonCoordinates && zone.polygonCoordinates.length >= 3) {
      let isInside = false;
      const x = Number(lat);
      const y = Number(lng);
      
      const vs = zone.polygonCoordinates;
      for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = Number(vs[i].lat), yi = Number(vs[i].lng);
        const xj = Number(vs[j].lat), yj = Number(vs[j].lng);
        
        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) isInside = !isInside;
      }
      return isInside || distanceKm <= 1.5;
    }
    return distanceKm <= (zone.radiusKm || 5);
  }
  return false;
};

// Lucide icon helper
import * as LucideIcons from 'lucide-react';

const ResolveIcon = ({ name, className }) => {
  const IconComponent = LucideIcons[name] || LucideIcons.HelpCircle;
  return <IconComponent className={className} />;
};

import { mockBanners } from '@shared/mocks/mockBanners';

const MOCK_BANNERS = mockBanners;

export const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addItem, activeStore, setActiveStore } = useCartStore();
  const { addToast } = useUiStore();
  
  const [categories, setCategories] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const scrollContainerRef = useRef(null);

  // Load Home Screen Content & Resolve Store
  useEffect(() => {
    const loadHomeData = async () => {
      const storeRes = await storeService.getStores();
      let resolvedStore = null;
      let openStores = [];

      if (storeRes.success && Array.isArray(storeRes.data)) {
        openStores = storeRes.data.filter(s => s.status === 'Open');
      }

      const defaultAddress = user?.addresses?.[0];
      if (defaultAddress && defaultAddress.latitude && defaultAddress.longitude && openStores.length > 0) {
        const uLat = Number(defaultAddress.latitude);
        const uLng = Number(defaultAddress.longitude);

        const servingStores = openStores.filter(store => isInsideStoreZone(store, uLat, uLng));
        
        if (servingStores.length > 0) {
          servingStores.sort((a, b) => {
            const distA = calculateDistance(a.lat, a.lng, uLat, uLng);
            const distB = calculateDistance(b.lat, b.lng, uLat, uLng);
            return distA - distB;
          });
          resolvedStore = servingStores[0];
        } else {
          const sortedAllOpen = [...openStores].sort((a, b) => {
            const distA = calculateDistance(a.lat, a.lng, uLat, uLng);
            const distB = calculateDistance(b.lat, b.lng, uLat, uLng);
            return distA - distB;
          });
          resolvedStore = sortedAllOpen[0];
        }
      }

      if (!resolvedStore && openStores.length > 0) {
        resolvedStore = openStores.find(s => s.id === 'store_001') || openStores[0];
      }

      if (resolvedStore) {
        setActiveStore(resolvedStore);
      }

      const catRes = await menuService.getCategories();
      if (catRes.success) setCategories(catRes.data);

      const menuRes = await menuService.getMenuItems({ storeId: resolvedStore?.id });
      if (menuRes.success) {
        setBestsellers(menuRes.data.filter(item => item.isBestseller));
      }

      const coupRes = await couponService.getCoupons();
      if (coupRes.success) setCoupons(coupRes.data);
    };

    loadHomeData();
  }, [user]);

  // Auto scroll banners with swipe safety
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeBanner + 1) % MOCK_BANNERS.length;
      const container = scrollContainerRef.current;
      if (container) {
        const width = container.clientWidth;
        container.scrollTo({
          left: nextIndex * width,
          behavior: 'smooth'
        });
      }
      setActiveBanner(nextIndex);
    }, 4500);
    return () => clearInterval(interval);
  }, [activeBanner]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const scrollLeft = container.scrollLeft;
    const width = container.clientWidth;
    if (width <= 0) return;
    
    const newActiveIndex = Math.round(scrollLeft / width);
    if (newActiveIndex >= 0 && newActiveIndex < MOCK_BANNERS.length && newActiveIndex !== activeBanner) {
      setActiveBanner(newActiveIndex);
    }
  };

  const handleQuickAdd = (item, e) => {
    e.stopPropagation();
    
    // Add default configuration: Regular size, Classic crust, no toppings
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
  };

  const copyCouponCode = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    addToast(`Coupon "${code}" copied to clipboard!`, 'success');
  };

  return (
    <div className="flex-1 flex flex-col bg-bg">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => navigate('/profile')}>
          <MapPin className="w-5 h-5 text-brand" />
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-0.5">
              <span className="font-heading font-bold text-xs text-text-primary">
                {user?.addresses?.length > 0 
                  ? `${user.addresses[0].label} · ${activeStore?.name || 'Loading Store...'}`
                  : `Select Address · ${activeStore?.name || 'Loading Store...'}`}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-text-secondary" />
            </div>
            <span className="text-[9px] font-body text-text-muted truncate max-w-[200px]">
              {user?.addresses?.length > 0 
                ? `${user.addresses[0].line}, ${user.addresses[0].city}`
                : 'Please add delivery address in Profile.'}
            </span>
          </div>
        </div>

        <button className="relative p-1.5 hover:bg-stone-50 rounded-full text-text-secondary transition-colors">
          <Bell className="w-5.5 h-5.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand rounded-full border border-white" />
        </button>
      </header>

      {/* Main Scroll Container */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-6">
        
        {/* Search Bar Block */}
        <div className="px-4 pt-4">
          <div 
            onClick={() => navigate('/menu')}
            className="flex items-center gap-3 bg-white border border-stone-300 rounded-pill px-4 py-3 shadow-sm cursor-pointer hover:border-stone-400 transition-colors"
          >
            <Search className="w-5 h-5 text-text-muted" />
            <span className="text-text-muted text-sm font-body flex-1">
              Search for pizzas, sandwiches...
            </span>
            <SlidersHorizontal className="w-4.5 h-4.5 text-brand" />
          </div>
        </div>

        {/* Promo Carousel Banner */}
        <div className="px-4 relative">
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="w-full h-40 flex overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar gap-0 rounded-card"
          >
            {MOCK_BANNERS.map((banner) => (
              <div 
                key={banner.id}
                onClick={() => navigate(`/menu`)}
                className={`w-full h-full shrink-0 snap-center relative bg-gradient-to-r ${banner.bg} text-white p-5 flex items-center justify-between cursor-pointer rounded-card select-none`}
              >
                <div className="space-y-1.5 max-w-[60%] z-10 text-left">
                  <span className="bg-gold/25 text-gold border border-gold/40 text-[9px] font-heading font-bold rounded-pill px-2 py-0.5 tracking-wider uppercase">
                    Special Deal
                  </span>
                  <h3 className="font-heading font-bold text-base leading-tight">
                    {banner.title}
                  </h3>
                  <p className="text-xs text-white/80 font-body">
                    {banner.subtitle}
                  </p>
                  <div className="pt-1 flex items-center gap-1.5">
                    <span className="text-[10px] text-white/60 font-body">Use Code:</span>
                    <span className="font-heading font-extrabold text-xs text-gold tracking-wide">
                      {banner.code}
                    </span>
                  </div>
                </div>
                
                 <div className="w-[110px] h-[110px] rounded-full overflow-hidden shrink-0 border-2 border-white/20 shadow-lg relative">
                  <img 
                    src={banner.image} 
                    alt="banner promo" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Banner Dot Indicators */}
          <div className="absolute bottom-2.5 left-8 flex gap-1.5 z-20">
            {MOCK_BANNERS.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => {
                  const container = scrollContainerRef.current;
                  if (container) {
                    const width = container.clientWidth;
                    container.scrollTo({ left: idx * width, behavior: 'smooth' });
                  }
                  setActiveBanner(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeBanner === idx ? 'bg-white w-3' : 'bg-white/40 w-1.5'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Categories Horizontal Scroll */}
        <div className="space-y-2">
          <div className="px-4 flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-sm text-text-primary uppercase tracking-wide">
              Categories
            </h3>
            <button 
              onClick={() => navigate('/menu')}
              className="text-xs font-heading font-semibold text-brand hover:underline"
            >
              View All
            </button>
          </div>
          
          <div className="flex gap-3.5 overflow-x-auto no-scrollbar px-4 pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/menu?category=${cat.id}`)}
                className="flex flex-col items-center gap-1.5 shrink-0"
              >
                <div className="w-13 h-13 rounded-full bg-white border border-border shadow-sm flex items-center justify-center text-brand hover:bg-brand/5 active:scale-95 transition-all">
                  <ResolveIcon name={cat.icon} className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-heading font-semibold text-text-secondary whitespace-nowrap">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bestseller Section */}
        <div className="space-y-3">
          <div className="px-4 flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-sm text-text-primary uppercase tracking-wide">
              Bestsellers
            </h3>
            <button 
              onClick={() => navigate('/menu')}
              className="text-xs font-heading font-semibold text-brand hover:underline"
            >
              View All
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-2">
            {bestsellers.map((item) => (
              <Card 
                key={item.id} 
                onClick={() => navigate(`/menu/${item.id}`)}
                className="w-40 shrink-0 flex flex-col justify-between"
              >
                {/* Item Thumbnail */}
                <div className="h-28 relative">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover" 
                  />
                  {/* Bestseller Badge */}
                  <span className="absolute top-2 left-2 bg-gold text-dark text-[9px] font-heading font-extrabold rounded-pill px-1.5 py-0.5 shadow-sm">
                    ⭐ Bestseller
                  </span>
                  
                  {/* Veg indicator badge */}
                  <div className="absolute top-2 right-2 p-1 bg-white/95 rounded-sm shadow-sm flex items-center justify-center">
                    <VegBadge isVeg={item.isVeg} />
                  </div>
                </div>

                {/* Info & Price */}
                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-0.5">
                    <h4 className="font-heading font-bold text-xs leading-tight text-text-primary line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-[9px] text-text-secondary font-body leading-tight line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-1 mt-auto">
                    <span className="font-heading font-extrabold text-brand text-xs">
                      ₹{item.basePrice}
                    </span>
                    <button
                      onClick={(e) => handleQuickAdd(item, e)}
                      className="w-7 h-7 rounded-full bg-brand hover:bg-brand-accent text-white flex items-center justify-center shadow-sm active:scale-90 transition-transform focus:outline-none"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Offers Section */}
        <div className="space-y-3">
          <div className="px-4">
            <h3 className="font-heading font-extrabold text-sm text-text-primary uppercase tracking-wide">
              Offers For You
            </h3>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-2">
            {coupons.map((coupon) => (
              <div 
                key={coupon.code}
                onClick={(e) => copyCouponCode(coupon.code, e)}
                className="w-52 shrink-0 bg-white border border-dashed border-gold rounded-card p-3.5 shadow-sm flex flex-col justify-between gap-2.5 cursor-pointer hover:bg-amber-50/20 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                    <ResolveIcon name="Percent" className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-heading font-extrabold text-xs text-text-primary">
                      {coupon.code}
                    </h4>
                    <span className="text-[8px] font-heading font-semibold text-gold uppercase tracking-wider">
                      Click to copy
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-text-secondary font-body leading-normal">
                  {coupon.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
