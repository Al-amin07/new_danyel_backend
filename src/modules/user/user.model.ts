import bcrypt from 'bcrypt';
import mongoose, { Schema, model } from 'mongoose';
import { TProfile, TUser } from './user.interface';
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
  },
  { timestamps: true },
);

const ProfileSchema = new Schema<TProfile>(
  {
    fullName: { type: String, required: false, default: 'user' },
    phone: { type: String, required: false, unique: false },
    email: { type: String, required: false, unique: false },

    img: { type: String, default: null },
    age: { type: Number, required: false, default: null },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: false,
      default: null,
    },
    hight: { type: Number, required: false, default: null },
    weight: { type: Number, required: false, default: null },
    recidenceArea: { type: String, required: false, default: null },

    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Hash only if password is modified

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    return next(error);
  }
});

export const User = mongoose.model('User', UserSchema);
export const Profile = model('Profile', ProfileSchema);
