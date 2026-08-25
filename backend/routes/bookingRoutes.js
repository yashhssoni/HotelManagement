const express = require('express');
const router = express.Router();
const {
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

// Customer Routes
router.get('/my-bookings', protect(['customer']), getCustomerBookings);

// Receptionist & Owner Operations
router.get('/pending', protect(['receptionist', 'owner']), getPendingBookings);
router.get('/active', protect(['receptionist', 'owner']), getActiveBookings);
router.get('/available-rooms', protect(['receptionist', 'owner']), getAvailableRooms);
router.get('/all-rooms', protect(['receptionist', 'owner']), getHotelRoomInventory);

router.put('/:bookingId/allot', protect(['receptionist', 'owner']), allotRoomAndConfirm);
router.put('/:bookingId/checkin', protect(['receptionist', 'owner']), checkInGuest);
router.put('/:bookingId/checkout', protect(['receptionist', 'owner']), checkOutGuest);

module.exports = router;