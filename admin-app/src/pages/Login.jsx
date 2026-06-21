import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { Lock, Mail, Loader2, Sparkles } from 'lucide-react';
import { Logo } from '@shared/components/ui/Logo';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const { addToast } = useUiStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      addToast('Please fill in all fields', 'error');
      return;
    }
    const res = await login(email, password);
    if (res.success) {
      addToast('Logged in successfully!', 'success');
      const userRole = useAuthStore.getState().role;
      if (userRole === 'corporate') navigate('/hq');
      else if (userRole === 'franchise') navigate('/franchise');
      else if (userRole === 'store') navigate('/store');
    }
  };

  const handleQuickLogin = async (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    setTimeout(async () => {
      const res = await login(quickEmail, quickPassword);
      if (res.success) {
        addToast('Logged in successfully!', 'success');
        const userRole = useAuthStore.getState().role;
        if (userRole === 'corporate') navigate('/hq');
        else if (userRole === 'franchise') navigate('/franchise');
        else if (userRole === 'store') navigate('/store');
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md md:max-w-4xl bg-white border border-border rounded-card shadow-xl overflow-hidden flex flex-col md:flex-row">
        <div className="hidden md:flex md:w-1/2 bg-dark text-white p-8 flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-brand/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-gold/25 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <span className="font-display font-bold text-3xl text-gold tracking-wide">Amigos</span>
            <p className="text-[10px] text-white/50 tracking-wider font-heading uppercase mt-1">
              Admin & Operations Console
            </p>
          </div>

          <div className="my-10 relative z-10 space-y-4">
            <h2 className="font-display font-semibold text-2xl text-white leading-snug">
              Control your restaurant network in real time.
            </h2>
            <p className="text-xs font-body text-white/60 leading-relaxed">
              HQ menu coordination, regional franchise overrides, live counter orders, and delivery mapping in one unified tablet-ready layout.
            </p>
          </div>

          <div className="relative z-10 text-[10px] font-body text-white/40">
            © 2026 Amigos Ltd. All rights reserved.
          </div>
        </div>

        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
          <div className="mb-6 flex flex-col items-center md:items-start">
            <Logo size="sm" className="mb-4 self-center md:self-start" />
            <h3 className="font-heading font-bold text-xl text-text-primary">Welcome Back</h3>
            <p className="text-xs font-body text-text-secondary mt-1">Please enter your credentials to log in.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-danger/10 text-danger rounded-input text-xs font-body">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-heading font-semibold text-text-secondary uppercase">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@amigos.in"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-heading font-semibold text-text-secondary uppercase">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-input focus:outline-none focus:border-brand font-body"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-brand hover:bg-brand-accent text-white font-heading font-semibold rounded-pill text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Log In</span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center gap-1.5 mb-3 text-text-secondary font-heading font-semibold text-[10px] uppercase">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>Demo Quick Login</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('hq@amigos.in', 'admin123')}
                className="py-2 px-1 bg-red-50 hover:bg-red-100 text-brand border border-brand/10 text-[9px] font-heading font-bold rounded-card transition-colors cursor-pointer"
              >
                HQ Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('franchise@amigos.in', 'admin123')}
                className="py-2 px-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-gold/10 text-[9px] font-heading font-bold rounded-card transition-colors cursor-pointer"
              >
                Franchise Owner
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('store@amigos.in', 'admin123')}
                className="py-2 px-1 bg-green-50 hover:bg-green-100 text-success border border-success/10 text-[9px] font-heading font-bold rounded-card transition-colors cursor-pointer"
              >
                Store Manager
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
