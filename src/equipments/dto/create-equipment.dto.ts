import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEquipmentDto {
  @ApiProperty({
    description: 'Identificador único do equipamento (patrimônio)',
    example: 'PAT-001',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Nome do equipamento',
    example: 'Notebook Dell Latitude 5520',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Descrição do equipamento',
    example: 'Notebook para uso administrativo, 16GB RAM, 512GB SSD',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Tags para categorização',
    example: ['notebook', 'dell', 'administrativo'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
