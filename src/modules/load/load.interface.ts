import { Types } from 'mongoose';

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

enum ELoadStatus {
  'Pending Assignment',
  'In Transit',
  'At Pickup',
  'En Route to Pickup',
  'Delivered',
}
export interface ICustomer {
  name: string;
  email: string;
  phone?: string;
}

export interface ILoad {
  loadId: string;
  quantity: number;
  weight: number;
  loadType: string;
  specialInstructions?: string;

  loadStatus:
    | 'Pending Assignment'
    | 'In Transit'
    | 'At Pickup'
    | 'En Route to Pickup'
    | 'Delivered';

  pickupAddress: IAddress;
  deliveryAddress: IAddress;

  pickupDate?: Date;
  pickupTime?: string;
  deliveryDate?: Date;
  deliveryTime?: string;

  totalDistance: number;
  ratePerMile: number;
  totalPayment: number;

  paymentStatus: 'PENDING' | 'PAID' | 'REJECTED';
  customerNotes?: string;
  paymentDate?: Date;
  companyId: string;
  assignedDriver?: Types.ObjectId;

  customer: ICustomer;

  documents: IDocument[];
}
