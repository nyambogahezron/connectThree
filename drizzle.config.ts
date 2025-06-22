import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/database/schema.ts',
  out: './lib/database/migrations',
  dialect: 'sqlite',
  driver: 'expo',
} satisfies Config;