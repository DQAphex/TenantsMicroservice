import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';

enum TenantType {
  PERSONA_NATURAL = 'PERSONA_NATURAL',
  EMPRESA = 'EMPRESA',
}

export class CreateTenantDto {
  @ApiProperty({
    example: 'Empresa de Prueba SpA',
    maxLength: 45,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 45)
  name!: string;

  @ApiProperty({
    example: 12345678,
  })
  @IsInt()
  rut!: number;

  @ApiProperty({
    example: '9',
  })
  @IsString()
  @Length(1, 1)
  dv!: string;

  @ApiProperty({
    enum: TenantType,
    example: TenantType.EMPRESA,
  })
  @IsEnum(TenantType)
  type!: TenantType;
}

