import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trash2, ArrowRight, Percent, Tag, X } from 'lucide-react';
import { useCartStore } from '@shared/store/cartStore';
import { useUiStore } from '@shared/store/uiStore';
import { couponService } from '@shared/services/couponService';
import { Card } from '@shared/components/ui/Card';
import { QuantityStepper } from '@shared/components/ui/QuantityStepper';
import { Button } from '@shared/components/ui/Button';

export const Cart = () => {
  const navigate = useNavigate();
  const {
    items,
    updateQty,
    removeItem,
    coupon,
    applyCoupon,
    removeCoupon,
    itemTotal,
    deliveryFee,
    taxes,
    discount,
    toPay,
    clearCart
  } = useCartStore();
  const { addToast } = useUiStore();

  const [isEditing, setIsEditing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    const res = await couponService.applyCoupon(couponCode, itemTotal);
    setCouponLoading(false);

    if (res.success) {
      applyCoupon(res.data);
      addToast(`Coupon "${res.data.code}" applied! Saved ₹${res.data.discountAmount}`, 'success');
      setCouponCode('');
    } else {
      addToast(res.error, 'error');
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    addToast('Coupon removed', 'info');
  };

  // If cart is empty
  if (items.length === 0) {
    return (
      <div className="flex-1 bg-bg flex flex-col items-center justify-center p-6 text-center min-h-[80vh] space-y-4">
        <div className="w-24 h-24 rounded-full bg-brand/5 flex items-center justify-center text-brand">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <div className="space-y-1.5">
          <h2 className="font-heading font-extrabold text-lg text-text-primary">Your cart is empty</h2>
          <p className="font-body text-xs text-text-secondary max-w-[240px] leading-relaxed mx-auto">
            Add items from our multi-cuisine menu to start your fiesta!
          </p>
        </div>
        <Button
          onClick={() => navigate('/menu')}
          variant="primary"
          className="px-8 mt-2"
        >
          Browse Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-bg relative pb-36">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-border px-4 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate(-1)}
            className="p-1 -ml-1 rounded-full hover:bg-stone-50 text-text-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-heading font-extrabold text-base text-text-primary">My Cart</h1>
        </div>
        
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-heading font-bold text-brand hover:underline"
        >
          {isEditing ? 'Done' : 'Edit'}
        </button>
      </header>

      {/* Cart Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Cart Items List */}
        <div className="space-y-3">
          {items.map((item) => {
            const singleCost = item.price + (item.crustPrice || 0) + (item.toppingsPrice || 0);
            return (
              <Card key={item.id} className="p-3.5 flex items-center gap-3">
                {/* Product Image */}
                <div className="w-16 h-16 rounded-card overflow-hidden shrink-0 border border-border">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-heading font-bold text-xs text-text-primary truncate">
                    {item.name} ({item.size})
                  </h4>
                  
                  {/* Customization Details */}
                  <p className="text-[9px] text-text-secondary font-body leading-tight line-clamp-2">
                    {item.crust}
                    {item.toppings.length > 0 && `, ${item.toppings.map(t => t.name).join(', ')}`}
                  </p>
                  
                  <span className="font-heading font-extrabold text-brand text-xs block pt-0.5">
                    ₹{singleCost * item.qty}
                  </span>
                </div>

                {/* Control Row */}
                <div className="flex items-center gap-2 shrink-0">
                  {isEditing ? (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 transition-colors active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <QuantityStepper
                      value={item.qty}
                      onChange={(newQty) => updateQty(item.id, newQty - item.qty)}
                      min={0}
                      className="scale-90"
                    />
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Coupon Form Section */}
        <div className="space-y-2.5">
          <h3 className="font-heading font-bold text-xs text-text-primary px-1">Apply Coupon</h3>
          
          {coupon ? (
            <div className="bg-green-50 border border-green-200 rounded-card p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-success">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-heading font-bold text-xs text-green-900 uppercase">
                    {coupon.code} Applied!
                  </span>
                  <p className="text-[9px] text-green-700 font-body leading-none mt-0.5">
                    Saved ₹{coupon.discountAmount}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveCoupon}
                className="p-1 rounded-full hover:bg-green-100 text-green-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="flex-1 relative flex items-center">
                <Percent className="w-4.5 h-4.5 absolute left-3.5 text-text-muted" />
                <input
                  type="text"
                  placeholder="Enter coupon code (e.g. AMIGOS20)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={couponLoading}
                  className="w-full bg-white border border-stone-300 rounded-input pl-10 pr-4 py-2.5 text-xs font-body text-text-primary uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={couponLoading || !couponCode.trim()}
                className="bg-brand hover:bg-brand-accent text-white font-heading font-semibold rounded-input px-5 py-2.5 text-xs shadow-sm hover:shadow active:scale-95 transition-all disabled:opacity-50"
              >
                {couponLoading ? 'Applying...' : 'Apply'}
              </button>
            </form>
          )}
        </div>

        {/* Bill Details Card */}
        <div className="space-y-2.5">
          <h3 className="font-heading font-bold text-xs text-text-primary px-1">Bill Details</h3>
          <Card className="p-4 space-y-2.5">
            <div className="flex justify-between text-xs font-body text-text-secondary">
              <span>Item Total</span>
              <span className="font-heading font-medium">₹{itemTotal}</span>
            </div>
            <div className="flex justify-between text-xs font-body text-text-secondary">
              <span>Delivery Fee</span>
              <span className="font-heading font-medium">
                {deliveryFee === 0 ? <span className="text-success font-bold">FREE</span> : `₹${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between text-xs font-body text-text-secondary">
              <span>Taxes & Charges (5%)</span>
              <span className="font-heading font-medium">₹{taxes}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-xs font-body text-success font-medium bg-green-50/50 p-1.5 rounded-sm">
                <span>Coupon Discount</span>
                <span className="font-heading">-₹{discount}</span>
              </div>
            )}
            
            <div className="border-t border-border pt-2.5 flex justify-between text-sm font-heading font-bold text-text-primary">
              <span>To Pay</span>
              <span className="text-brand">₹{toPay}</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-border px-5 py-3.5 z-40 shadow-2xl rounded-t-sheet flex items-center justify-between gap-4">
        <div className="flex flex-col text-left pl-1">
          <span className="text-[10px] text-text-secondary font-medium font-body leading-none">
            To Pay
          </span>
          <span className="text-base text-brand font-extrabold font-heading mt-1">
            ₹{toPay}
          </span>
        </div>
        <Button
          onClick={() => navigate('/checkout')}
          variant="primary"
          size="md"
          className="flex-1 flex items-center justify-center gap-2 group shadow-md py-3"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default Cart;
