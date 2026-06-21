import React from 'react';
import { mockDrivers } from '../../mocks/mockDrivers';
import { 
  Clock, MapPin, Phone, User, Shield, CheckCircle, 
  XCircle, Truck, ShoppingBag, ArrowRight 
} from 'lucide-react';
import { formatFullIST } from '@shared/utils/dateUtils';

export const OrderDetail = ({ 
  order, 
  onStatusChange, 
  onReject 
}) => {
  if (!order) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white border border-border rounded-card shadow-sm">
        <div className="w-14 h-14 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted mb-3 border border-border">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h4 className="font-heading font-bold text-sm text-text-primary">No Ticket Selected</h4>
        <p className="text-[11px] font-body text-text-secondary mt-0.5 max-w-[200px]">
          Select an active order ticket from the list to view its complete breakdown and dispatch details.
        </p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Placed': return 'bg-blue-50 text-info border-info/20';
      case 'Preparing': return 'bg-amber-50 text-gold border-gold/20';
      case 'Ready': return 'bg-green-50 text-success border-success/20';
      case 'OutForDelivery': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Delivered': return 'bg-green-50 text-success border-success/20';
      case 'Cancelled': return 'bg-red-50 text-danger border-danger/20';
      default: return 'bg-stone-50 border-border text-text-secondary';
    }
  };

  return (
    <div className="h-full bg-white border border-border rounded-card shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-stone-50/50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-extrabold text-sm text-text-primary">
              Order #{order.id}
            </h3>
            <span className={`px-2 py-0.5 rounded-pill text-[9px] font-bold border ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
          <span className="text-[10px] font-body text-text-muted mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Placed: {formatFullIST(order.date)}</span>
          </span>
        </div>

        {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
          <button
            onClick={() => onReject(order.id)}
            className="px-2.5 py-1 text-[10px] font-heading font-semibold text-danger border border-danger/15 hover:bg-red-50 rounded-card transition-colors cursor-pointer"
          >
            Cancel Order
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Customer Details */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-wider">
            Customer Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-surface-sunken p-3.5 rounded-card border border-border text-xs font-body">
            <div className="flex items-center gap-2 text-text-secondary">
              <User className="w-4 h-4 text-brand shrink-0" />
              <span className="font-medium text-text-primary">{order.customer.name}</span>
            </div>
            <div className="flex items-center gap-2 text-text-secondary">
              <Phone className="w-4 h-4 text-brand shrink-0" />
              <span>{order.customer.phone}</span>
            </div>
            {order.address && (
              <div className="flex items-start gap-2 text-text-secondary md:col-span-2 border-t border-border/60 pt-2.5 mt-1">
                <MapPin className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {order.address.line}, {order.address.city} - {order.address.pincode}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Ordered Items */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-wider">
            Ordered Items
          </h4>
          <div className="divide-y divide-border border border-border rounded-card bg-white overflow-hidden text-xs">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-3 flex justify-between items-start gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-heading font-semibold text-text-primary">
                    <span className={`w-2 h-2 rounded-full ${item.isVeg !== false ? 'bg-success' : 'bg-danger'}`} />
                    <span>{item.qty}x {item.name}</span>
                  </div>
                  <div className="pl-3.5 text-[10px] font-body text-text-secondary flex flex-wrap gap-x-2">
                    <span>Size: {item.size}</span>
                    <span>·</span>
                    <span>Crust: {item.crust || 'Classic'}</span>
                    {item.toppings && item.toppings.length > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-brand">Toppings: {item.toppings.join(', ')}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="font-heading font-semibold text-text-primary">
                  ₹{item.price * item.qty}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Summary */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-wider">
            Billing Details
          </h4>
          <div className="border border-border rounded-card p-4 space-y-2 text-xs font-body bg-stone-50/50">
            <div className="flex justify-between text-text-secondary">
              <span>Item Subtotal</span>
              <span>₹{order.itemTotal}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Delivery Fee</span>
              <span>₹{order.deliveryFee || 0}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Taxes</span>
              <span>₹{order.taxes}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-success font-semibold">
                <span>Discount applied</span>
                <span>-₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 text-sm font-heading font-extrabold text-text-primary">
              <span>Grand Total</span>
              <span className="text-brand">₹{order.toPay}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-heading font-bold text-text-muted pt-1">
              <span>Payment Mode: {order.paymentMethod}</span>
              <span className="text-success uppercase tracking-wider">PAID</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 py-4 border-t border-border bg-stone-50/50 flex flex-col gap-3">
        {order.status === 'Placed' && (
          <div className="flex gap-2">
            <button
              onClick={() => onStatusChange(order.id, 'Preparing')}
              className="flex-1 py-2.5 bg-brand hover:bg-brand-accent text-white font-heading font-bold rounded-pill text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Accept & Prepare</span>
            </button>
          </div>
        )}

        {order.status === 'Preparing' && (
          <button
            onClick={() => onStatusChange(order.id, 'Ready')}
            className="w-full py-2.5 bg-success hover:bg-green-600 text-white font-heading font-bold rounded-pill text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Mark Food Ready</span>
          </button>
        )}

        {order.status === 'Ready' && (
          <div className="space-y-2">
            <span className="text-[10px] font-heading font-extrabold text-text-muted uppercase tracking-wider block">
              Dispatch Delivery Driver
            </span>
            <div className="flex gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    onStatusChange(order.id, 'OutForDelivery', e.target.value);
                  }
                }}
                defaultValue=""
                className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-heading font-semibold bg-white"
              >
                <option value="" disabled>-- Select Driver --</option>
                {mockDrivers.map(drv => (
                  <option 
                    key={drv.id} 
                    value={drv.name}
                    disabled={drv.status !== 'Available'}
                  >
                    {drv.name} ({drv.status})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {order.status === 'OutForDelivery' && (
          <div className="space-y-3">
            {order.driverName && (
              <div className="flex items-center gap-2 text-xs font-body text-text-secondary bg-purple-50 border border-purple-200 px-3.5 py-2 rounded-card">
                <Truck className="w-4 h-4 text-purple-700 shrink-0" />
                <span>Driver <strong>{order.driverName}</strong> is delivering food.</span>
              </div>
            )}
            <button
              onClick={() => onStatusChange(order.id, 'Delivered')}
              className="w-full py-2.5 bg-success hover:bg-green-600 text-white font-heading font-bold rounded-pill text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark Delivered</span>
            </button>
          </div>
        )}

        {order.status === 'Delivered' && (
          <div className="flex items-center justify-center gap-2 text-xs font-heading font-bold text-success bg-green-50 border border-success/15 py-2.5 rounded-card">
            <CheckCircle className="w-4 h-4" />
            <span>Order Completed Successfully</span>
          </div>
        )}

        {order.status === 'Cancelled' && (
          <div className="flex items-center justify-center gap-2 text-xs font-heading font-bold text-danger bg-red-50 border border-danger/15 py-2.5 rounded-card">
            <XCircle className="w-4 h-4" />
            <span>Order Cancelled / Rejected</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
