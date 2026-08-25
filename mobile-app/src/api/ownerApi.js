import axiosClient from './axiosClient';

export const ownerApi = {
  // Fetch Owner dashboard metrics (Revenue, Occupancy, Room counts)
  getAnalytics: () => axiosClient.get('/owner/analytics'),

  // Create / Onboard Receptionist staff
  createReceptionist: (staffData) =>
    axiosClient.post('/owner/receptionist', staffData),

  // Add Room with Cloudinary image upload (Multipart FormData)
  addRoom: (formData) =>
    axiosClient.post('/owner/rooms', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};