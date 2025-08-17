import { Types } from "mongoose";

export interface ICompany extends Document {
  user: Types.ObjectId; // Reference to User
  companyName: string;
  companyAddress?: string;
  numberOfEmployee?: number;
  StartOperationHour?: Date;
  EndOperationHour?: Date;
  paymentTerms?: 'pre mile' | 'pre kilo'
}
