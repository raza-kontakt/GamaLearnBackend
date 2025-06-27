import { z } from 'zod';

export const getAllSchema = z.object({
  query: z.object({
    lang: z.string().optional(),
  }),
});

export const getSyncSchema = z.object({
  query: z.object({
    lang: z.string().optional(),
  }),
});
