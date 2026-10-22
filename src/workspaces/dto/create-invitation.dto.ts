import {
  IsDateString,
  IsUUID
} from 'class-validator';

export class CreateInvitationDto {
  @IsUUID('4')
  workspaceId!: string;

  @IsUUID('4')
  receiverId!: string;

  @IsUUID('4')
  senderId!: string;

  @IsDateString()
  expirationDate!: string;
}