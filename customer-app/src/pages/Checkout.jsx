import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MapPin, CreditCard, Wallet, Coins, ChevronRight, AlertTriangle } from 'lucide-react';
import { useCartStore } from '@shared/store/cartStore';
import { useAuthStore } from '@shared/store/authStore';
import { useOrderStore } from '@shared/store/orderStore';
import { useUiStore } from '@shared/store/uiStore';
import { Card } from '@shared/components/ui/Card';
import { BottomSheet } from '@shared/components/ui/BottomSheet';
import { Button } from '@shared/components/ui/Button';

export const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    items, deliveryType, setDeliveryType, toPay, deliveryFee, itemTotal, taxes, discount, clearCart,
    setDeliveryAddress, isOutOfDeliveryZone, minOrderViolation, distanceKm,
    enableFreeDelivery, freeDeliveryMinOrder
  } = useCartStore();
  const { placeOrder, loading } = useOrderStore();
  const { addToast } = useUiStore();

  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [addressSheetOpen, setAddressSheetOpen] = useState(false);
  const [minOrderThreshold, setMinOrderThreshold] = useState(200);

  const selectedAddress = user?.addresses?.[selectedAddressIndex] || {
    label: 'Guest Location',
    line: 'Select or add an address in your profile.',
    city: '',
    pincode: ''
  };

  // Sync selected address with the cart store to calculate dynamic delivery fee
  useEffect(() => {
    if (deliveryType === 'delivery') {
      setDeliveryAddress(selectedAddress);
    } else {
      setDeliveryAddress(null);
    }
  }, [selectedAddress, deliveryType]);

  // Load active store's minimum order threshold dynamically
  useEffect(() => {
    try {
      const stored = localStorage.getItem('amigos_delivery_zones');
      if (stored) {
        const zones = JSON.parse(stored);
        const activeZone = zones.find(z => z.storeId === 'store_001');
        if (activeZone && activeZone.minOrderValue !== undefined) {
          setMinOrderThreshold(activeZone.minOrderValue);
        }
      }
    } catch (e) {}
  }, []);

  const handlePay = async () => {
    if (items.length === 0) {
      addToast('Your cart is empty', 'error');
      return;
    }

    const payload = {
      items,
      itemTotal,
      deliveryFee,
      taxes,
      discount,
      toPay,
      paymentMethod,
      address: {
        line: selectedAddress.line,
        city: selectedAddress.city,
        pincode: selectedAddress.pincode,
        landmark: selectedAddress.landmark || ''
      },
      customer: {
        name: user?.name || 'Guest User',
        phone: user?.phone || '9876543210'
      }
    };

    // Place order, pass clearCart callback on success
    const res = await placeOrder(payload, () => clearCart());
    
    if (res.success) {
      addToast('Order placed successfully!', 'success');
      navigate(`/order/${res.orderId}`);
    } else {
      addToast(res.error || 'Failed to place order', 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-bg relative pb-28">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-border px-4 py-3.5 flex items-center gap-1.5 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="p-1 -ml-1 rounded-full hover:bg-stone-50 text-text-secondary transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-heading font-extrabold text-base text-text-primary">Checkout</h1>
      </header>

      {/* Main Form Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Delivery Type Switch */}
        <div className="bg-white border border-border p-1 rounded-pill flex items-center shadow-sm">
          <button
            onClick={() => setDeliveryType('delivery')}
            className={`flex-1 py-2.5 text-xs font-heading font-bold rounded-pill transition-all ${
              deliveryType === 'delivery'
                ? 'bg-brand text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Delivery
          </button>
          <button
            onClick={() => setDeliveryType('takeaway')}
            className={`flex-1 py-2.5 text-xs font-heading font-bold rounded-pill transition-all ${
              deliveryType === 'takeaway'
                ? 'bg-brand text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Takeaway
          </button>
        </div>

        {/* Address Card (Visible only if Delivery mode is active) */}
        {deliveryType === 'delivery' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-heading font-bold text-xs text-text-primary">Delivery Address</h3>
              {user?.addresses && user.addresses.length > 0 && (
                <button
                  onClick={() => setAddressSheetOpen(true)}
                  className="text-xs font-heading font-bold text-brand hover:underline"
                >
                  Change
                </button>
              )}
            </div>

            <Card className="p-4 flex items-start gap-3">
              <div className="p-2 rounded-full bg-brand/5 text-brand shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-heading font-bold text-xs text-text-primary">
                  {selectedAddress.label}
                </h4>
                <p className="text-[10px] text-text-secondary font-body mt-1 leading-normal">
                  {selectedAddress.line}, {selectedAddress.city} - {selectedAddress.pincode}
                  {selectedAddress.landmark && <span className="block text-text-muted mt-0.5">Landmark: {selectedAddress.landmark}</span>}
                </p>
              </div>
            </Card>

            {enableFreeDelivery && (
              itemTotal >= freeDeliveryMinOrder ? (
                <div className="bg-green-50 border border-green-200 rounded-card p-3 flex items-center gap-2 text-green-800 animate-fadeIn">
                  <span className="text-base">🎉</span>
                  <span className="font-heading font-bold text-xs">You have unlocked Free Delivery!</span>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-card p-3 flex items-center gap-2 text-amber-800 animate-fadeIn">
                  <span className="text-base">💡</span>
                  <span className="font-heading font-bold text-xs">
                    Add items worth <span className="underline font-extrabold">₹{freeDeliveryMinOrder - itemTotal}</span> more to get <span className="text-brand font-extrabold">FREE</span> delivery!
                  </span>
                </div>
              )
            )}
          </div>
        )}

        {/* Delivery Instructions */}
        <div className="space-y-2.5">
          <h3 className="font-heading font-bold text-xs text-text-primary px-1">
            {deliveryType === 'delivery' ? 'Delivery Instructions (Optional)' : 'Pickup Notes (Optional)'}
          </h3>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder={deliveryType === 'delivery' ? "Add notes for rider... (e.g. ring bell, leave at gate)" : "Pickup time preferences, vehicle details..."}
            rows={3}
            className="w-full bg-white border border-stone-300 rounded-card p-3 text-xs font-body text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all resize-none"
          />
        </div>

        {/* Payment Methods */}
        <div className="space-y-2.5">
          <h3 className="font-heading font-bold text-xs text-text-primary px-1">Payment Method</h3>
          
          <div className="grid grid-cols-1 gap-2.5">
            {/* UPI Selection */}
            <label
              onClick={() => setPaymentMethod('UPI')}
              className={`p-4 border rounded-card flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === 'UPI' ? 'bg-brand/5 border-brand' : 'bg-white border-border hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${paymentMethod === 'UPI' ? 'bg-brand/10 text-brand' : 'bg-stone-100 text-text-secondary'}`}>
                  <Wallet className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="font-heading font-bold text-xs text-text-primary">UPI</span>
                  <p className="text-[9px] font-body text-text-secondary mt-0.5">Google Pay, PhonePe, Paytm</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'UPI' ? 'border-brand bg-brand' : 'border-stone-300'}`}>
                {paymentMethod === 'UPI' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </label>

            {/* Credit Card Selection */}
            <label
              onClick={() => setPaymentMethod('Card')}
              className={`p-4 border rounded-card flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === 'Card' ? 'bg-brand/5 border-brand' : 'bg-white border-border hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${paymentMethod === 'Card' ? 'bg-brand/10 text-brand' : 'bg-stone-100 text-text-secondary'}`}>
                  <CreditCard className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="font-heading font-bold text-xs text-text-primary">Credit / Debit Card</span>
                  <p className="text-[9px] font-body text-text-secondary mt-0.5">Visa, Mastercard, RuPay</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'Card' ? 'border-brand bg-brand' : 'border-stone-300'}`}>
                {paymentMethod === 'Card' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </label>

            {/* Cash on Delivery */}
            <label
              onClick={() => setPaymentMethod('COD')}
              className={`p-4 border rounded-card flex items-center justify-between cursor-pointer transition-all ${
                paymentMethod === 'COD' ? 'bg-brand/5 border-brand' : 'bg-white border-border hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${paymentMethod === 'COD' ? 'bg-brand/10 text-brand' : 'bg-stone-100 text-text-secondary'}`}>
                  <Coins className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="font-heading font-bold text-xs text-text-primary">Cash on Delivery</span>
                  <p className="text-[9px] font-body text-text-secondary mt-0.5">Pay with cash upon delivery</p>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'COD' ? 'border-brand bg-brand' : 'border-stone-300'}`}>
                {paymentMethod === 'COD' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Sticky Pay Footer */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-border px-5 py-4 z-40 shadow-2xl rounded-t-sheet space-y-2.5">
        {deliveryType === 'delivery' && (minOrderViolation || isOutOfDeliveryZone) && (
          <div className="bg-red-50 border border-red-200 rounded-card p-3 flex items-start gap-2 text-danger animate-fadeIn">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="text-[10px] font-body text-left leading-normal">
              {minOrderViolation && (
                <p>⚠️ Min. order value of ₹{minOrderThreshold} required for delivery. (Cart: ₹{itemTotal})</p>
              )}
              {isOutOfDeliveryZone && (
                <p>⚠️ Out of delivery zone. Distance is {distanceKm ? distanceKm.toFixed(1) : 'N/A'} km.</p>
              )}
            </div>
          </div>
        )}

        {deliveryType === 'delivery' && !minOrderViolation && !isOutOfDeliveryZone && distanceKm > 0 && (
          <div className="bg-stone-50 border border-stone-200 rounded-card px-3 py-2 flex items-center justify-between text-[10px] font-heading font-bold text-text-secondary">
            <span>Rider Distance:</span>
            <span className="text-brand">{distanceKm.toFixed(1)} km</span>
          </div>
        )}

        <Button
          onClick={handlePay}
          variant="primary"
          fullWidth
          size="lg"
          disabled={loading || (deliveryType === 'delivery' && (minOrderViolation || isOutOfDeliveryZone))}
          className="py-3.5 shadow-md font-heading font-semibold text-sm"
        >
          {loading ? 'Processing...' : `Pay ₹${toPay}`}
        </Button>
      </div>

      {/* Address Picker Bottom Sheet */}
      <BottomSheet
        isOpen={addressSheetOpen}
        onClose={() => setAddressSheetOpen(false)}
        title="Select Delivery Address"
      >
        <div className="space-y-3 pb-4">
          {user?.addresses?.map((addr, idx) => (
            <Card
              key={addr.id}
              onClick={() => {
                setSelectedAddressIndex(idx);
                setAddressSheetOpen(false);
              }}
              className={`p-3.5 flex items-start gap-3 ${
                selectedAddressIndex === idx ? 'border-brand bg-brand/5' : 'border-border'
              }`}
            >
              <div className={`p-2 rounded-full shrink-0 ${selectedAddressIndex === idx ? 'bg-brand/10 text-brand' : 'bg-stone-100 text-text-secondary'}`}>
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <h4 className="font-heading font-bold text-xs text-text-primary">{addr.label}</h4>
                <p className="text-[9px] text-text-secondary font-body mt-0.5 line-clamp-2">
                  {addr.line}, {addr.city} - {addr.pincode}
                </p>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-text-muted shrink-0 self-center" />
            </Card>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
};

export default Checkout;
