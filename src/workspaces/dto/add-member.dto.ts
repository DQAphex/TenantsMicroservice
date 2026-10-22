import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';

export class AddMemberDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 45)
  @ApiProperty({
    example: 'd36561fe-863e-4d58-9216-eec83f46e43e',
    maxLength: 45,
  })
  workspaceId!:string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 45)
  @ApiProperty({
    example : 'd36561fe-863e-4d58-9216-eec83f46e43e',
    maxLength: 45,
  })
  memberId!: string;
}