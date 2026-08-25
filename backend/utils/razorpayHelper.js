const crypto = require('crypto');

// Verify Razorpay HMAC SHA256 Signature
exports.validateRazorpaySignature = (orderId, paymentId, signature) => {
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};

// Convert INR Rupees to Paise (e.g., Rs 1500 -> 150000 paise)
exports.convertToPaise = (amountInRupees) => {
  return Math.round(Number(amountInRupees) * 100);
};