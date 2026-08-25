import axiosClient from './axiosClient';

export const authApi = {
  // Send 6-digit Brevo OTP (purpose: 'registration', 'forgot_password', 'booking_verification')
  sendOtp: (data) => axiosClient.post('/otp/send', data),

  // Verify OTP
  verifyOtp: (data) => axiosClient.post('/otp/verify', data),

  // Universal Login (Customer, Receptionist, Owner)
  login: (credentials) => axiosClient.post('/auth/login', credentials),

  // Register Customer
  registerCustomer: (customerData) =>
    axiosClient.post('/auth/register-customer', customerData),

  // Register Owner & Hotel (Atomic registration)
  registerOwner: (ownerData) =>
    axiosClient.post('/auth/register-owner', ownerData),
};