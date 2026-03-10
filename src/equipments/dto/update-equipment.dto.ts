import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateEquipmentDto } from './create-equipment.dto';

export class UpdateEquipmentDto extends PartialType(
  OmitType(CreateEquipmentDto, ['id'] as const),
) {}
