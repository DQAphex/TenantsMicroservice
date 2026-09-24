import { PartialType } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import type { Status, } from '../../database/schema/enums';
import { CreateWorkspaceDto } from './create-workspace.dto';
import { statusEnum } from '../../database/schema/enums';

export class UpdateWorkspaceDto extends PartialType(CreateWorkspaceDto) {
  @IsOptional()
  @IsIn(statusEnum.enumValues)
  status?: Status;
}
