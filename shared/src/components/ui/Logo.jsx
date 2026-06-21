import React from 'react';
import logoImg from '../../assets/logo.png';

export const Logo = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-28',
    md: 'w-40',
    lg: 'w-56'
  };

  const activeSizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <img
        src={logoImg}
        alt="Amigos — A Multi Cuisine Fiesta"
        className={`${activeSizeClass} h-auto object-contain`}
      />
    </div>
  );
};

export default Logo;
