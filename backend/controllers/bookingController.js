const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { sendBookingConfirmationEmail } = require('../utils/brevoService');

// Customer: Get My Bookings
exports.getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.id })
      .populate('hotelId', 'name address contactPhone')
      .populate('roomId', 'roomNumber roomType')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Receptionist & Owner: View All Pending Bookings for Hotel
exports.getPendingBookings = async (req, res) => {
  try {
    const hotelIdentifier = req.user.hotelId || req.user.id;

    const bookings = await Booking.find({
      $or: [{ hotelId: hotelIdentifier }, { hotelId: req.user.hotelId }, { hotelId: req.user.id }],
      bookingStatus: 'pending_allotment',
    })
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Receptionist & Owner: Live Occupancy / Active Bookings
exports.getActiveBookings = async (req, res) => {
  try {
    const hotelIdentifier = req.user.hotelId || req.user.id;

    const bookings = await Booking.find({
      $or: [{ hotelId: hotelIdentifier }, { hotelId: req.user.hotelId }, { hotelId: req.user.id }],
      bookingStatus: { $in: ['confirmed', 'checked_in'] },
    })
      .populate('customerId', 'name email phone')
      .populate('roomId', 'roomNumber roomType pricePerNight')
      .sort({ updatedAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Receptionist & Owner: Get Available Vacant Rooms for Allotment Modal
exports.getAvailableRooms = async (req, res) => {
  try {
    const { roomType } = req.query;
    const hotelIdentifier = req.user.hotelId || req.user.id;

    const filter = {
      $or: [{ hotelId: hotelIdentifier }, { hotelId: req.user.hotelId }, { hotelId: req.user.id }],
      status: 'available',
    };

    if (roomType) {
      filter.roomType = new RegExp(`^${roomType.trim()}$`, 'i');
    }

    const rooms = await Room.find(filter).sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Receptionist & Owner: View Full Hotel Room Inventory Directory
exports.getHotelRoomInventory = async (req, res) => {
  try {
    const hotelIdentifier = req.user.hotelId || req.user.id;

    const filter = {
      $or: [{ hotelId: hotelIdentifier }, { hotelId: req.user.hotelId }, { hotelId: req.user.id }],
    };

    const rooms = await Room.find(filter).sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Receptionist & Owner: Allot Room Number & Trigger Confirmation Email
exports.allotRoomAndConfirm = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { roomId } = req.body;

    const room = await Room.findById(roomId);
    if (!room || room.status !== 'available') {
      return res.status(400).json({ message: 'Selected room is unavailable' });
    }

    const booking = await Booking.findById(bookingId).populate('customerId', 'name email');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.roomId = roomId;
    booking.bookingStatus = 'confirmed';
    booking.allottedBy = req.user.id;
    booking.allottedAt = new Date();
    await booking.save();

    room.status = 'occupied';
    await room.save();

    // Trigger Brevo Confirmation Email
    sendBookingConfirmationEmail({
      customerEmail: booking.customerId.email,
      customerName: booking.customerId.name,
      bookingId: booking.bookingId,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      checkInDate: booking.checkInDate,
      totalAmount: booking.totalAmount,
    }).catch((err) => console.error('Brevo Email Dispatch Failed:', err.message));

    res.json({ message: 'Room allotted and confirmation email dispatched', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Receptionist & Owner: Check-in Guest
exports.checkInGuest = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { bookingStatus: 'checked_in' },
      { new: true }
    );
    res.json({ message: 'Guest checked in', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Receptionist & Owner: Check-out Guest & Release Room
exports.checkOutGuest = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.bookingStatus = 'checked_out';
    await booking.save();

    if (booking.roomId) {
      await Room.findByIdAndUpdate(booking.roomId, { status: 'cleaning' });
    }

    res.json({ message: 'Guest checked out and room moved to cleaning', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};