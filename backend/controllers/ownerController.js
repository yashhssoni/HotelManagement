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
    
    const images = req.files ? req.files.map((file) => file.path) : [];

    const room = await Room.create({
      hotelId: req.user.hotelId,
      roomNumber,
      roomType,
      pricePerNight,
      maxGuests: maxGuests || 2,
      amenities: amenities ? (typeof amenities === 'string' ? JSON.parse(amenities) : amenities) : [],
      images,
    });

    res.status(201).json({ message: 'Room created successfully', room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Get All Owner Rooms (Filtered by hotelId)
exports.getOwnerRooms = async (req, res) => {
  try {
    const hotelId = req.user.hotelId;
    const rooms = await Room.find({ hotelId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: rooms.length, rooms });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Update / Modify Room Details
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { roomNumber, roomType, pricePerNight, maxGuests, amenities, status } = req.body;

    let updateData = {};
    if (roomNumber) updateData.roomNumber = roomNumber;
    if (roomType) updateData.roomType = roomType;
    if (pricePerNight) updateData.pricePerNight = Number(pricePerNight);
    if (maxGuests) updateData.maxGuests = Number(maxGuests);
    if (status) updateData.status = status;

    if (amenities) {
      updateData.amenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
    }

    const updatedRoom = await Room.findOneAndUpdate(
      { _id: id, hotelId: req.user.hotelId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found or unauthorized' });
    }

    res.status(200).json({ message: 'Room updated successfully', room: updatedRoom });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Update Room Operational Status (available / occupied / maintenance / cleaning)
exports.updateRoomStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['available', 'occupied', 'maintenance', 'cleaning'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const room = await Room.findOneAndUpdate(
      { _id: id, hotelId: req.user.hotelId },
      { status },
      { new: true }
    );

    if (!room) {
      return res.status(404).json({ message: 'Room not found or unauthorized' });
    }

    res.status(200).json({ message: `Room status updated to ${status}`, room });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. Delete Room from Inventory
exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findOneAndDelete({ _id: id, hotelId: req.user.hotelId });

    if (!room) {
      return res.status(404).json({ message: 'Room not found or unauthorized' });
    }

    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 7. Get Owner Analytics Dashboard Data
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
// Get All Receptionists working under this Hotel
exports.getReceptionists = async (req, res) => {
  try {
    const hotelIdentifier = req.user.hotelId || req.user.id;

    const staffList = await User.find({
      role: 'receptionist',
      $or: [{ hotelId: hotelIdentifier }, { hotelId: req.user.hotelId }, { hotelId: req.user.id }],
    })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: staffList.length, staff: staffList });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete / Remove Receptionist Account
exports.deleteReceptionist = async (req, res) => {
  try {
    const { id } = req.params;
    const hotelIdentifier = req.user.hotelId || req.user.id;

    const staff = await User.findOneAndDelete({
      _id: id,
      role: 'receptionist',
      $or: [{ hotelId: hotelIdentifier }, { hotelId: req.user.hotelId }, { hotelId: req.user.id }],
    });

    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found or unauthorized' });
    }

    res.status(200).json({ message: 'Receptionist removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};