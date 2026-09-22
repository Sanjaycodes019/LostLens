import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { signToken } from '../middleware/auth.js';
import { config } from '../config/index.js';

const cookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, studentId, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashed, studentId, phone, role: 'STUDENT' });

  const token = signToken(user._id);
  res.cookie('token', token, cookieOptions);

  res.status(201).json({
    success: true,
    data: {
      user: { id: user._id, name: user.name, email: user.email, role: user.role, studentId: user.studentId },
      token,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.isActive) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

  const token = signToken(user._id);
  res.cookie('token', token, cookieOptions);

  res.json({
    success: true,
    data: {
      user: { id: user._id, name: user.name, email: user.email, role: user.role, studentId: user.studentId },
      token,
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out' });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      studentId: req.user.studentId,
      phone: req.user.phone,
    },
  });
});
