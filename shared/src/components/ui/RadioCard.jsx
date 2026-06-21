import React from 'react';

export const RadioCard = ({
  selected = false,
  onClick,
  title,
  subtitle,
  price,
  badge,
  className = '',
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-card border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between h-24 ${
        selected
          ? 'bg-brand text-white border-brand shadow-md'
          : 'bg-white border-border text-text-primary hover:border-stone-300'
      } ${className}`}
      {...props}
    >
      {badge && (
        <span className={`absolute -top-2.5 left-4 px-2 py-0.5 text-[10px] font-semibold rounded-pill ${
          selected ? 'bg-gold text-dark' : 'bg-gold text-dark'
        }`}>
          {badge}
        </span>
      )}
      
      <div>
        <h4 className="font-heading font-semibold text-sm leading-tight">
          {title}
        </h4>
        {subtitle && (
          <p className={`text-xs mt-1 ${selected ? 'text-white/80' : 'text-text-secondary'}`}>
            {subtitle}
          </p>
        )}
      </div>

      {price !== undefined && (
        <div className="flex justify-end mt-auto">
          <span className={`font-heading font-bold text-sm ${selected ? 'text-white' : 'text-brand'}`}>
            ₹{price}
          </span>
        </div>
      )}
    </div>
  );
};
export default RadioCard;
