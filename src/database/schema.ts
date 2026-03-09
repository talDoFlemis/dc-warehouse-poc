import { sql, SQL } from 'drizzle-orm';
import {
  timestamp,
  pgTable,
  text,
  index,
  customType,
} from 'drizzle-orm/pg-core';

export const tsvector = customType<{
  data: string;
}>({
  dataType() {
    return `tsvector`;
  },
});

export const equipmentsTable = pgTable(
  'equipments',
  {
    id: text().primaryKey(),
    name: text(),
    description: text(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    tags: text().array(),
    search: tsvector('search')
      .notNull()
      .generatedAlwaysAs(
        (): SQL =>
          sql`
            setweight(to_tsvector('simple', array_to_string(${equipmentsTable.tags}, ' ')), 'C') ||
            setweight(to_tsvector('english', ${equipmentsTable.name}), 'A')
            ||
            setweight(to_tsvector('english', ${equipmentsTable.description}), 'B')`,
      ),
  },
  (table) => [index('equipments_fts_index').using('GIN', table.search)],
);
