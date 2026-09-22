import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['STUDENT', 'ADMIN'], default: 'STUDENT' },
    studentId: { type: String, trim: true },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    avatar: { type: String },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

export const User = mongoose.model('User', userSchema);
