import { Types } from "mongoose";

export interface ICompany extends Document {
  user: Types.ObjectId; // Reference to User
  companyName: string;
  companyAddress?: string;
}
