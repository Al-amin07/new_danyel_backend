import { Types } from 'mongoose';

export interface IDriver extends Document {
  user: Types.ObjectId; // Reference to User
  licenseNumber: string;
  vehicleType: string;
  vehiclePlate: string;
  company: Types.ObjectId; // Company this driver belongs to
}
