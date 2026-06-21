import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-heading font-semibold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-brand hover:bg-brand-accent text-white rounded-pill shadow-md hover:shadow-lg focus:ring-2 focus:ring-brand/40',
    secondary: 'bg-gold hover:bg-gold/90 text-dark rounded-pill shadow-md hover:shadow-lg focus:ring-2 focus:ring-gold/40',
    outline: 'border-2 border-brand text-brand hover:bg-brand/5 rounded-pill focus:ring-2 focus:ring-brand/40',
    ghost: 'text-brand hover:bg-brand/5 rounded-pill focus:ring-2 focus:ring-brand/40',
    danger: 'bg-red-600 hover:bg-red-700 text-white rounded-pill focus:ring-2 focus:ring-red-600/40',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      type={type}
      whileTap={disabled ? {} : { scale: 0.98 }}
      whileHover={disabled ? {} : { scale: 1.01 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};
export default Button;
