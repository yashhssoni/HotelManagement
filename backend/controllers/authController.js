const User = require('../models/User');
const Hotel = require('../models/Hotel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Owner & Hotel Atomic Registration
exports.registerOwner = async (req, res) => {
  const session = await User.startSession();
  session.startTransaction();
  try {
    const { name, email, password, phone, hotelName, hotelAddress, contactPhone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const owner = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'owner',
    });
    await owner.save({ session });

    const hotel = new Hotel({
      name: hotelName,
      ownerId: owner._id,
      contactEmail: email,
      contactPhone: contactPhone || phone,
      address: hotelAddress || {},
    });
    await hotel.save({ session });

    owner.hotelId = hotel._id;
    await owner.save({ session });

    await session.commitTransaction();
    session.endSession();

    const token = jwt.sign(
      { id: owner._id, role: owner.role, hotelId: hotel._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Owner and Hotel registered successfully',
      token,
      user: { id: owner._id, name: owner.name, role: owner.role, hotelId: hotel._id },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: err.message });
  }
};

// 2. Customer Registration
exports.registerCustomer = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const customer = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'customer',
    });

    const token = jwt.sign(
      { id: customer._id, role: customer.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Customer registered successfully',
      token,
      user: { id: customer._id, name: customer.name, role: customer.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Universal Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, hotelId: user.hotelId || null },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hotelId: user.hotelId,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};