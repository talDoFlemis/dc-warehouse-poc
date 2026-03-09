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
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    tags: text().array(),
    search: tsvector('search')
      .notNull()
      .generatedAlwaysAs(
        (): SQL =>
          sql`
            setweight(to_tsvector('portuguese', ${equipmentsTable.id}), 'A') 
            ||
            setweight(to_tsvector('portuguese', ${equipmentsTable.name}), 'A')
            ||
            setweight(to_tsvector('portuguese', ${equipmentsTable.description}), 'B')
            ||
            setweight(to_tsvector('simple', immutable_array_to_string(${equipmentsTable.tags})), 'C')
            `,
      ),
  },
  (table) => [index('equipments_fts_index').using('GIN', table.search)],
);
