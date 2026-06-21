import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Logo } from '@shared/components/ui/Logo';
import { useAuthStore } from '@shared/store/authStore';

export const Splash = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigate('/home');
      } else {
        navigate('/login');
      }
    }, 1800); // 1.8s for smooth splash animation feel

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex-1 bg-bg flex flex-col justify-between items-center relative overflow-hidden min-h-screen">
      {/* Decorative Top Accent */}
      <div className="w-40 h-40 bg-brand/5 rounded-full blur-3xl absolute -top-10 -left-10" />
      <div className="w-40 h-40 bg-gold/5 rounded-full blur-3xl absolute -top-10 -right-10" />

      {/* Centered Logo */}
      <div className="flex-1 flex flex-col justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <Logo size="lg" />
        </motion.div>
      </div>

      {/* Bleeding Bottom Pizza Image */}
      <motion.div
        initial={{ y: '50%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
        className="w-full relative flex justify-center mt-auto"
      >
        <img
          src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80"
          alt="Freshly baked pizza"
          className="w-[85%] max-w-[380px] object-cover h-[220px] rounded-t-full border-t-8 border-x-4 border-brand/10 shadow-2xl rotate-[-5deg]"
          style={{ transformOrigin: 'bottom center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent pointer-events-none" />
      </motion.div>
    </div>
  );
};

export default Splash;
