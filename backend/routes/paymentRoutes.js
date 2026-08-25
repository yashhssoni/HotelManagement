const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPaymentAndBook,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-order', protect(['customer']), createRazorpayOrder);
router.post('/verify-and-book', protect(['customer']), verifyPaymentAndBook);

module.exports = router;