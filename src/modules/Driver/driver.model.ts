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
    licenseNumber: { type: String, required: true },
    vehicleType: { type: String, required: true },
    vehiclePlate: { type: String, required: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  },
  { timestamps: true },
);

export const Driver = mongoose.model<IDriver>('Driver', DriverSchema);
