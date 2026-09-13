import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
export class CreateMemberDataDTO{
  
  @ApiProperty({
    example: 'd36561fe-863e-4d58-9216-eec83f46e43e',
    maxLength: 45,
  })
  @IsString()
  @IsNotEmpty() 
  memberId!:string;
  
  @ApiProperty({
    example: 'John',
    maxLength: 45,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 45)
  name!: string;
  
  @ApiProperty({
    example: 'Doe',
    maxLength: 45,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 45)
  lastname!: string;
  
  @ApiProperty({
    example: 'http://example.com/profile.jpg',
    maxLength: 45,
  })
  @IsString()
  @Length(1, 45)
  profilePicture!: string;
}