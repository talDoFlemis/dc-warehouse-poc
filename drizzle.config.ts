import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const user = process.env.DATABASE_USER;
const password = process.env.DATABASE_PASSWORD;
const port = process.env.DATABASE_PORT;
const host = process.env.DATABASE_HOST;
const name = process.env.DATABASE_NAME;
const connectionString = `postgresql://${user}:${password}@${host}:${port}/${name}`;
export default defineConfig({
  out: './src/database/migrations',
  schema: './src/database/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
});
