import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMemberDto {
  
  @ApiProperty({
    example: 'fee01ec1-9257-4e75-be25-03a8c6f90f4e',
  }) 
  @IsNotEmpty()
  @IsUUID()
  iamUserId!: string;

  @ApiProperty({
    example: 'fee01ec1-9257-4e75-be25-03a8c6f90f4e',
  })
  @IsNotEmpty()
  @IsUUID()
  tenantId!: string;
}

