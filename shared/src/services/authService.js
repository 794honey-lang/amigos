import { mockCustomerUser, mockStaffUser } from '../mocks/mockUser';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const API_URL = 'http://localhost:5050/api';

export const authService = {
  async sendOtp(phone) {
    // Simple 10 digit validation
    if (!phone || phone.length < 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number' };
    }
    return { success: true, message: 'OTP sent successfully to +91 ' + phone };
  },

  async verifyOtp(phone, otp) {
    if (!otp || otp.length !== 6) {
      return { success: false, error: 'Invalid OTP. Please enter a 6-digit code.' };
    }
    
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      if (data.success) {
        return {
          success: true,
          token: data.token,
          user: data.user
        };
      }
      return { success: false, error: data.error || 'Verification failed' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async loginWithGoogle() {
    await delay(500);
    return {
      success: true,
      token: 'mock-google-jwt-token-xyz',
      user: mockCustomerUser
    };
  },

  async staffLogin(phone, password) {
    await delay(400);
    if (!phone || !password) {
      return { success: false, error: 'Mobile number and password are required' };
    }
    
    // In mock mode, any credentials work, but let's return the mock staff user
    return {
      success: true,
      token: 'mock-staff-jwt-token-999',
      user: {
        ...mockStaffUser,
        phone: phone
      }
    };
  }
};
