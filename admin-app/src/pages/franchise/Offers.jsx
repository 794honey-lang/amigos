import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useStoreRegistry } from '../../store/storeRegistry';
import { AdminLayout } from '../../components/shared/AdminLayout';
import { Toggle } from '../../components/ui/Toggle';
import { promotionService } from '../../services/promotionService';
import { 
  Tag, Plus, Percent, Coins, Calendar, Info, CheckCircle 
} from 'lucide-react';

export const Offers = () => {
  const { scope } = useAuthStore();
  const { addToast } = useUiStore();
  const allStores = useStoreRegistry(state => state.stores);

  const activeFranchiseId = scope.franchiseId || 'fr_001';

  // States
  const [stores, setStores] = useState([]);
  const [promotions, setPromotions] = useState([]);
  
  // Promo Form States
  const [promoCode, setPromoCode] = useState('');
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoType, setPromoType] = useState('percentage');
  const [promoVal, setPromoVal] = useState(10);
  const [minOrder, setMinOrder] = useState(299);
  const [maxDiscount, setMaxDiscount] = useState(100);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Stores promotion overrides state (mock storage)
  const [promoOverrides, setPromoOverrides] = useState({});

  const loadData = async () => {
    const storesList = allStores.filter(s => s.franchiseId === activeFranchiseId);
    setStores(storesList);

    const promosRes = await promotionService.getPromotions({ franchiseId: activeFranchiseId });
    if (promosRes.success) {
      setPromotions(promosRes.data);
    }

    // Default overrides state: all national promos enabled for all stores
    const defaultOverrides = {};
    storesList.forEach(s => {
      defaultOverrides[s.id] = { AMIGOS20: true, FIESTA150: true };
    });
    setPromoOverrides(defaultOverrides);
  };

  useEffect(() => {
    loadData();
  }, [activeFranchiseId]);

  const handleTogglePromoForStore = (storeId, promoCodeVal) => {
    const currentVal = promoOverrides[storeId]?.[promoCodeVal] !== false;
    const newVal = !currentVal;

    setPromoOverrides(prev => ({
      ...prev,
      [storeId]: {
        ...prev[storeId],
        [promoCodeVal]: newVal
      }
    }));

    const storeName = stores.find(s => s.id === storeId)?.name || 'store';
    addToast(
      newVal ? `Enabled promotion ${promoCodeVal} for ${storeName}` : `Disabled promotion ${promoCodeVal} for ${storeName}`,
      newVal ? 'success' : 'warning'
    );
  };

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    if (!promoCode || !promoTitle || !promoDesc) {
      addToast('Please fill in code, title, and description.', 'error');
      return;
    }

    const newPromo = {
      code: promoCode.toUpperCase().replace(/\s+/g, ''),
      title: promoTitle,
      description: promoDesc,
      discountType: promoType,
      discountValue: parseInt(promoVal) || 0,
      minOrderValue: parseInt(minOrder) || 0,
      maxDiscount: parseInt(maxDiscount) || 0,
      startDate: startDate || '2026-06-21',
      endDate: endDate || '2026-07-31',
      scopeType: 'regional',
      scopeId: activeFranchiseId,
      isActive: true
    };

    const res = await promotionService.createPromotion(newPromo);
    if (res.success) {
      addToast(`Regional promotion ${newPromo.code} created successfully!`, 'success');
      
      // Reset Form
      setPromoCode('');
      setPromoTitle('');
      setPromoDesc('');
      setPromoVal(10);
      setMinOrder(299);
      setMaxDiscount(100);
      
      loadData(); // Reload list
    }
  };

  const nationalPromos = promotions.filter(p => p.scopeType === 'national');
  const regionalPromos = promotions.filter(p => p.scopeType === 'regional');

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-card border border-border shadow-sm">
          <h1 className="text-base font-heading font-extrabold text-text-primary">
            Local Offers & Promotions Manager
          </h1>
          <p className="text-[10px] font-body text-text-secondary mt-0.5">
            Configure national offer availability per outlet and draft regional discount campaigns
          </p>
        </div>

        {/* Dynamic Promotions split screen */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel: Active list and store override toggles (Spans 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* National Promo Overseer */}
            <div className="bg-white border border-border rounded-card p-5 shadow-sm space-y-4">
              <h3 className="font-heading font-extrabold text-sm text-text-primary uppercase tracking-wide border-b border-border pb-2.5 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-brand" />
                <span>National Offers Configuration</span>
              </h3>

              <div className="space-y-4">
                {nationalPromos.map(promo => (
                  <div key={promo.code} className="border border-border rounded-card p-4 bg-stone-50/50 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-gold/15 text-amber-800 border border-gold/25 text-[9px] font-heading font-extrabold px-2 py-0.5 rounded-pill tracking-wide">
                          NATIONAL POOL
                        </span>
                        <h4 className="font-heading font-extrabold text-xs text-text-primary mt-1">
                          {promo.code} — {promo.title}
                        </h4>
                        <p className="text-[10px] text-text-secondary font-body mt-0.5">
                          {promo.description}
                        </p>
                      </div>
                    </div>

                    {/* Stores Toggles checklist */}
                    <div className="border-t border-border/80 pt-3">
                      <span className="text-[9px] font-heading font-bold text-text-muted uppercase tracking-wider block mb-2">
                        Active Outlets checklist:
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {stores.map(store => {
                          const isEnabled = promoOverrides[store.id]?.[promo.code] !== false;
                          return (
                            <div key={store.id} className="flex items-center justify-between bg-white border border-border p-2 rounded-card">
                              <span className="font-heading font-semibold text-text-secondary truncate pr-2">
                                {store.name}
                              </span>
                              <Toggle 
                                checked={isEnabled} 
                                onChange={() => handleTogglePromoForStore(store.id, promo.code)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Regional Promos List */}
            <div className="bg-white border border-border rounded-card p-5 shadow-sm space-y-4">
              <h3 className="font-heading font-extrabold text-sm text-text-primary uppercase tracking-wide border-b border-border pb-2.5 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-gold" />
                <span>Regional Promotions</span>
              </h3>

              <div className="space-y-3 text-xs font-body">
                {regionalPromos.length > 0 ? (
                  regionalPromos.map(promo => (
                    <div key={promo.code} className="border border-border rounded-card p-3.5 flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-heading font-bold text-xs text-text-primary">{promo.code}</h4>
                        <p className="text-[10px] text-text-secondary">{promo.description}</p>
                        <p className="text-[9px] text-text-muted mt-0.5">Validity: {promo.startDate} to {promo.endDate}</p>
                      </div>
                      <span className="text-[10px] font-heading font-extrabold text-success bg-green-50 border border-success/15 px-2 py-0.5 rounded-pill">
                        ACTIVE REGIONAL
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-text-muted text-[11px] font-body flex items-center justify-center gap-1.5">
                    <Info className="w-4 h-4" />
                    <span>No regional promotions created yet.</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right panel: Regional promo creator form */}
          <div className="bg-white border border-border p-5 rounded-card shadow-sm flex flex-col justify-between gap-4 h-fit">
            <div className="space-y-1">
              <h3 className="font-heading font-extrabold text-sm text-text-primary uppercase tracking-wide border-b border-border pb-2.5 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-brand" />
                <span>Create Regional Promo</span>
              </h3>
              <p className="text-[10px] font-body text-text-secondary leading-relaxed">
                Draft a new promotion code. This coupon will only be redeemable at stores scoped to this franchise.
              </p>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Promo Code</label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="e.g. NORTH50"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Title</label>
                <input
                  type="text"
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  placeholder="e.g. Flat ₹50 discount"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Description</label>
                <input
                  type="text"
                  value={promoDesc}
                  onChange={(e) => setPromoDesc(e.target.value)}
                  placeholder="e.g. Save ₹50 on order above ₹300"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Discount Type</label>
                  <select
                    value={promoType}
                    onChange={(e) => setPromoType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-semibold bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Price (₹)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Value</label>
                  <input
                    type="number"
                    value={promoVal}
                    onChange={(e) => setPromoVal(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Min Order</label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={(e) => setMinOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Max Discount</label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-brand hover:bg-brand-accent text-white font-heading font-semibold rounded-pill text-xs shadow-md active:scale-95 transition-all cursor-pointer mt-3"
              >
                Create Coupon Offer
              </button>
            </form>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default Offers;
