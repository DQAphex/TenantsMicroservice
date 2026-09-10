import { IsIn, IsOptional, IsString } from 'class-validator';
import type { Status, } from '../../database/schema/enums';
import { statusEnum } from '../../database/schema/enums';


export class QueryMemberDto {
  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsIn(statusEnum.enumValues)
  status?: Status;
}