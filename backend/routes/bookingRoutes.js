const express = require('express');
const router = express.Router();
const {
  getCustomerBookings,
  getPendingBookings,
  allotRoomAndConfirm,
  checkInGuest,
  checkOutGuest,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// Customer Routes
router.get('/my-bookings', protect(['customer']), getCustomerBookings);

// Receptionist & Owner Routes
router.get('/pending', protect(['receptionist', 'owner']), getPendingBookings);
router.put('/:bookingId/allot', protect(['receptionist', 'owner']), allotRoomAndConfirm);
router.put('/:bookingId/checkin', protect(['receptionist', 'owner']), checkInGuest);
router.put('/:bookingId/checkout', protect(['receptionist', 'owner']), checkOutGuest);

module.exports = router;