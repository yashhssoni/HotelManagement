const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: { 
    type: String, 
    unique: true, 
    required: true 
  },
  hotelId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Hotel', 
    required: true, 
    index: true 
  },
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  roomId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Room', 
    default: null // Null initially until Receptionist assigns a physical room
  },
  roomType: { 
    type: String, 
    required: true 
  },
  checkInDate: { 
    type: Date, 
    required: true 
  },
  checkOutDate: { 
    type: Date, 
    required: true 
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  // Razorpay Transaction Signatures
  razorpayOrderId: { 
    type: String, 
    required: true 
  },
  razorpayPaymentId: { 
    type: String, 
    default: null 
  },
  razorpaySignature: { 
    type: String, 
    default: null 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'], 
    default: 'pending' 
  },
  // Operational Status Lifecycle
  bookingStatus: { 
    type: String, 
    enum: ['pending_allotment', 'confirmed', 'checked_in', 'checked_out', 'cancelled'], 
    default: 'pending_allotment' 
  },
  allottedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  allottedAt: { 
    type: Date, 
    default: null 
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);