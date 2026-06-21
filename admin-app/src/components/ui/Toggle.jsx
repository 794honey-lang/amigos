import React from 'react';

export const Toggle = ({ 
  checked, 
  onChange, 
  label, 
  disabled = false, 
  confirmMessage 
}) => {
  const handleToggle = () => {
    if (disabled) return;
    if (confirmMessage) {
      if (window.confirm(confirmMessage)) {
        onChange(!checked);
      }
    } else {
      onChange(!checked);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-pill border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-50 disabled:cursor-not-allowed ${
          checked ? 'bg-success' : 'bg-stone-300'
        }`}
        style={{ minWidth: '52px', minHeight: '28px' }}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
      {label && (
        <span className="text-xs font-heading font-medium text-text-secondary select-none">
          {label}
        </span>
      )}
    </div>
  );
};

export default Toggle;
