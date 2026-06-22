import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Percent, Copy, Check, Ticket, ChevronRight, Info, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { couponService } from '@shared/services/couponService';
import { useUiStore } from '@shared/store/uiStore';
import { Card } from '@shared/components/ui/Card';

export const Offers = () => {
  const navigate = useNavigate();
  const { addToast } = useUiStore();
  const [coupons, setCoupons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  const loadCoupons = async () => {
    setIsLoading(true);
    const res = await couponService.getCoupons();
    setIsLoading(false);
    if (res.success) {
      setCoupons(res.data);
    } else {
      addToast(res.error || 'Failed to fetch offers', 'error');
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCopyCode = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast(`Coupon "${code}" copied!`, 'success');
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-bg pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-border px-4 py-4.5 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="font-heading font-extrabold text-base text-text-primary">
            Offers & Coupons
          </h1>
          <p className="text-[10px] font-body text-text-secondary mt-0.5">
            Claim best deals and save big on your next meal
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold">
          <Ticket className="w-4.5 h-4.5" />
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Search Bar */}
        {coupons.length > 0 && (
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coupon code or deal..."
              className="w-full bg-white border border-stone-300 rounded-pill pl-10 pr-4 py-2.5 text-xs font-body text-text-primary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/35 transition-all"
            />
            <Search className="w-4 h-4 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        )}

        {/* Coupon Cards */}
        {isLoading ? (
          <div className="py-20 text-center text-text-secondary text-xs">
            Fetching tasty deals...
          </div>
        ) : filteredCoupons.length > 0 ? (
          <div className="space-y-3.5">
            <AnimatePresence>
              {filteredCoupons.map((coupon, idx) => (
                <motion.div
                  key={coupon.code}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  onClick={() => {
                    navigate('/menu');
                    addToast(`Add items to cart and apply code "${coupon.code}" at checkout!`, 'info');
                  }}
                  className="group relative bg-white border border-dashed border-gold hover:border-brand rounded-card p-4 shadow-sm hover:shadow transition-all cursor-pointer flex flex-col sm:flex-row justify-between gap-4 select-none hover:bg-amber-50/10"
                >
                  <div className="space-y-1.5 flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-gold/15 text-amber-800 border border-gold/25 text-[10px] font-heading font-extrabold px-2.5 py-0.5 rounded-pill tracking-wide uppercase">
                        {coupon.code}
                      </span>
                      <span className="text-[10px] font-heading font-bold text-success bg-green-50 border border-success/15 px-2 py-0.5 rounded-pill uppercase tracking-wider">
                        Active
                      </span>
                    </div>
                    
                    <p className="text-xs text-text-primary font-heading font-bold pt-0.5 leading-snug">
                      {coupon.discountType === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} Flat OFF`}
                    </p>
                    
                    <p className="text-[10.5px] text-text-secondary font-body leading-relaxed">
                      {coupon.description}
                    </p>

                    <div className="flex gap-4 text-[9px] text-text-muted font-body pt-1">
                      <span>Min Order: ₹{coupon.minCartTotal}</span>
                      {coupon.discountType === 'percentage' && <span>Max Cap: ₹{coupon.maxDiscount}</span>}
                    </div>
                  </div>

                  <div className="flex sm:flex-col justify-between sm:justify-center items-center gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-stone-150 pt-3 sm:pt-0 sm:pl-4">
                    <button
                      onClick={(e) => handleCopyCode(coupon.code, e)}
                      className={`w-full sm:w-auto px-4 py-2 text-[10px] font-heading font-extrabold rounded-pill transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        copiedCode === coupon.code
                          ? 'bg-success text-white'
                          : 'bg-brand hover:bg-brand-accent text-white shadow-sm'
                      }`}
                    >
                      {copiedCode === coupon.code ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                    <span className="text-[8px] font-heading font-semibold text-text-muted uppercase tracking-wider hidden sm:inline">
                      Click to apply
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-20 bg-white border border-border border-dashed p-8 rounded-card text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-stone-100 border border-border flex items-center justify-center text-text-secondary">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-heading font-bold text-xs text-text-primary">No Coupons Available</h4>
              <p className="text-[10px] font-body text-text-secondary max-w-[200px] mx-auto">Check back later for active promotions and restaurant discount offers.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;
