import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    userName: z.string({
      required_error: 'Username is required',
    }),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(3, 'Password must be at least 6 characters'),
  }),
}); 