import { z } from 'zod';

export const loadStatusValidationSchema = z.object({
  body: z.object({
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
