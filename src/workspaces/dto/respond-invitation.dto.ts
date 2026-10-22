import {
  IsIn,
  IsUUID
} from 'class-validator';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RespondInvitationDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 45)
  @ApiProperty({
    example: 'd36561fe-863e-4d58-9216-eec83f46e43e',
    maxLength: 45,
  })
  receiverId!: string;

  @IsIn(['ACCEPTED', 'REJECTED'])
  response!: 'ACCEPTED' | 'REJECTED';
}