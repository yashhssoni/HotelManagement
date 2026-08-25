const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// 1. Create Receptionist Account
exports.createReceptionist = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const receptionist = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'receptionist',
      hotelId: req.user.hotelId,
    });

    res.status(201).json({
      message: 'Receptionist account created successfully',
      receptionist: { id: receptionist._id, name: receptionist.name, email: receptionist.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Add Room (Accepts uploaded Cloudinary image URLs)
exports.addRoom = async (req, res) => {
  try {
    const { roomNumber, roomType, pricePerNight, maxGuests, amenities } = req.body;
    
    // Extract uploaded Cloudinary file paths from Multer
    const images = req.files ? req.files.map((file) => file.path) : [];

    const room = await Room.create({
      hotelId: req.user.hotelId,
      roomNumber,
      roomType,
      pricePerNight,
      maxGuests: maxGuests || 2,
      amenities: amenities ? JSON.parse(amenities) : [],
      images,
    });

    res.status(201).json({ message: 'Room created successfully', room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Get Owner Analytics Dashboard Data
exports.getOwnerAnalytics = async (req, res) => {
  try {
    const hotelId = req.user.hotelId;
    const hotelObjectId = new mongoose.Types.ObjectId(hotelId);

    const totalRooms = await Room.countDocuments({ hotelId });
    const occupiedRooms = await Room.countDocuments({ hotelId, status: 'occupied' });
    const cleaningRooms = await Room.countDocuments({ hotelId, status: 'cleaning' });
    const totalBookings = await Booking.countDocuments({ hotelId });

    const revenueResult = await Booking.aggregate([
      { $match: { hotelId: hotelObjectId, paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0;

    res.json({
      totalRevenue,
      totalRooms,
      occupiedRooms,
      cleaningRooms,
      availableRooms: totalRooms - (occupiedRooms + cleaningRooms),
      occupancyRate: `${occupancyRate}%`,
      totalBookings,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};