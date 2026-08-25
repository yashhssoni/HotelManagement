import axiosClient from './axiosClient';

export const receptionistApi = {
  // Fetch all pending bookings requiring room allotment
  getPendingBookings: () => axiosClient.get('/bookings/pending'),

  // Allot Room Number and trigger Brevo confirmation email to guest
  allotRoom: (bookingId, roomId) =>
    axiosClient.put(`/bookings/${bookingId}/allot`, { roomId }),

  // Check In Guest
  checkInGuest: (bookingId) =>
    axiosClient.put(`/bookings/${bookingId}/checkin`),

  // Check Out Guest and mark room for cleaning
  checkOutGuest: (bookingId) =>
    axiosClient.put(`/bookings/${bookingId}/checkout`),
};