import React from 'react';

export const VegBadge = ({
  isVeg = true,
  className = '',
  ...props
}) => {
  const borderColor = isVeg ? 'border-green-600' : 'border-red-700';
  const dotColor = isVeg ? 'bg-green-600' : 'bg-red-700';

  return (
    <div
      className={`inline-flex items-center justify-center w-4 h-4 border-2 ${borderColor} p-0.5 rounded-sm bg-white shrink-0 ${className}`}
      title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
      {...props}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
    </div>
  );
};
export default VegBadge;
