import React from 'react';

export const Input = React.forwardRef(({
  label,
  error,
  type = 'text',
  placeholder = '',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="font-heading font-medium text-xs text-text-secondary">
          {label}
        </label>
      )}
      
      <input
        ref={ref}
        type={type}
        id={inputId}
        placeholder={placeholder}
        className={`w-full bg-white border rounded-input px-4 py-3 text-sm font-body text-text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand ${
          error ? 'border-red-500 focus:ring-red-500/40 focus:border-red-500' : 'border-stone-300'
        }`}
        {...props}
      />
      
      {error && (
        <span className="text-red-500 text-xs font-body font-medium mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
