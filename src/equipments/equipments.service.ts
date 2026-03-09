import { Injectable } from '@nestjs/common';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from 'src/database/schema';
import { DrizzleAsyncProvider } from 'src/database/drizzle.provider';

@Injectable()
export class EquipmentsService {
  constructor(
    @Inject(DrizzleAsyncProvider)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  create(createEquipmentDto: CreateEquipmentDto) {
    return 'This action adds a new equipment';
  }

  findAll() {
    return `This action returns all equipments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} equipment`;
  }

  update(id: number, updateEquipmentDto: UpdateEquipmentDto) {
    return `This action updates a #${id} equipment`;
  }

  remove(id: number) {
    return `This action removes a #${id} equipment`;
  }
}
