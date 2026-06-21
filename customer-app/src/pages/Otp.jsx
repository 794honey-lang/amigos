import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@shared/components/ui/Button';
import { authService } from '@shared/services/authService';
import { useAuthStore } from '@shared/store/authStore';
import { useToast } from '@shared/components/ui/useToast';

export const Otp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const { toast } = useToast();
  
  const phone = location.state?.phone || '9876543210';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  
  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto-submit on 6th digit
  useEffect(() => {
    const fullOtp = otp.join('');
    if (fullOtp.length === 6) {
      handleSubmitOtp(fullOtp);
    }
  }, [otp]);

  const handleChange = (element, index) => {
    const value = element.value;
    if (isNaN(value)) return; // Allow numbers only
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // Keep last char
    setOtp(newOtp);

    // Focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        // Focus previous input if empty
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      } else {
        // Clear current index
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (pasteData.length === 6 && /^\d+$/.test(pasteData)) {
      const pasteArray = pasteData.split('');
      setOtp(pasteArray);
      inputRefs.current[5].focus();
    }
  };

  const handleSubmitOtp = async (codeToSubmit) => {
    const finalCode = codeToSubmit || otp.join('');
    if (finalCode.length < 6) {
      toast('Please enter the full 6-digit OTP code', 'error');
      return;
    }

    setLoading(true);
    const res = await authService.verifyOtp(phone, finalCode);
    setLoading(false);

    if (res.success) {
      login(res.user, res.token, false);
      toast('Verification successful!', 'success');
      navigate('/home');
    } else {
      toast(res.error, 'error');
      // Reset OTP inputs on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    const res = await authService.sendOtp(phone);
    setLoading(false);
    
    if (res.success) {
      toast('Verification code resent!', 'success');
      setCountdown(30);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } else {
      toast(res.error, 'error');
    }
  };

  return (
    <div className="flex-1 bg-bg flex flex-col justify-between p-6 min-h-screen">
      {/* Back Button */}
      <div className="flex items-center pt-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-stone-100 transition-colors text-text-secondary"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Title block */}
      <div className="text-center my-6">
        <h2 className="font-heading font-extrabold text-2xl text-text-primary">
          Verify Phone
        </h2>
        <p className="font-body text-xs text-text-secondary mt-2 max-w-[280px] mx-auto leading-relaxed">
          We have sent a 6-digit verification code to <br />
          <span className="font-semibold text-brand text-sm">+91 {phone}</span>
        </p>
      </div>

      {/* OTP Input Boxes */}
      <div className="flex-1 flex flex-col justify-center max-w-[320px] mx-auto w-full space-y-8">
        <div className="flex items-center justify-between gap-2.5">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              disabled={loading}
              className="w-12 h-14 border border-stone-300 rounded-input bg-white text-center font-heading font-bold text-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all disabled:opacity-50"
            />
          ))}
        </div>

        {/* Action Button */}
        <Button
          onClick={() => handleSubmitOtp()}
          variant="primary"
          fullWidth
          disabled={loading || otp.join('').length < 6}
          className="py-3.5"
        >
          {loading ? 'Verifying...' : 'Verify & Proceed'}
        </Button>

        {/* Resend Action */}
        <div className="text-center text-xs font-body text-text-secondary">
          {countdown > 0 ? (
            <span>Resend code in <strong className="text-brand">{countdown}s</strong></span>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading}
              className="font-heading font-bold text-brand hover:text-brand-accent underline transition-colors"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>

      {/* Spacing alignment helper */}
      <div className="h-10" />
    </div>
  );
};

export default Otp;
