import { 
  Controller,
  Query,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Put
 } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiParam,
  ApiBody
} from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { PaginationDto } from '../global/paginacion.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { RespondInvitationDto } from './dto/respond-invitation.dto';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(@Body() createWorkspaceDto: CreateWorkspaceDto) {
    return this.workspacesService.create(createWorkspaceDto);
  }

  @Get()
  @ApiQuery({
    name: 'page',
    required: true,
    description: 'Número de página a mostrar.',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required:true,
    description: 'Cantidad de registros a mostrar por página.',
    example:10,
    })
  @ApiOperation({
    summary: 'Mostrar todos los workspaces de los tenants, con paginación',
    description: 'Mostrar todos los workspaces de los tenants, sin filtros y ordenados por fecha de creación en orden descendente.',
  })
  findAll(
    @Query() pagination: PaginationDto,
  ) {
    return this.workspacesService.findAll(pagination);
  }

   @Get("/get-all-members/")
  getAllMembers() {
    return this.workspacesService.getAllMembers();
  }

  @Get("/:workspaceId/members")
  getMembers(@Param('workspaceId', new ParseUUIDPipe({ version: '4' })) workspaceId: string) {
    return this.workspacesService.getMembers(workspaceId);
  }

  @Post("/members")
  addmember(@Body() addMemberDto: AddMemberDto) {
    return this.workspacesService.addMember(addMemberDto);
  }

  @Delete("/members")
  removeMemberWorkspace(@Body() addMemberDto: AddMemberDto) {
    return this.workspacesService.removeMemberWorkspace(addMemberDto);
  }

  @Get(':id')
  findOne(@Param('id',new ParseUUIDPipe({ version:'4'})) id: string) {
    return this.workspacesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id',new ParseUUIDPipe({ version:'4'})) id: string, @Body() updateWorkspaceDto: UpdateWorkspaceDto) {
    return this.workspacesService.update(id, updateWorkspaceDto);
  }

  @Delete(':id')
  remove(@Param('id',new ParseUUIDPipe({ version:'4'})) id: string) {
    return this.workspacesService.remove(id);
  }

  @Post('invitations')
  @ApiOperation({
    summary: 'Crear una invitación a un workspace',
    description: 'Crea una invitación para que un miembro se incorpore a un workspace.'
  })
  @ApiBody({
    type: CreateInvitationDto,
    examples: {
      ejemplo: {
        summary: 'Invitación de ejemplo',
        value: {
          workspaceId: '11111111-1111-4111-8111-111111111111',
          receiverId: '22222222-2222-4222-8222-222222222222',
          senderId: '33333333-3333-4333-8333-333333333333',
          expirationDate: '2026-11-01T23:59:59.000Z'
        }
      }
    }
  })
  createInvitation(
    @Body() dto: CreateInvitationDto
  ) {
    return this.workspacesService.createInvitationLink(
      dto.workspaceId,
      dto.receiverId,
      dto.senderId,
      new Date(dto.expirationDate)
    );
  }

  @Patch('invitations/:invitationId/respond')
  @ApiOperation({
    summary: 'Aceptar o rechazar una invitación',
    description: 'Permite al destinatario aceptar o rechazar una invitación pendiente.'
  })
  @ApiParam({
    name: 'invitationId',
    description: 'UUID de la invitación',
    example: '44444444-4444-4444-8444-444444444444'
  })
  @ApiBody({
    type: RespondInvitationDto,
    examples: {
      aceptar: {
        summary: 'Aceptar invitación',
        value: {
          receiverId: '22222222-2222-4222-8222-222222222222',
          response: 'ACCEPTED'
        }
      },
      rechazar: {
        summary: 'Rechazar invitación',
        value: {
          receiverId: '22222222-2222-4222-8222-222222222222',
          response: 'REJECTED'
        }
      }
    }
  })
  respondToInvitation(
    @Param(
      'invitationId',
      new ParseUUIDPipe({ version: '4' })
    ) invitationId: string,
    @Body() dto: RespondInvitationDto
  ) {
    // Temporalmente se recibe receiverId por el body.
    // En producción debe obtenerse del usuario autenticado.
    return this.workspacesService.respondToInvitation(
      invitationId,
      dto.receiverId,
      dto.response
    );
  }

  @Get('invitations/received/:receiverId')
  @ApiOperation({
    summary: 'Consultar invitaciones recibidas',
    description: 'Obtiene las invitaciones dirigidas a un miembro.'
  })
  @ApiParam({
    name: 'receiverId',
    description: 'UUID del miembro destinatario',
    example: '22222222-2222-4222-8222-222222222222'
  })
  getInvitationsByReceiver(
    @Param(
      'receiverId',
      new ParseUUIDPipe({ version: '4' })
    ) receiverId: string
  ) {
    return this.workspacesService.getInvitationsByReceiver(
      receiverId
    );
  }

  @Get('invitations/sent/:senderId')
  @ApiOperation({
    summary: 'Consultar invitaciones enviadas',
    description: 'Obtiene las invitaciones creadas por un miembro.'
  })
  @ApiParam({
    name: 'senderId',
    description: 'UUID del miembro que envió las invitaciones',
    example: '33333333-3333-4333-8333-333333333333'
  })
  getInvitationsBySender(
    @Param(
      'senderId',
      new ParseUUIDPipe({ version: '4' })
    ) senderId: string
  ) {
    return this.workspacesService.getInvitationsBySender(
      senderId
    );
  }

  @Get('invitations/:invitationId')
  @ApiOperation({
    summary: 'Consultar una invitación por ID',
    description: 'Obtiene el detalle de una invitación específica.'
  })
  @ApiParam({
    name: 'invitationId',
    description: 'UUID de la invitación',
    example: '44444444-4444-4444-8444-444444444444'
  })
  getInvitationById(
    @Param(
      'invitationId',
      new ParseUUIDPipe({ version: '4' })
    ) invitationId: string
  ) {
    return this.workspacesService.getInvitationById(
      invitationId
    );
  }

}
