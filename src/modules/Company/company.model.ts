import mongoose, { Schema } from 'mongoose';
import { ICompany } from './company.interface';

const CompanySchema = new Schema<ICompany>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: { type: String, required: true },
    companyAddress: { type: String },
  },
  { timestamps: true },
);

export const Company = mongoose.model<ICompany>('Company', CompanySchema);
