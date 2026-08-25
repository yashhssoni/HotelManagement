const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' }
  },
  contactEmail: { 
    type: String, 
    required: true, 
    lowercase: true,
    trim: true
  },
  contactPhone: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  amenities: [{ 
    type: String 
  }],
  images: [{ 
    type: String // Cloudinary secure image URLs
  }],
  policies: {
    checkInTime: { type: String, default: '12:00 PM' },
    checkOutTime: { type: String, default: '11:00 AM' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Hotel', hotelSchema);