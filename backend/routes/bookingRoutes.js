const express = require('express');
const router = express.Router();
const {
  getSingleHotelDetails,
  getExploreHotels,
  getCustomerBookings,
  getPendingBookings,
  getActiveBookings,
  getAvailableRooms,
  getHotelRoomInventory,
  allotRoomAndConfirm,
  checkInGuest,
  checkOutGuest,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// Single Hotel & Customer Routes
router.get('/hotel-details', protect(['customer', 'receptionist', 'owner']), getSingleHotelDetails);
router.get('/explore-hotels', protect(['customer', 'owner', 'receptionist']), getExploreHotels);
router.get('/my-bookings', protect(['customer']), getCustomerBookings);
router.get('/available-rooms', protect(['customer', 'receptionist', 'owner']), getAvailableRooms);

// Receptionist & Owner Desk Routes
router.get('/pending', protect(['receptionist', 'owner']), getPendingBookings);
router.get('/active', protect(['receptionist', 'owner']), getActiveBookings);
router.get('/all-rooms', protect(['receptionist', 'owner']), getHotelRoomInventory);

router.put('/:bookingId/allot', protect(['receptionist', 'owner']), allotRoomAndConfirm);
router.put('/:bookingId/checkin', protect(['receptionist', 'owner']), checkInGuest);
router.put('/:bookingId/checkout', protect(['receptionist', 'owner']), checkOutGuest);

module.exports = router;