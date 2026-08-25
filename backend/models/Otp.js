const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true,
    index: true 
  },
  phone: { 
    type: String, 
    default: null 
  },
  otp: { 
    type: String, 
    required: true 
  },
  purpose: { 
    type: String, 
    enum: ['registration', 'forgot_password', 'booking_verification'], 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 300 // Automatically deletes the document from MongoDB after 5 minutes (300s)
  }
});

module.exports = mongoose.model('Otp', otpSchema);