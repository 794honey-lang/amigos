import React from 'react';

export const Card = ({
  children,
  className = '',
  onClick,
  ...props
}) => {
  const clickableStyle = onClick ? 'cursor-pointer hover:shadow-md active:scale-[0.99] transition-all duration-200' : '';
  
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-card shadow-sm border border-border overflow-hidden ${clickableStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
export default Card;
