import { mockCustomerUser, mockStaffUser } from '../mocks/mockUser';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  async sendOtp(phone) {
    await delay(300);
    // Simple 10 digit validation
    if (!phone || phone.length < 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number' };
    }
    return { success: true, message: 'OTP sent successfully to +91 ' + phone };
  },

  async verifyOtp(phone, otp) {
    await delay(500);
    if (!otp || otp.length !== 6) {
      return { success: false, error: 'Invalid OTP. Please enter a 6-digit code.' };
    }
    
    // Any 6 digits succeed in mock mode
    const user = {
      ...mockCustomerUser,
      phone: phone
    };
    
    return {
      success: true,
      token: 'mock-jwt-token-12345',
      user
    };
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
