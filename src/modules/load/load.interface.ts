import { Types } from "mongoose";

// Address Type
export interface IAddress {
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: number;
  country: string;
}


export interface IDocument {
  type: string;     
  url: string;
}

export interface ILoad {
  loadId: string;
  quantity: number;
  weight: number;
  loadType: string;
  specialInstructions?: string;

  pickupAddress: IAddress;
  deliveryAddress: IAddress;

  pickupDate?: Date;
  pickupTime?: string;
  deliveryDate?: Date;
  deliveryTime?: string;

  totalDistance: number;
  ratePerMile: number;
  totalPayment: number;

  paymentStatus: "PENDING" | "PAID" | "FAILED";
  customerNotes?: string;
  paymentDate?: Date;

  assignedDriver?: Types.ObjectId;

  documents: IDocument[];

}
