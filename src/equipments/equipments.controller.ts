import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiQuery, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EquipmentsService } from './equipments.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { AuthenticatedGuard } from 'src/auth/authenticated.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@ApiTags('Equipamentos')
@Controller('equipments')
@UseGuards(AuthenticatedGuard)
export class EquipmentsController {
  constructor(private readonly equipmentsService: EquipmentsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(['admin', 'writer'])
  @ApiOperation({ summary: 'Criar novo equipamento' })
  @ApiResponse({ status: 201, description: 'Equipamento criado com sucesso' })
  @ApiResponse({
    status: 409,
    description: 'Equipamento com este ID já existe',
  })
  create(@Body() createEquipmentDto: CreateEquipmentDto) {
    return this.equipmentsService.create(createEquipmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar equipamentos com paginação por cursor' })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description: 'Cursor para paginação',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número de itens por página (1-100)',
    example: 20,
  })
  findAll(@Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    return this.equipmentsService.findAll(
      cursor,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Busca full-text em equipamentos (português)' })
  @ApiQuery({ name: 'q', required: true, description: 'Termo de busca' })
  @ApiQuery({
    name: 'cursor',
    required: false,
    description: 'Cursor para paginação',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número de itens por página (1-100)',
    example: 20,
  })
  search(
    @Query('q') q: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.equipmentsService.search(
      q,
      cursor,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  @ApiOperation({ summary: 'Estatísticas dos equipamentos (admin)' })
  getStats() {
    return this.equipmentsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar equipamento por ID' })
  @ApiResponse({ status: 200, description: 'Equipamento encontrado' })
  @ApiResponse({ status: 404, description: 'Equipamento não encontrado' })
  findOne(@Param('id') id: string) {
    return this.equipmentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(['admin', 'writer'])
  @ApiOperation({ summary: 'Atualizar equipamento' })
  @ApiResponse({ status: 200, description: 'Equipamento atualizado' })
  @ApiResponse({ status: 404, description: 'Equipamento não encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
  ) {
    return this.equipmentsService.update(id, updateEquipmentDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  @ApiOperation({ summary: 'Remover equipamento (somente admin)' })
  @ApiResponse({ status: 200, description: 'Equipamento removido' })
  @ApiResponse({ status: 404, description: 'Equipamento não encontrado' })
  remove(@Param('id') id: string) {
    return this.equipmentsService.remove(id);
  }
}
