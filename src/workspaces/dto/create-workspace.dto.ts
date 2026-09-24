import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';

export class CreateWorkspaceDto {

  @IsString()
  @IsNotEmpty()
  @Length(1, 45)
  @ApiProperty({
    example: 'd36561fe-863e-4d58-9216-eec83f46e43e',
    maxLength: 45,
  })
  tenantId!:string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  @ApiProperty({
    example: 'song to the magic frog',
    maxLength: 100,
  })
  workspaceNombre!:string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 45)
  @ApiProperty({
    example : 'd36561fe-863e-4d58-9216-eec83f46e43e',
    maxLength: 45,
  })
  maxMemberLimitId!: string;

}
