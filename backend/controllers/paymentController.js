const razorpay = require('../config/razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');

// 1. Create Razorpay Order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    const options = {
      amount: amount * 100, // Amount in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ message: 'Unable to create Razorpay order' });
  }
};

// 2. Verify Payment Signature & Confirm Booking
exports.verifyPaymentAndBook = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      hotelId,
      roomType,
      checkInDate,
      checkOutDate,
      totalAmount,
    } = req.body;

    // Verify HMAC Signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature verification failed' });
    }

    const bookingId = `BK-${Date.now().toString().slice(-6)}`;

    const booking = await Booking.create({
      bookingId,
      hotelId,
      customerId: req.user.id,
      roomType,
      checkInDate,
      checkOutDate,
      totalAmount,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentStatus: 'paid',
      bookingStatus: 'pending_allotment',
    });

    res.status(201).json({
      message: 'Payment verified and booking registered successfully',
      booking,
    });
  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({ error: error.message });
  }
};