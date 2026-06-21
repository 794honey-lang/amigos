import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export const QuantityStepper = ({
  value = 1,
  onChange,
  min = 1,
  max = 100,
  className = '',
}) => {
  const handleDecrement = (e) => {
    e.stopPropagation();
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className={`flex items-center gap-3 border border-stone-200 rounded-pill p-1 bg-stone-50/50 ${className}`}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={handleDecrement}
        disabled={value <= min}
        className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-stone-200 shadow-sm text-text-secondary disabled:opacity-40 hover:bg-stone-50"
      >
        <Minus className="w-3.5 h-3.5" />
      </motion.button>
      
      <span className="font-heading font-bold text-sm w-5 text-center text-text-primary">
        {value}
      </span>
      
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={handleIncrement}
        disabled={value >= max}
        className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-stone-200 shadow-sm text-text-secondary disabled:opacity-40 hover:bg-stone-50"
      >
        <Plus className="w-3.5 h-3.5" />
      </motion.button>
    </div>
  );
};
export default QuantityStepper;
