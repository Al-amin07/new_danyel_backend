import { Schema, model } from 'mongoose';
import {
  IDriver,
  EVehicleType,
  EVehicleModel,
  EAvailability,
  ILocation,
  IFileType,
} from './driver.interface';

// Sub-schema for Location
const LocationSchema = new Schema<ILocation>({
  city: { type: String, required: true },
  street: { type: String, required: true },
  zipCode: { type: String, required: true },
});

const FileSchema = new Schema<IFileType>({
  secure_url: { type: String, required: true },
  type: { type: String, required: true },
});

const DriverSchema = new Schema<IDriver>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: LocationSchema, required: false },
    licenseNumber: { type: String },

    vehicleType: {
      type: String,
      enum: Object.values(EVehicleType),
    },
    vehicleModel: {
      type: String,
      enum: Object.values(EVehicleModel),
    },

    companyId: { type: Schema.Types.ObjectId, ref: 'Company' },

    availability: {
      type: String,
      enum: Object.values(EAvailability),
      default: EAvailability.FULL_TIME,
      required: true,
    },
    workingHours: { type: String, required: true, default: '9am - 5pm' },
    preferredDeliveryZones: [{ type: String }],

    nidOrPassport: { type: FileSchema },
    drivingLicense: { type: FileSchema },
    vehicleRegistration: { type: FileSchema },

    experience: { type: Number },
    otherInfo: { type: String },
  },
  {
    timestamps: true,
  },
);

export const Driver = model<IDriver>('Driver', DriverSchema);
