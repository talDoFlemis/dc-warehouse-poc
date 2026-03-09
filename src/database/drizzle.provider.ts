import { Pool } from 'pg';
import * as schema from 'src/database/schema';
import { ConfigService } from '@nestjs/config';
import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';

export const DrizzleAsyncProvider = 'DrizzleAsyncProvider';

export const drizzleProvider = [
  {
    provide: DrizzleAsyncProvider,
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => {
      const user = configService.get<string>('DATABASE_USER');
      const password = configService.get<string>('DATABASE_PASSWORD');
      const port = configService.get<string>('DATABASE_PORT');
      const host = configService.get<string>('DATABASE_HOST');
      const name = configService.get<string>('DATABASE_NAME');
      const connectionString = `postgresql://${user}:${password}@${host}:${port}/${name}`;
      const pool = new Pool({
        connectionString,
      });

      return drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
    },
  },
];
