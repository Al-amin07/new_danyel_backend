import { Types } from "mongoose";

export interface ICompany extends Document {
  user: Types.ObjectId; // Reference to User
  companyName: string;
  companyAddress?: string;
  numberOfEmployees?: number;

  // Business hours (better as string in "HH:mm" format)
  startOperationHour?: string;
  endOperationHour?: string;

  paymentTerms?: 'perMile' | 'perKilo';

  // Address fields
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string; // might be useful

  // Preferences
  languagePreference?: string;
  timeZone?: string;
  currency?: string;
  dateFormat?: string; // e.g., "MM/DD/YYYY"
}

