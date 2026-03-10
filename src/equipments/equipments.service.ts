import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from 'src/database/schema';
import { DrizzleAsyncProvider } from 'src/database/drizzle.provider';
import { equipmentsTable } from 'src/database/schema';
import { eq, sql, and, or, lt, gt, desc, asc, count } from 'drizzle-orm';

@Injectable()
export class EquipmentsService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  async create(createEquipmentDto: CreateEquipmentDto) {
    const existing = await this.db
      .select({ id: equipmentsTable.id })
      .from(equipmentsTable)
      .where(eq(equipmentsTable.id, createEquipmentDto.id))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException(
        `Equipamento com ID '${createEquipmentDto.id}' já existe`,
      );
    }

    const [equipment] = await this.db
      .insert(equipmentsTable)
      .values({
        id: createEquipmentDto.id,
        name: createEquipmentDto.name,
        description: createEquipmentDto.description,
        tags: createEquipmentDto.tags ?? null,
      })
      .returning({
        id: equipmentsTable.id,
        name: equipmentsTable.name,
        description: equipmentsTable.description,
        tags: equipmentsTable.tags,
        createdAt: equipmentsTable.createdAt,
        updatedAt: equipmentsTable.updatedAt,
      });

    return equipment;
  }

  async findAll(cursor?: string, limit: number = 20) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);

    let cursorDate: Date | null = null;
    let cursorId: string | null = null;

    if (cursor) {
      try {
        const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
        const [dateStr, id] = decoded.split('|');
        cursorDate = new Date(dateStr);
        cursorId = id;
      } catch {
        throw new NotFoundException('Cursor inválido');
      }
    }

    const whereClause =
      cursorDate && cursorId
        ? or(
            lt(equipmentsTable.createdAt, cursorDate),
            and(
              eq(equipmentsTable.createdAt, cursorDate),
              gt(equipmentsTable.id, cursorId),
            ),
          )
        : undefined;

    const items = await this.db
      .select({
        id: equipmentsTable.id,
        name: equipmentsTable.name,
        description: equipmentsTable.description,
        tags: equipmentsTable.tags,
        createdAt: equipmentsTable.createdAt,
        updatedAt: equipmentsTable.updatedAt,
      })
      .from(equipmentsTable)
      .where(whereClause)
      .orderBy(desc(equipmentsTable.createdAt), asc(equipmentsTable.id))
      .limit(safeLimit + 1);

    const hasMore = items.length > safeLimit;
    const data = hasMore ? items.slice(0, safeLimit) : items;

    let nextCursor: string | null = null;
    if (hasMore && data.length > 0) {
      const lastItem = data[data.length - 1];
      const cursorValue = `${lastItem.createdAt.toISOString()}|${lastItem.id}`;
      nextCursor = Buffer.from(cursorValue).toString('base64');
    }

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(equipmentsTable);

    return {
      data,
      nextCursor,
      total,
    };
  }

  async findOne(id: string) {
    const [equipment] = await this.db
      .select({
        id: equipmentsTable.id,
        name: equipmentsTable.name,
        description: equipmentsTable.description,
        tags: equipmentsTable.tags,
        createdAt: equipmentsTable.createdAt,
        updatedAt: equipmentsTable.updatedAt,
      })
      .from(equipmentsTable)
      .where(eq(equipmentsTable.id, id))
      .limit(1);

    if (!equipment) {
      throw new NotFoundException(`Equipamento com ID '${id}' não encontrado`);
    }

    return equipment;
  }

  async update(id: string, updateEquipmentDto: UpdateEquipmentDto) {
    await this.findOne(id);

    const [updated] = await this.db
      .update(equipmentsTable)
      .set({
        ...updateEquipmentDto,
        updatedAt: new Date(),
      })
      .where(eq(equipmentsTable.id, id))
      .returning({
        id: equipmentsTable.id,
        name: equipmentsTable.name,
        description: equipmentsTable.description,
        tags: equipmentsTable.tags,
        createdAt: equipmentsTable.createdAt,
        updatedAt: equipmentsTable.updatedAt,
      });

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.db.delete(equipmentsTable).where(eq(equipmentsTable.id, id));

    return { message: `Equipamento '${id}' removido com sucesso` };
  }

  async search(query: string, cursor?: string, limit: number = 20) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);

    // Normalize query for tsquery: split words, add prefix matching
    const terms = query
      .trim()
      .split(/\s+/)
      .filter((t) => t.length > 0)
      .map((t) => `${t}:*`)
      .join(' & ');

    if (!terms) {
      return { data: [], nextCursor: null, total: 0 };
    }

    const tsQuery = sql`to_tsquery('portuguese', ${terms})`;
    const rankExpr = sql<number>`ts_rank(${equipmentsTable.search}, ${tsQuery})`;
    const matchCondition = sql`${equipmentsTable.search} @@ ${tsQuery}`;

    let cursorRank: number | null = null;
    let cursorId: string | null = null;

    if (cursor) {
      try {
        const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
        const [rankStr, id] = decoded.split('|');
        cursorRank = parseFloat(rankStr);
        cursorId = id;
      } catch {
        throw new NotFoundException('Cursor inválido');
      }
    }

    // Build cursor condition for search: order by rank DESC, id ASC
    const cursorCondition =
      cursorRank !== null && cursorId
        ? sql`(${rankExpr} < ${cursorRank} OR (${rankExpr} = ${cursorRank} AND ${equipmentsTable.id} > ${cursorId}))`
        : undefined;

    const whereClause = cursorCondition
      ? sql`${matchCondition} AND ${cursorCondition}`
      : matchCondition;

    const items = await this.db
      .select({
        id: equipmentsTable.id,
        name: equipmentsTable.name,
        description: equipmentsTable.description,
        tags: equipmentsTable.tags,
        createdAt: equipmentsTable.createdAt,
        updatedAt: equipmentsTable.updatedAt,
        rank: rankExpr,
      })
      .from(equipmentsTable)
      .where(whereClause)
      .orderBy(sql`${rankExpr} DESC`, asc(equipmentsTable.id))
      .limit(safeLimit + 1);

    const hasMore = items.length > safeLimit;
    const data = hasMore ? items.slice(0, safeLimit) : items;

    let nextCursor: string | null = null;
    if (hasMore && data.length > 0) {
      const lastItem = data[data.length - 1];
      const cursorValue = `${lastItem.rank}|${lastItem.id}`;
      nextCursor = Buffer.from(cursorValue).toString('base64');
    }

    // Get total matching count
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(equipmentsTable)
      .where(matchCondition);

    // Generate headline (highlighted snippets) for each result
    const headline = sql`ts_headline('portuguese', ${equipmentsTable.name} || ' — ' || ${equipmentsTable.description}, ${tsQuery}, 'StartSel=<mark>, StopSel=</mark>, MaxWords=50, MinWords=20')`;

    const withHeadlines = await Promise.all(
      data.map(async (item) => {
        const [h] = await this.db
          .select({
            headline: headline,
          })
          .from(equipmentsTable)
          .where(eq(equipmentsTable.id, item.id));

        return {
          ...item,
          headline: h?.headline ?? null,
        };
      }),
    );

    return {
      data: withHeadlines,
      nextCursor,
      total,
    };
  }

  async getStats() {
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(equipmentsTable);

    const recentItems = await this.db
      .select({
        id: equipmentsTable.id,
        name: equipmentsTable.name,
        description: equipmentsTable.description,
        tags: equipmentsTable.tags,
        createdAt: equipmentsTable.createdAt,
        updatedAt: equipmentsTable.updatedAt,
      })
      .from(equipmentsTable)
      .orderBy(desc(equipmentsTable.createdAt))
      .limit(5);

    return {
      total,
      recent: recentItems,
    };
  }
}
