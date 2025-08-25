import { z } from 'zod';

// Custom regex for MongoDB ObjectId (24 hex chars)
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const loadStatusValidationSchema = z.object({
  body: z.object({
    loadId: z
      .string()
      .regex(objectIdRegex, { message: 'Invalid MongoDB ObjectId' }),
    status: z.enum([
      'Pending Assignment',
      'Awaiting Pickup',
      'En Route to Pickup',
      'At Pickup',
      'In Transit',
      'Delivered',
    ]),
  }),
});
export const assignLoadValidationSchema = z.object({
  loadId: z
    .string()
    .regex(objectIdRegex, { message: 'Invalid MongoDB ObjectId' }),
  driverId: z
    .string()
    .regex(objectIdRegex, { message: 'Invalid MongoDB ObjectId' }),
});
