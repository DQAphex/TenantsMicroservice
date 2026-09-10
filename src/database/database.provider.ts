import 'dotenv/config';
import { Provider } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export const DRIZZLE = 'DRIZZLE';

export const databaseProvider: Provider = {
  provide: DRIZZLE,
  useFactory: () => {
    console.log('DATABASE_URL:', process.env.DATABASE_URL);

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    return drizzle(pool);
  },
};