import { model, Schema } from "mongoose";
import { ICompany } from "./company.interface";

const companySchema = new Schema<ICompany>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    companyName: { type: String, required: true },
    companyAddress: { type: String },
    numberOfEmployees: { type: Number },

    // Business hours
    startOperationHour: { type: String }, // e.g., "09:00"
    endOperationHour: { type: String },   // e.g., "18:00"

    paymentTerms: { type: String, enum: ["perMile", "perKilo"] },

    // Address fields
    streetAddress: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String },

    // Preferences
    languagePreference: { type: String },
    timeZone: { type: String },
    currency: { type: String },
    dateFormat: { type: String }, // stored as string (like "MM/DD/YYYY")
  },
  { timestamps: true }
);

export const Company = model<ICompany>("Company", companySchema);