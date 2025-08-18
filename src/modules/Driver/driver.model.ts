import mongoose, { Schema } from 'mongoose';
import { IDriver } from './driver.interface';

const DriverSchema = new Schema<IDriver>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    licenseNumber: { type: String },
    vehicleType: { type: String },
    vehiclePlate: { type: String },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company' },

    // Optional fields for profile update
    nidOrPassport: {
      secure_url: { type: String },
      public_id: { type: String },
    },
    drivingLicense: {
      secure_url: { type: String },
      public_id: { type: String },
    },
    vehicleRegistration: {
      secure_url: { type: String },
      public_id: { type: String },
    },

    experience: { type: Number },
    otherInfo: { type: String }, // for any extra info
  },
  { timestamps: true },
);

export const Driver = mongoose.model<IDriver>('Driver', DriverSchema);
