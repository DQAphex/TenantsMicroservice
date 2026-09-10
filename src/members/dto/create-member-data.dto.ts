import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
export class CreateMemberDataDTO{
  @IsString()
  @IsNotEmpty()
  memberId!:string;
  @ApiProperty({
    example: 'John Doe',
    maxLength: 45,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 45)
  name!: string;
  @IsString()
  @IsNotEmpty()
  @Length(1, 45)
  lastname!: string;
  @IsString()
  @Length(1, 45)
  profilePicture!: string;
}