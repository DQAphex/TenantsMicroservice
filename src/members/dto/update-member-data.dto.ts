import { PartialType } from '@nestjs/swagger';
import { CreateMemberDataDTO } from './create-member-data.dto';

export class UpdateMemberDataDTO extends PartialType(CreateMemberDataDTO) {}