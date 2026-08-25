const express = require('express');
const router = express.Router();
const {
  createReceptionist,
  addRoom,
  getOwnerAnalytics,
} = require('../controllers/ownerController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.post('/receptionist', protect(['owner']), createReceptionist);
router.post('/rooms', protect(['owner']), upload.array('images', 5), addRoom);
router.get('/analytics', protect(['owner']), getOwnerAnalytics);

module.exports = router;