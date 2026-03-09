import { Module } from '@nestjs/common';
import { EquipmentsService } from './equipments.service';
import { EquipmentsController } from './equipments.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [EquipmentsController],
  providers: [EquipmentsService],
  imports: [DatabaseModule],
})
export class EquipmentsModule {}
