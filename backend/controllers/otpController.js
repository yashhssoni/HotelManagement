const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../utils/brevoService');

// Send 6-Digit OTP
exports.sendOtp = async (req, res) => {
  try {
    const { email, purpose, phone } = req.body;
    if (!email || !purpose) {
      return res.status(400).json({ message: 'Email and purpose are required.' });
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Clear old OTPs for this email and purpose
    await Otp.deleteMany({ email, purpose });

    await Otp.create({ email, phone, otp: generatedOtp, purpose });
    await sendOtpEmail(email, generatedOtp, purpose);

    res.status(200).json({ success: true, message: 'OTP sent successfully to email.' });
  } catch (error) {
    console.error('OTP Send Error:', error);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    const record = await Otp.findOne({ email, otp, purpose });
    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    await Otp.deleteOne({ _id: record._id });
    res.status(200).json({ success: true, message: 'OTP verified successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};