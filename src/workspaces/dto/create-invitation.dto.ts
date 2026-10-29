import {
  IsEmail,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvitationDto {
  @ApiProperty({
    example: '11111111-1111-4111-8111-111111111111',
    description: 'ID del workspace al que se invita',
  })
  @IsUUID('4')
  workspaceId!: string;

  @ApiProperty({
    example: 'usuario@empresa.com',
    description: 'Correo del usuario a invitar',
  })
  @IsEmail()
  email!: string;
}
