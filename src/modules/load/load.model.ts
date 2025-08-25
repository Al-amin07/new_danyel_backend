import { Schema, model } from 'mongoose';
import { IAddress, IDocument, ILoad } from './load.interface';

const AddressSchema = new Schema<IAddress>({
  street: { type: String, required: true },
  apartment: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: Number, required: true },
  country: { type: String, required: true },
});

const DocumentSchema = new Schema<IDocument>({
  type: { type: String, required: true },
  url: { type: String, required: true },
});

const LeadSchema = new Schema<ILoad>(
  {
    loadId: { type: String, required: true, unique: true },
    quantity: { type: Number, required: true },
    weight: { type: Number, required: true },
    loadType: { type: String, required: true },
    specialInstructions: { type: String },

    pickupAddress: { type: AddressSchema, required: true },
    deliveryAddress: { type: AddressSchema, required: true },
    loadStatus: {
      type: String,
      enum: [
        'Pending Assignment',
        'In Transit',
        'At Pickup',
        'En Route to Pickup',
        'Delivered',
      ],
      default: 'Pending Assignment',
    },

    pickupDate: { type: Date },
    pickupTime: { type: String },
    deliveryDate: { type: Date },
    deliveryTime: { type: String },

    totalDistance: { type: Number, required: true },
    ratePerMile: { type: Number, required: true },
    totalPayment: { type: Number },

    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED'],
      default: 'PENDING',
    },
    customerNotes: { type: String },
    paymentDate: { type: Date },

    assignedDriver: { type: Schema.Types.ObjectId, ref: 'Driver' },

    documents: [DocumentSchema],
  },
  { timestamps: true },
);

export const LoadModel = model<ILoad>('Load', LeadSchema);
