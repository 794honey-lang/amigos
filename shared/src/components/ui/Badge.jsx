import React from 'react';

export const Badge = ({
  status = 'Placed',
  className = '',
  ...props
}) => {
  const statusNormalized = status.toLowerCase();

  const colorMap = {
    placed: 'bg-amber-100 text-amber-800 border border-amber-200',
    confirmed: 'bg-amber-100 text-amber-800 border border-amber-200',
    preparing: 'bg-amber-100 text-amber-800 border border-amber-200',
    ready: 'bg-blue-100 text-blue-800 border border-blue-200',
    outfordelivery: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    delivered: 'bg-green-100 text-success border border-green-200',
    cancelled: 'bg-red-100 text-red-800 border border-red-200',
  };

  const displayNameMap = {
    placed: 'Order Placed',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    outfordelivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  const style = colorMap[statusNormalized] || 'bg-stone-100 text-stone-800 border border-stone-200';
  const name = displayNameMap[statusNormalized] || status;

  return (
    <span
      className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-heading font-medium tracking-wide ${style} ${className}`}
      {...props}
    >
      {name}
    </span>
  );
};
export default Badge;
