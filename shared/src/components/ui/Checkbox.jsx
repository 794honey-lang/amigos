import React from 'react';
import { Check } from 'lucide-react';

export const Checkbox = ({
  id,
  checked = false,
  onChange,
  label,
  price,
  className = '',
  ...props
}) => {
  return (
    <label
      htmlFor={id}
      className={`flex items-center justify-between p-3 rounded-card border transition-all duration-200 cursor-pointer ${
        checked
          ? 'bg-brand/5 border-brand'
          : 'bg-white border-border hover:bg-stone-50'
      } ${className}`}
    >
      <div className="flex items-center gap-3">
        {/* Customized Checkbox Box */}
        <div className="relative">
          <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={onChange}
            className="sr-only"
            {...props}
          />
          <div
            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
              checked
                ? 'bg-brand border-brand text-white'
                : 'border-stone-300 bg-white'
            }`}
          >
            {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        </div>
        
        {label && (
          <span className="font-body text-sm font-medium text-text-primary">
            {label}
          </span>
        )}
      </div>
      
      {price !== undefined && (
        <span className="font-heading font-bold text-xs text-brand">
          +₹{price}
        </span>
      )}
    </label>
  );
};
export default Checkbox;
