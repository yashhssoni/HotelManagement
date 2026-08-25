import axiosClient from './axiosClient';

export const customerApi = {
  // Fetch available rooms for booking
  getAvailableRooms: () => axiosClient.get('/bookings/available-rooms'),

  // Step 1: Create Razorpay Order
  createRazorpayOrder: (orderPayload) =>
    axiosClient.post('/payments/create-order', orderPayload),

  // Step 2: Verify Razorpay Signature & Save Confirmed Booking
  verifyPaymentAndBook: (paymentData) =>
    axiosClient.post('/payments/verify-and-book', paymentData),

  // Get current user's booking history
  getMyBookings: () => axiosClient.get('/bookings/my-bookings'),
};