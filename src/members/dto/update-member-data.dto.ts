import { PartialType } from '@nestjs/swagger';
import { CreateMemberDataDTO } from './create-member-data.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMemberDataDTO extends PartialType(CreateMemberDataDTO) {
  @ApiProperty({
    example: 'd36561fe-863e-4d58-9216-eec83f46e43e',
  })
  memberId!: string;
}