const express = require('express');
const router = express.Router();
const {
  createReceptionist,
  addRoom,
  getOwnerRooms,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
  getOwnerAnalytics,
} = require('../controllers/ownerController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// Staff Management
router.post('/receptionist', protect(['owner']), createReceptionist);

// Room Inventory Management
router.get('/rooms', protect(['owner']), getOwnerRooms);
router.post('/rooms', protect(['owner']), upload.array('images', 5), addRoom);
router.put('/rooms/:id', protect(['owner']), updateRoom);
router.patch('/rooms/:id/status', protect(['owner']), updateRoomStatus);
router.delete('/rooms/:id', protect(['owner']), deleteRoom);

// Analytics
router.get('/analytics', protect(['owner']), getOwnerAnalytics);

module.exports = router;