const express = require('express');
const router = express.Router();
const {
  createReceptionist,
  getReceptionists,
  deleteReceptionist,
  addRoom,
  getOwnerRooms,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
  getOwnerAnalytics,
} = require('../controllers/ownerController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// Staff Management Routes
router.post('/receptionist', protect(['owner']), createReceptionist);
router.get('/receptionist', protect(['owner']), getReceptionists);
router.delete('/receptionist/:id', protect(['owner']), deleteReceptionist);

// Room Inventory Management
router.get('/rooms', protect(['owner']), getOwnerRooms);
router.post('/rooms', protect(['owner']), upload.array('images', 5), addRoom);
router.put('/rooms/:id', protect(['owner']), updateRoom);
router.patch('/rooms/:id/status', protect(['owner']), updateRoomStatus);
router.delete('/rooms/:id', protect(['owner']), deleteRoom);

// Analytics
router.get('/analytics', protect(['owner']), getOwnerAnalytics);

module.exports = router;