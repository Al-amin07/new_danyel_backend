import { Types, Document } from 'mongoose';

export interface IDriver extends Document {
  user: Types.ObjectId; // Reference to User
  licenseNumber?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  companyId?: Types.ObjectId; // Company this driver belongs to

  // Optional fields for profile updates
  nidOrPassport?: {
    secure_url: string;
    public_id: string;
  };
  drivingLicense?: {
    secure_url: string;
    public_id: string;
  };
  vehicleRegistration?: {
    secure_url: string;
    public_id: string;
  };

  experience?: number;
  otherInfo?: string; // any extra info

  createdAt?: Date;
  updatedAt?: Date;
}
