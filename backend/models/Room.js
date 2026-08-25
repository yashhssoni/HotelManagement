const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hotelId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Hotel', 
    required: true, 
    index: true 
  },
  roomNumber: { 
    type: String, 
    required: true, 
    trim: true 
  },
  roomType: { 
    type: String, 
    enum: ['Single', 'Double', 'Deluxe', 'Suite'], 
    required: true 
  },
  pricePerNight: { 
    type: Number, 
    required: true 
  },
  maxGuests: { 
    type: Number, 
    default: 2 
  },
  amenities: [{ 
    type: String 
  }],
  images: [{ 
    type: String // Cloudinary secure URLs
  }],
  status: { 
    type: String, 
    enum: ['available', 'occupied', 'cleaning', 'maintenance'], 
    default: 'available' 
  }
}, { timestamps: true });

// Prevent duplicate room numbers inside the same hotel
roomSchema.index({ hotelId: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);