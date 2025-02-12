import { z } from 'zod';

const envSchema = z.object({
  API_URL: z.string().url().default('http://localhost:3000/api'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
});

export const env = envSchema.parse({
  API_URL: import.meta.env.VITE_API_URL,
  NODE_ENV: import.meta.env.MODE
});