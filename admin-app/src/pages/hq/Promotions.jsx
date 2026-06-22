import React, { useEffect, useState } from 'react';
import { useUiStore } from '../../store/uiStore';
import { useStoreRegistry } from '../../store/storeRegistry';
import { AdminLayout } from '../../components/shared/AdminLayout';
import { Toggle } from '../../components/ui/Toggle';
import { Modal } from '../../components/ui/Modal';
import { promotionService } from '../../services/promotionService';
import { 
  Tag, Plus, Percent, Coins, Calendar, Info, CheckCircle, 
  MapPin, Building2, Store, Sparkles, Edit3, Trash2
} from 'lucide-react';

export const Promotions = () => {
  const { addToast } = useUiStore();
  const { stores, franchises } = useStoreRegistry();

  // States
  const [promotions, setPromotions] = useState([]);
  const [promoOverrides, setPromoOverrides] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedPromos, setExpandedPromos] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);

  // Edit form states
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editType, setEditType] = useState('percentage');
  const [editVal, setEditVal] = useState(0);
  const [editMinOrder, setEditMinOrder] = useState(0);
  const [editMaxDiscount, setEditMaxDiscount] = useState(0);
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');

  const togglePromoExpanded = (code) => {
    setExpandedPromos(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  const handleEditPromoClick = (promo) => {
    setEditingPromo(promo);
    setEditTitle(promo.title);
    setEditDesc(promo.description);
    setEditType(promo.discountType);
    setEditVal(promo.discountValue);
    setEditMinOrder(promo.minOrderValue);
    setEditMaxDiscount(promo.maxDiscount);
    setEditStartDate(promo.startDate);
    setEditEndDate(promo.endDate);
    setIsEditModalOpen(true);
  };

  const handleUpdatePromoSubmit = async (e) => {
    e.preventDefault();
    if (!editTitle || !editDesc) {
      addToast('Please enter title and description', 'error');
      return;
    }

    const payload = {
      title: editTitle,
      description: editDesc,
      discountType: editType,
      discountValue: Number(editVal) || 0,
      minOrderValue: Number(editMinOrder) || 0,
      maxDiscount: Number(editMaxDiscount) || 0,
      startDate: editStartDate,
      endDate: editEndDate,
      scopeType: editingPromo.scopeType,
      scopeId: editingPromo.scopeId,
      isActive: editingPromo.isActive
    };

    const res = await promotionService.updatePromotion(editingPromo.code, payload);
    if (res.success) {
      addToast(`Brand coupon ${editingPromo.code} updated successfully!`, 'success');
      setIsEditModalOpen(false);
      resetForm();
      loadData();
    } else {
      addToast(res.error || 'Failed to update brand coupon', 'error');
    }
  };

  const handleDeletePromoClick = async (code) => {
    if (window.confirm(`Are you sure you want to permanently delete the brand coupon "${code}"?`)) {
      const res = await promotionService.deletePromotion(code);
      if (res.success) {
        addToast(`Brand coupon "${code}" deleted successfully.`, 'warning');
        loadData();
      } else {
        addToast(res.error || 'Failed to delete brand coupon', 'error');
      }
    }
  };

  const resetForm = () => {
    setPromoCode('');
    setPromoTitle('');
    setPromoDesc('');
    setPromoVal(10);
    setMinOrder(299);
    setMaxDiscount(100);
    setInitialScopeAll(true);
    setEditingPromo(null);
  };

  // Promo Form States
  const [promoCode, setPromoCode] = useState('');
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoType, setPromoType] = useState('percentage');
  const [promoVal, setPromoVal] = useState(10);
  const [minOrder, setMinOrder] = useState(299);
  const [maxDiscount, setMaxDiscount] = useState(100);
  const [startDate, setStartDate] = useState('2026-06-21');
  const [endDate, setEndDate] = useState('2026-08-31');

  // Targeting States
  const [initialScopeAll, setInitialScopeAll] = useState(true);
  const [selectedStores, setSelectedStores] = useState({});

  useEffect(() => {
    if (stores && stores.length > 0) {
      const initial = {};
      stores.forEach(s => {
        initial[s.id] = true;
      });
      setSelectedStores(initial);
    }
  }, [stores]);

  const handleToggleStoreSelection = (storeId) => {
    setSelectedStores(prev => ({
      ...prev,
      [storeId]: !prev[storeId]
    }));
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const promosRes = await promotionService.getPromotions();
      if (promosRes.success) {
        setPromotions(promosRes.data);
      }
      
      const overridesRes = await promotionService.getStorePromoOverrides();
      if (overridesRes.success) {
        setPromoOverrides(overridesRes.data);
      }
    } catch (e) {
      addToast('Failed to load promotions registry data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePromoForStore = async (storeId, promoCodeVal) => {
    // If not set or undefined, it defaults to true (enabled)
    const currentVal = promoOverrides[storeId]?.[promoCodeVal] !== false;
    const newVal = !currentVal;

    // Optimistic UI update
    setPromoOverrides(prev => ({
      ...prev,
      [storeId]: {
        ...prev[storeId],
        [promoCodeVal]: newVal
      }
    }));

    try {
      await promotionService.updateStorePromoOverride(storeId, promoCodeVal, newVal);
      const storeName = stores.find(s => s.id === storeId)?.name || 'Store';
      addToast(
        newVal 
          ? `Enabled promo ${promoCodeVal} for ${storeName}` 
          : `Disabled promo ${promoCodeVal} for ${storeName}`,
        newVal ? 'success' : 'warning'
      );
    } catch (error) {
      // Revert state
      loadData();
      addToast('Failed to save promotion settings', 'error');
    }
  };

  const handleBulkToggleForFranchise = async (franchiseId, promoCodeVal, isEnabled) => {
    const franchiseStores = stores.filter(s => s.franchiseId === franchiseId);
    const storeIds = franchiseStores.map(s => s.id);
    if (storeIds.length === 0) return;

    // Optimistic UI update
    setPromoOverrides(prev => {
      const updated = { ...prev };
      storeIds.forEach(id => {
        if (!updated[id]) updated[id] = {};
        updated[id][promoCodeVal] = isEnabled;
      });
      return updated;
    });

    try {
      await promotionService.bulkUpdateStorePromoOverrides(storeIds, promoCodeVal, isEnabled);
      const franchiseName = franchises.find(f => f.id === franchiseId)?.name || 'Franchise';
      addToast(
        isEnabled 
          ? `Enabled ${promoCodeVal} for all stores in ${franchiseName}` 
          : `Disabled ${promoCodeVal} for all stores in ${franchiseName}`,
        isEnabled ? 'success' : 'warning'
      );
    } catch (error) {
      loadData();
      addToast('Failed to execute bulk update', 'error');
    }
  };

  const handleGlobalToggle = async (promoCodeVal, isEnabled) => {
    const storeIds = stores.map(s => s.id);
    if (storeIds.length === 0) return;

    // Optimistic UI update
    setPromoOverrides(prev => {
      const updated = { ...prev };
      storeIds.forEach(id => {
        if (!updated[id]) updated[id] = {};
        updated[id][promoCodeVal] = isEnabled;
      });
      return updated;
    });

    try {
      await promotionService.bulkUpdateStorePromoOverrides(storeIds, promoCodeVal, isEnabled);
      addToast(
        isEnabled 
          ? `Enabled ${promoCodeVal} globally for all active outlets` 
          : `Disabled ${promoCodeVal} globally for all active outlets`,
        isEnabled ? 'success' : 'warning'
      );
    } catch (error) {
      loadData();
      addToast('Failed to execute global bulk update', 'error');
    }
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
      startDate: startDate,
      endDate: endDate,
      scopeType: 'national',
      scopeId: null,
      isActive: true
    };

    const res = await promotionService.createPromotion(newPromo);
    if (res.success) {
      // Configure overrides for specific store targeting
      if (!initialScopeAll) {
        const storeIdsToDisable = stores.filter(s => !selectedStores[s.id]).map(s => s.id);
        const storeIdsToEnable = stores.filter(s => selectedStores[s.id]).map(s => s.id);
        
        if (storeIdsToDisable.length > 0) {
          await promotionService.bulkUpdateStorePromoOverrides(storeIdsToDisable, newPromo.code, false);
        }
        if (storeIdsToEnable.length > 0) {
          await promotionService.bulkUpdateStorePromoOverrides(storeIdsToEnable, newPromo.code, true);
        }
      }

      addToast(`National promotion ${newPromo.code} created successfully!`, 'success');
      
      // Reset Form
      setPromoCode('');
      setPromoTitle('');
      setPromoDesc('');
      setPromoVal(10);
      setMinOrder(299);
      setMaxDiscount(100);
      setInitialScopeAll(true);
      
      const resetSelection = {};
      stores.forEach(s => {
        resetSelection[s.id] = true;
      });
      setSelectedStores(resetSelection);
      
      loadData(); // Reload list
    }
  };

  const nationalPromos = promotions.filter(p => p.scopeType === 'national');

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-card border border-border shadow-sm flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
          <div>
            <h1 className="text-base font-heading font-extrabold text-text-primary">
              National Promos Manager
            </h1>
            <p className="text-[10px] font-body text-text-secondary mt-0.5">
              Draft brand-wide promo coupons and target active store networks by franchise grouping
            </p>
          </div>
          <div className="bg-brand/5 border border-brand/10 px-3 py-1.5 rounded-card flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span className="text-[10px] font-heading font-extrabold text-brand uppercase">Corporate HQ Mode</span>
          </div>
        </div>

        {/* Promotions layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel: Active list and store override toggles (Spans 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* National Promo Overseer */}
            <div className="bg-white border border-border rounded-card p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-border pb-2.5">
                <h3 className="font-heading font-extrabold text-sm text-text-primary uppercase tracking-wide flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-brand" />
                  <span>Active Brand Coupons</span>
                </h3>
                <span className="text-[10px] font-heading font-bold text-text-secondary bg-stone-100 px-2.5 py-0.5 rounded-pill">
                  {nationalPromos.length} Coupons
                </span>
              </div>

              {isLoading ? (
                <div className="py-8 text-center text-text-secondary text-xs">Loading promotions pool...</div>
              ) : nationalPromos.length > 0 ? (
                <div className="space-y-6">
                  {nationalPromos.map(promo => {
                    const activeStoresList = stores.filter(s => promoOverrides[s.id]?.[promo.code] !== false);
                    const isAllActive = activeStoresList.length === stores.length;
                    const isNoneActive = activeStoresList.length === 0;
                    const isExpanded = expandedPromos[promo.code] === true;

                    return (
                      <div key={promo.code} className="border border-border rounded-card p-4 bg-stone-50/50 space-y-4">
                        {/* Promo Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-card border border-stone-200">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="bg-gold/15 text-amber-800 border border-gold/25 text-[9px] font-heading font-extrabold px-2 py-0.5 rounded-pill tracking-wide uppercase">
                                {promo.code}
                              </span>
                              <span className="text-[10px] font-heading font-bold text-text-primary">
                                {promo.title}
                              </span>
                            </div>
                            <p className="text-[10px] text-text-secondary font-body mt-1">
                              {promo.description}
                            </p>
                            <div className="flex gap-4 text-[9px] text-text-muted font-body mt-1">
                              <span>Min Order: ₹{promo.minOrderValue}</span>
                              {promo.discountType === 'percentage' && <span>Max Cap: ₹{promo.maxDiscount}</span>}
                              <span>Val: {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `₹${promo.discountValue}`}</span>
                            </div>
                            
                            {/* Active Scope Summary */}
                            <div className="mt-2.5 text-[9.5px] font-body text-text-secondary flex flex-wrap items-center gap-1.5 bg-stone-50 p-2 rounded-card border border-stone-150">
                              <span className="font-heading font-extrabold uppercase text-[8px] text-text-muted">Active Scope:</span>
                              {isAllActive ? (
                                <span className="text-success font-heading font-bold bg-green-50 border border-success/15 px-2 py-0.5 rounded-pill uppercase text-[8px]">All Outlets</span>
                              ) : isNoneActive ? (
                                <span className="text-danger font-heading font-bold bg-red-50 border border-danger/15 px-2 py-0.5 rounded-pill uppercase text-[8px]">None (Globally Paused)</span>
                              ) : (
                                <div className="flex flex-wrap gap-1">
                                  {activeStoresList.map(s => (
                                    <span key={s.id} className="text-amber-800 font-heading font-bold bg-amber-50 border border-gold/15 px-1.5 py-0.5 rounded text-[8px]">
                                      {s.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-1.5 sm:self-center shrink-0">
                            <button
                              onClick={() => togglePromoExpanded(promo.code)}
                              className={`px-2.5 py-1 text-[9px] font-heading font-bold border rounded-card transition-colors cursor-pointer ${
                                isExpanded 
                                  ? 'bg-brand text-white border-brand' 
                                  : 'bg-white text-text-primary border-stone-300 hover:bg-stone-50'
                              }`}
                            >
                              {isExpanded ? 'Hide Scope' : 'View/Manage Scope'}
                            </button>
                            <button
                              onClick={() => handleGlobalToggle(promo.code, true)}
                              className="px-2.5 py-1 text-[9px] font-heading font-bold text-success border border-success/20 hover:bg-success/5 bg-white rounded-card transition-colors cursor-pointer"
                            >
                              Enable All
                            </button>
                            <button
                              onClick={() => handleGlobalToggle(promo.code, false)}
                              className="px-2.5 py-1 text-[9px] font-heading font-bold text-danger border border-danger/20 hover:bg-red-50 bg-white rounded-card transition-colors cursor-pointer"
                            >
                              Disable All
                            </button>
                            <button
                              onClick={() => handleEditPromoClick(promo)}
                              className="px-2.5 py-1 text-[9px] font-heading font-bold text-text-secondary border border-stone-300 hover:bg-stone-100 bg-white rounded-card transition-colors cursor-pointer flex items-center gap-0.5"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeletePromoClick(promo.code)}
                              className="px-2.5 py-1 text-[9px] font-heading font-bold text-danger border border-danger/20 hover:bg-red-50 bg-white rounded-card transition-colors cursor-pointer flex items-center gap-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>

                        {/* Expandable Grouped Target Checklist */}
                        {isExpanded && (
                          <div className="space-y-3 border-t border-stone-200/60 pt-4 animate-fadeIn">
                            <span className="text-[9px] font-heading font-bold text-text-muted uppercase tracking-wider block">
                              Configure Target Scope (Grouped by Franchise):
                            </span>
                            
                            <div className="space-y-4">
                              {franchises.map(franchise => {
                                const franchiseStores = stores.filter(s => s.franchiseId === franchise.id);
                                
                                return (
                                  <div key={franchise.id} className="border border-stone-200 rounded-card bg-white p-3 space-y-2">
                                    {/* Franchise Header Toggle */}
                                    <div className="flex justify-between items-center border-b border-stone-100 pb-1.5">
                                      <span className="font-heading font-bold text-[11px] text-text-primary flex items-center gap-1">
                                        <Building2 className="w-3.5 h-3.5 text-brand shrink-0" />
                                        <span>{franchise.name}</span>
                                      </span>
                                      
                                      {franchiseStores.length > 0 && (
                                        <div className="flex gap-2">
                                          <button
                                            type="button"
                                            onClick={() => handleBulkToggleForFranchise(franchise.id, promo.code, true)}
                                            className="text-[8px] font-heading font-bold text-brand hover:underline cursor-pointer"
                                          >
                                            Enable Franchise
                                          </button>
                                          <span className="text-[8px] text-text-muted">|</span>
                                          <button
                                            type="button"
                                            onClick={() => handleBulkToggleForFranchise(franchise.id, promo.code, false)}
                                            className="text-[8px] font-heading font-bold text-text-secondary hover:underline cursor-pointer"
                                          >
                                            Disable Franchise
                                          </button>
                                        </div>
                                      )}
                                    </div>

                                    {/* Stores list */}
                                    {franchiseStores.length > 0 ? (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                        {franchiseStores.map(store => {
                                          const isEnabled = promoOverrides[store.id]?.[promo.code] !== false;
                                          return (
                                            <div key={store.id} className="flex items-center justify-between border border-stone-100 p-2 rounded-card bg-stone-50/30">
                                              <span className="font-heading font-semibold text-text-secondary text-[11px] truncate pr-2 flex items-center gap-1">
                                                <Store className="w-3 h-3 text-gold shrink-0" />
                                                <span>{store.name}</span>
                                              </span>
                                              <Toggle 
                                                checked={isEnabled} 
                                                onChange={() => handleTogglePromoForStore(store.id, promo.code)}
                                              />
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <span className="text-[9px] text-text-muted font-body italic block pl-1">
                                        No active stores registered under this franchise group.
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-text-muted text-[11px] font-body flex flex-col items-center justify-center gap-2 border border-dashed border-stone-200 rounded-card">
                  <Info className="w-5 h-5 text-brand/60" />
                  <span>No national promo codes exist. Use the builder on the right to draft a coupon!</span>
                </div>
              )}
            </div>

          </div>

          {/* Right panel: Brand promo creator form */}
          <div className="bg-white border border-border p-5 rounded-card shadow-sm flex flex-col justify-between gap-4 h-fit">
            <div className="space-y-1">
              <h3 className="font-heading font-extrabold text-sm text-text-primary uppercase tracking-wide border-b border-border pb-2.5 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-brand" />
                <span>Draft Brand Promo</span>
              </h3>
              <p className="text-[10px] font-body text-text-secondary leading-relaxed">
                Draft a brand-wide national coupon offer. Once created, you can customize scope overrides to exclude or target specific stores.
              </p>
            </div>

            <form onSubmit={handleCreatePromo} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Promo Code</label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="e.g. AMIGOS50"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Title</label>
                <input
                  type="text"
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  placeholder="e.g. Flat 50% discount"
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Description</label>
                <input
                  type="text"
                  value={promoDesc}
                  onChange={(e) => setPromoDesc(e.target.value)}
                  placeholder="e.g. Save 50% up to ₹150 on orders above ₹199"
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
                  />
                </div>
              </div>

              {/* Initial Store Targeting Scoping */}
              <div className="space-y-2 border-t border-stone-200/60 pt-3">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase block">
                  Initial Target Outlets
                </label>
                
                <div className="flex items-center gap-4 text-xs font-body mb-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="initialScopeType"
                      checked={initialScopeAll}
                      onChange={() => setInitialScopeAll(true)}
                      className="text-brand focus:ring-brand"
                    />
                    <span>All Outlets</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="initialScopeType"
                      checked={!initialScopeAll}
                      onChange={() => setInitialScopeAll(false)}
                      className="text-brand focus:ring-brand"
                    />
                    <span>Specific Outlets</span>
                  </label>
                </div>

                {!initialScopeAll && (
                  <div className="max-h-48 overflow-y-auto border border-stone-200 rounded-card p-2.5 bg-stone-50/50 space-y-3">
                    {franchises.map(franchise => {
                      const franchiseStores = stores.filter(s => s.franchiseId === franchise.id);
                      if (franchiseStores.length === 0) return null;
                      return (
                        <div key={franchise.id} className="space-y-1.5">
                          <div className="text-[9px] font-heading font-extrabold text-brand uppercase tracking-wider">
                            {franchise.name}
                          </div>
                          <div className="grid grid-cols-1 gap-1.5 pl-1">
                            {franchiseStores.map(store => {
                              const isChecked = selectedStores[store.id] === true;
                              return (
                                <label key={store.id} className="flex items-center gap-2 text-[10px] text-text-secondary cursor-pointer hover:text-text-primary">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleStoreSelection(store.id)}
                                    className="rounded border-stone-300 text-brand focus:ring-brand w-3.5 h-3.5"
                                  />
                                  <span>{store.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-brand hover:bg-brand-accent text-white font-heading font-semibold rounded-pill text-xs shadow-md active:scale-95 transition-all cursor-pointer mt-3"
              >
                Create Brand Offer
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* Edit Brand Offer Modal */}
      {editingPromo && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); resetForm(); }}
          title={`Edit Coupon: ${editingPromo.code}`}
        >
          <form onSubmit={handleUpdatePromoSubmit} className="space-y-4 text-xs font-body text-text-secondary">
            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Coupon Code (Read-Only)</label>
              <input
                type="text"
                disabled
                value={editingPromo.code}
                className="w-full px-3 py-2 border border-stone-200 rounded-input bg-stone-50 text-text-muted font-heading font-bold cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Title</label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="e.g. Flat 50% discount"
                className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Description</label>
              <input
                type="text"
                required
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="e.g. Save 50% up to ₹150 on orders above ₹199"
                className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Discount Type</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-semibold bg-white"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Price (₹)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Value</label>
                <input
                  type="number"
                  required
                  value={editVal}
                  onChange={(e) => setEditVal(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Min Order</label>
                <input
                  type="number"
                  required
                  value={editMinOrder}
                  onChange={(e) => setEditMinOrder(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Max Discount</label>
                <input
                  type="number"
                  required
                  value={editMaxDiscount}
                  onChange={(e) => setEditMaxDiscount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">Start Date</label>
                <input
                  type="date"
                  required
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-heading font-bold text-text-secondary uppercase">End Date</label>
                <input
                  type="date"
                  required
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between border-t border-border">
              <button
                type="button"
                onClick={() => { setIsEditModalOpen(false); resetForm(); }}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-text-secondary font-heading font-semibold rounded-pill cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand hover:bg-brand-accent text-white font-heading font-semibold rounded-pill shadow-md cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AdminLayout>
  );
};

export default Promotions;
