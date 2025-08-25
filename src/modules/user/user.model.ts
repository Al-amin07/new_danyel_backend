import bcrypt from 'bcrypt';
import mongoose, { Schema, model } from 'mongoose';
import { TUser } from './user.interface';
import { userRole } from '../../constents';

const UserSchema = new Schema<TUser>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'company', 'driver'],
      required: true,
      default: userRole.company,
    },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isProfileUpdate: { type: Boolean, default: false },
    emailVerificationCode: { type: String },
    emailVerificationExpires: { type: Date },
    forgetPasswordCode: { type: String },
    forgetPasswordExpires: { type: Date },
    passwordChangeTime: { type: Date },
    lastLoggedin: { type: Date },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const User = mongoose.model('User', UserSchema);
