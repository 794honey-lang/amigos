import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useScopeStore } from '../../store/scopeStore';
import { useUiStore } from '../../store/uiStore';
import { AdminLayout } from '../../components/shared/AdminLayout';
import { Toggle } from '../../components/ui/Toggle';
import { 
  AlertTriangle, ShieldCheck, HelpCircle, Info, Plus, 
  Minus, CreditCard, Wallet, Smartphone, Landmark 
} from 'lucide-react';

export const Operations = () => {
  const { scope } = useAuthStore();
  const { currentStoreId } = useScopeStore();
  const { addToast } = useUiStore();

  const activeStoreId = currentStoreId || scope.storeId || 'store_001';

  // State for all controls
  const [stopOrders, setStopOrders] = useState(false);
  const [timedOrders, setTimedOrders] = useState(false);
  const [deliveryBuffer, setDeliveryBuffer] = useState(0); // in minutes
  const [carryoutOnly, setCarryoutOnly] = useState(false);
  const [driverShortage, setDriverShortage] = useState(false);
  const [capacityLimit, setCapacityLimit] = useState(30);

  // Payments State
  const [codEnabled, setCodEnabled] = useState(true);
  const [cardEnabled, setCardEnabled] = useState(true);
  const [upiEnabled, setUpiEnabled] = useState(true);
  
  // HQ disabled wallet flag (Corporate has globally turned off wallet payments)
  const walletEnabledByCorporate = false; 

  const handleToggleStopOrders = (val) => {
    setStopOrders(val);
    addToast(
      val ? 'Online orders have been STOPPED for this outlet.' : 'Online orders are now RESUMED.',
      val ? 'error' : 'success'
    );
  };

  const handleToggleCarryoutOnly = (val) => {
    setCarryoutOnly(val);
    addToast(
      val ? 'Store set to CARRYOUT ONLY. Delivery orders are disabled.' : 'Delivery orders are now re-enabled.',
      val ? 'warning' : 'success'
    );
  };

  const handleBufferChange = (amount) => {
    const newVal = Math.max(0, deliveryBuffer + amount);
    setDeliveryBuffer(newVal);
    addToast(`Delivery time estimate adjusted: ${newVal > 0 ? `+${newVal}` : 'Standard'} minutes`, 'success');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-card border border-border shadow-sm">
          <h1 className="text-base font-heading font-extrabold text-text-primary">
            Store Operations Control Panel
          </h1>
          <p className="text-[10px] font-body text-text-secondary mt-0.5">
            Configure delivery buffers, concurrent limit throttles, payment methods, and kill-switches
          </p>
        </div>

        {/* Operational Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Stop Online Orders Card */}
          <div className="bg-white border border-border rounded-card p-5 shadow-sm flex flex-col justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-extrabold text-xs text-text-primary uppercase tracking-wide">
                  Stop Online Orders
                </h4>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-pill border ${
                  stopOrders 
                    ? 'bg-red-50 text-danger border-danger/20' 
                    : 'bg-green-50 text-success border-success/20'
                }`}>
                  {stopOrders ? 'OFFLINE' : 'ONLINE'}
                </span>
              </div>
              <p className="text-[10px] font-body text-text-secondary leading-relaxed">
                Emergency switch to immediately halt all new online orders. Current orders must still be completed.
              </p>
            </div>
            
            <div className="pt-2 border-t border-border/60">
              <Toggle 
                checked={stopOrders} 
                onChange={handleToggleStopOrders} 
                confirmMessage="WARNING: You are about to STOP all online orders for this store. Customers will not be able to checkout. Do you want to proceed?"
              />
            </div>
          </div>

          {/* 2. Delivery Time Buffer Card */}
          <div className="bg-white border border-border rounded-card p-5 shadow-sm flex flex-col justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-heading font-extrabold text-xs text-text-primary uppercase tracking-wide">
                Raise Quoted Delivery Time
              </h4>
              <p className="text-[10px] font-body text-text-secondary leading-relaxed">
                Add buffer minutes to the delivery estimate shown to customers during high demand or bad weather.
              </p>
            </div>

            <div className="flex items-center justify-between bg-surface-sunken border border-border rounded-card px-4 py-2.5">
              <span className="text-xs font-heading font-bold text-text-primary">
                {deliveryBuffer > 0 ? `+ ${deliveryBuffer} mins` : 'Standard Time'}
              </span>
              <div className="flex gap-2.5">
                <button
                  onClick={() => handleBufferChange(-15)}
                  disabled={deliveryBuffer === 0}
                  className="w-7 h-7 bg-white hover:bg-stone-50 border border-stone-200 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-90 transition-transform cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5 text-text-primary" />
                </button>
                <button
                  onClick={() => handleBufferChange(15)}
                  className="w-7 h-7 bg-white hover:bg-stone-50 border border-stone-200 rounded-full flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-text-primary" />
                </button>
              </div>
            </div>
          </div>

          {/* 3. Carryout Only Mode */}
          <div className="bg-white border border-border rounded-card p-5 shadow-sm flex flex-col justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-extrabold text-xs text-text-primary uppercase tracking-wide">
                  Carryout Only Mode
                </h4>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-pill border ${
                  carryoutOnly 
                    ? 'bg-amber-50 text-gold border-gold/20' 
                    : 'bg-green-50 text-success border-success/20'
                }`}>
                  {carryoutOnly ? 'CARRYOUT ONLY' : 'DELIVERY ACTIVE'}
                </span>
              </div>
              <p className="text-[10px] font-body text-text-secondary leading-relaxed">
                Halt all delivery dispatches. Customers can only place takeaway/pick-up orders from this branch.
              </p>
            </div>
            
            <div className="pt-2 border-t border-border/60">
              <Toggle 
                checked={carryoutOnly} 
                onChange={handleToggleCarryoutOnly} 
                confirmMessage="Are you sure you want to switch to CARRYOUT ONLY? This will disable delivery options for this store."
              />
            </div>
          </div>

          {/* 4. Timed Orders Only */}
          <div className="bg-white border border-border rounded-card p-5 shadow-sm flex flex-col justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-heading font-extrabold text-xs text-text-primary uppercase tracking-wide">
                Timed / Scheduled Orders
              </h4>
              <p className="text-[10px] font-body text-text-secondary leading-relaxed">
                Allow customers to place pre-orders only for specific delivery slots rather than instant dispatch.
              </p>
            </div>
            
            <div className="pt-2 border-t border-border/60">
              <Toggle 
                checked={timedOrders} 
                onChange={(val) => {
                  setTimedOrders(val);
                  addToast(val ? 'Scheduled orders only mode enabled.' : 'Instant delivery orders are now re-enabled.', 'success');
                }} 
              />
            </div>
          </div>

          {/* 5. Driver Shortage Mode */}
          <div className="bg-white border border-border rounded-card p-5 shadow-sm flex flex-col justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-heading font-extrabold text-xs text-text-primary uppercase tracking-wide">
                Driver Shortage Mode
              </h4>
              <p className="text-[10px] font-body text-text-secondary leading-relaxed">
                Flags severe driver constraints. Automatically extends delivery times and reduces the active delivery radius by 2km.
              </p>
            </div>
            
            <div className="pt-2 border-t border-border/60">
              <Toggle 
                checked={driverShortage} 
                onChange={(val) => {
                  setDriverShortage(val);
                  addToast(val ? 'Driver shortage flag raised. Radius auto-restricted.' : 'Driver shortage flag cleared.', 'success');
                }} 
              />
            </div>
          </div>

          {/* 6. Capacity Throttling */}
          <div className="bg-white border border-border rounded-card p-5 shadow-sm flex flex-col justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-heading font-extrabold text-xs text-text-primary uppercase tracking-wide">
                Concurrent Ticket Throttle
              </h4>
              <p className="text-[10px] font-body text-text-secondary leading-relaxed">
                Throttles incoming orders. Once active orders meet this threshold, new orders are queued automatically.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                value={capacityLimit}
                onChange={(e) => setCapacityLimit(parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-1.5 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-bold"
                style={{ height: '36px' }}
              />
              <span className="text-[11px] font-body text-text-muted">max concurrent tickets</span>
            </div>
          </div>
        </div>

        {/* Section Title: Payment Methods */}
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-heading font-extrabold text-text-primary uppercase tracking-wide">
            Store-Level Payment Overrides
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cash on Delivery */}
            <div className="bg-white border border-border rounded-card p-4 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-green-50 border border-success/15 flex items-center justify-center text-success">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-heading font-bold text-xs text-text-primary">Cash on Delivery</h5>
                  <span className="text-[9px] font-body text-text-muted">Cash pay at door</span>
                </div>
              </div>
              <Toggle checked={codEnabled} onChange={setCodEnabled} />
            </div>

            {/* UPI payments */}
            <div className="bg-white border border-border rounded-card p-4 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-50 border border-info/15 flex items-center justify-center text-info">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-heading font-bold text-xs text-text-primary">UPI Payments</h5>
                  <span className="text-[9px] font-body text-text-muted">GPay, PhonePe, BHIM</span>
                </div>
              </div>
              <Toggle checked={upiEnabled} onChange={setUpiEnabled} />
            </div>

            {/* Credit/Debit Cards */}
            <div className="bg-white border border-border rounded-card p-4 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-stone-50 border border-border flex items-center justify-center text-text-secondary">
                  <CreditCard className="w-4 h-4 text-brand" />
                </div>
                <div>
                  <h5 className="font-heading font-bold text-xs text-text-primary">Card Payments</h5>
                  <span className="text-[9px] font-body text-text-muted">Visa, Mastercard, RuPay</span>
                </div>
              </div>
              <Toggle checked={cardEnabled} onChange={setCardEnabled} />
            </div>

            {/* Wallet payments - Gated by Corporate HQ Flag */}
            <div className="bg-white border border-border rounded-card p-4 shadow-sm flex items-center justify-between gap-3 relative group">
              <div className="flex items-center gap-2.5 opacity-40">
                <div className="w-9 h-9 rounded-full bg-stone-50 border border-border flex items-center justify-center text-text-muted">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-heading font-bold text-xs text-text-primary">Mobile Wallet</h5>
                  <span className="text-[9px] font-body text-text-muted">Paytm, Mobikwik</span>
                </div>
              </div>
              <div className="relative">
                <Toggle checked={false} onChange={() => {}} disabled={true} />
              </div>
              {/* Tooltip explaining HQ lock */}
              <div className="absolute top-2 left-2 bg-dark text-white text-[9px] font-heading font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-gold shrink-0" />
                <span>Disabled at Brand Level (HQ Feature Flag)</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default Operations;
