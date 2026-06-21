import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Logo } from '@shared/components/ui/Logo';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { authService } from '@shared/services/authService';
import { useAuthStore } from '@shared/store/authStore';
import { useToast } from '@shared/components/ui/useToast';

const loginSchema = z.object({
  phone: z.string()
    .min(10, { message: 'Phone number must be exactly 10 digits' })
    .max(10, { message: 'Phone number must be exactly 10 digits' })
    .regex(/^[6-9]/, { message: 'Phone number must start with 6, 7, 8, or 9' })
    .regex(/^[0-9]+$/, { message: 'Phone number must contain only numbers' })
});

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const res = await authService.sendOtp(data.phone);
    setLoading(false);
    if (res.success) {
      toast(res.message, 'success');
      navigate('/otp', { state: { phone: data.phone } });
    } else {
      toast(res.error, 'error');
    }
  };

  const handleSkip = () => {
    // Log in as guest user
    const guestUser = {
      id: 'guest',
      name: 'Guest User',
      phone: '',
      walletBalance: 0,
      addresses: [],
      favourites: []
    };
    login(guestUser, 'guest-token-12345', false);
    toast('Logged in as Guest', 'info');
    navigate('/home');
  };

  return (
    <div className="flex-1 bg-bg flex flex-col justify-between p-6 min-h-screen">
      {/* Top Bar with Skip Link */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSkip}
          className="text-sm font-heading font-semibold text-text-secondary hover:text-brand transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Brand logo & header */}
      <div className="flex flex-col items-center mt-4 mb-6">
        <Logo size="md" className="mb-8" />
        <div className="text-center">
          <h2 className="font-heading font-extrabold text-2xl text-text-primary">
            Welcome to Amigos
          </h2>
          <p className="font-body text-xs text-text-secondary mt-1">
            Login / Sign up to continue
          </p>
        </div>
      </div>

      {/* Main input form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 flex-1 flex flex-col justify-center max-w-[360px] mx-auto w-full">
        <div className="flex items-start gap-2.5">
          {/* Static prefix dropdown */}
          <div className="w-20">
            <label className="font-heading font-medium text-xs text-text-secondary block mb-1.5">
              Prefix
            </label>
            <div className="bg-white border border-stone-300 rounded-input px-3 py-3 text-sm font-body text-text-primary text-center">
              +91
            </div>
          </div>
          
          {/* Main phone field */}
          <div className="flex-1">
            <Input
              label="Enter Mobile Number"
              placeholder="10-digit number"
              error={errors.phone?.message}
              disabled={loading}
              maxLength={10}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              {...register('phone')}
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={loading}
          className="py-3.5 mt-2"
        >
          {loading ? 'Please wait...' : 'Continue'}
        </Button>
      </form>

      {/* Policy Footer */}
      <footer className="text-center text-[10px] text-text-muted mt-6 leading-relaxed max-w-[280px] mx-auto font-body">
        By continuing, you agree to our <br />
        <Link to="#" className="underline font-semibold hover:text-brand">Terms & Conditions</Link> & <Link to="#" className="underline font-semibold hover:text-brand">Privacy Policy</Link>
      </footer>
    </div>
  );
};

export default Login;
