const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const { sendBookingConfirmationEmail } = require('../utils/brevoService');

// 1. Customer: Get Dedicated Single Hotel Details with Available Rooms
exports.getSingleHotelDetails = async (req, res) => {
  try {
    let hotel = await Hotel.findOne({ isActive: { $ne: false } }).lean();

    // Fallback: Agar database me hotel record nahi bana ho toh first available ya dummy structure load karein
    if (!hotel) {
      const anyHotel = await Hotel.findOne().lean();
      if (anyHotel) {
        hotel = anyHotel;
      } else {
        hotel = {
          name: 'GrandStay Luxury Hotel & Resort',
          address: {
            street: 'Main City Center Boulevard',
            city: 'Bhopal',
            state: 'Madhya Pradesh',
            pincode: '462001',
          },
          contactPhone: '+91 9876543210',
          contactEmail: 'desk@grandstay.com',
          images: [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
          ],
        };
      }
    }

    const { roomType } = req.query;
    let roomFilter = { status: 'available' };

    if (hotel._id) {
      roomFilter.hotelId = hotel._id;
    }

    if (roomType && roomType !== 'All') {
      roomFilter.roomType = new RegExp(`^${roomType.trim()}$`, 'i');
    }

    const availableRooms = await Room.find(roomFilter).sort({ pricePerNight: 1, roomNumber: 1 });

    res.status(200).json({
      hotel,
      availableRooms,
      totalVacant: availableRooms.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Customer: Explore All Active Hotels with Live Minimum Pricing & Available Counts
exports.getExploreHotels = async (req, res) => {
  try {
    let hotels = [];
    if (Hotel) {
      hotels = await Hotel.find({ isActive: { $ne: false } }).lean();
    }

    if (!hotels || hotels.length === 0) {
      const distinctHotelIds = await Room.distinct('hotelId');
      hotels = distinctHotelIds.map((id) => ({
        _id: id,
        name: 'GrandStay Luxury Hotel & Resort',
        address: 'Main City Center Boulevard',
        city: 'Prime Location',
      }));
    }

    const populatedHotels = await Promise.all(
      hotels.map(async (hotel) => {
        const availableRooms = await Room.find({
          hotelId: hotel._id,
          status: 'available',
        });

        const minPrice =
          availableRooms.length > 0
            ? Math.min(...availableRooms.map((r) => r.pricePerNight))
            : 1500;

        return {
          ...hotel,
          availableCount: availableRooms.length,
          startingPrice: minPrice,
        };
      })
    );

    res.status(200).json(populatedHotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Customer, Receptionist & Owner: Get Available Vacant Rooms (Hotel & Category Filtered)
exports.getAvailableRooms = async (req, res) => {
  try {
    const { roomType, hotelId } = req.query;
    let filter = { status: 'available' };

    const targetHotelId = hotelId || (req.user && req.user.hotelId);
    if (targetHotelId) {
      filter.$or = [{ hotelId: targetHotelId }, { hotelId: req.user.id }];
    }

    if (roomType && roomType !== 'All') {
      filter.roomType = new RegExp(`^${roomType.trim()}$`, 'i');
    }

    const rooms = await Room.find(filter).sort({ pricePerNight: 1, roomNumber: 1 });
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Customer: Get My Bookings
exports.getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.id })
      .populate('hotelId', 'name address contactPhone')
      .populate('roomId', 'roomNumber roomType pricePerNight')
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Receptionist & Owner: View All Pending Bookings for Hotel
exports.getPendingBookings = async (req, res) => {
  try {
    const hotelIdentifier = req.user.hotelId || req.user.id;

    const bookings = await Booking.find({
      $or: [{ hotelId: hotelIdentifier }, { hotelId: req.user.hotelId }, { hotelId: req.user.id }],
      bookingStatus: 'pending_allotment',
    })
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. Receptionist & Owner: Live Occupancy / Active Bookings
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

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 7. Receptionist & Owner: View Full Hotel Room Inventory Directory
exports.getHotelRoomInventory = async (req, res) => {
  try {
    const hotelIdentifier = req.user.hotelId || req.user.id;

    const filter = {
      $or: [{ hotelId: hotelIdentifier }, { hotelId: req.user.hotelId }, { hotelId: req.user.id }],
    };

    const rooms = await Room.find(filter).sort({ roomNumber: 1 });
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 8. Receptionist & Owner: Allot Room Number & Trigger Confirmation Email
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

    sendBookingConfirmationEmail({
      customerEmail: booking.customerId.email,
      customerName: booking.customerId.name,
      bookingId: booking.bookingId,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      checkInDate: booking.checkInDate,
      totalAmount: booking.totalAmount,
    }).catch((err) => console.error('Brevo Email Dispatch Failed:', err.message));

    res.status(200).json({ message: 'Room allotted and confirmation email dispatched', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 9. Receptionist & Owner: Check-in Guest
exports.checkInGuest = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { bookingStatus: 'checked_in' },
      { new: true }
    );
    res.status(200).json({ message: 'Guest checked in', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 10. Receptionist & Owner: Check-out Guest & Release Room
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

    res.status(200).json({ message: 'Guest checked out and room moved to cleaning', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};