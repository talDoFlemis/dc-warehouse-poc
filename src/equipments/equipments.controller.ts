import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EquipmentsService } from './equipments.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('equipments')
@UseGuards(AuthenticatedGuard)
export class EquipmentsController {
  constructor(private readonly equipmentsService: EquipmentsService) {}

  @UseGuards(RolesGuard)
  @Roles(["admin"])
  @Post()
  create(@Body() createEquipmentDto: CreateEquipmentDto) {
    return this.equipmentsService.create(createEquipmentDto);
  }

  @Get()
  findAll() {
    return this.equipmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.equipmentsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(["admin"])
  update(@Param('id') id: string, @Body() updateEquipmentDto: UpdateEquipmentDto) {
    return this.equipmentsService.update(+id, updateEquipmentDto);
  }

  @UseGuards(RolesGuard)
  @Roles(["admin"])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.equipmentsService.remove(+id);
  }
}
