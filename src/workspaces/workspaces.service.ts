import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException
} from '@nestjs/common';

import { randomUUID } from 'crypto';

import {
  count,
  asc,
  desc,
  eq,
  SQL,
  and,
  gt,
  or,
} from 'drizzle-orm';

import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { PaginationDto } from '../global/paginacion.dto';
import { DRIZZLE } from '../database/database.provider';
import { Status,statusEnum } from '../database/schema/enums';
import { tenantWorkspaces } from '../database/schema/tenant-workspaces.schema';
import { AddMemberDto } from './dto/add-member.dto';
import { workspaceMembers } from '../database/schema/workspace-members.schema';
import { members } from '../database/schema/member.schema';
import { membersData } from '../database/schema/members-data.schema';
import { tenants } from '../database/schema/tenants.schema';
import { workspaceInvitations } from '../database/schema/workspace-invitations.schema';

@Injectable()
export class WorkspacesService {
  constructor(
      @Inject(DRIZZLE)
      private readonly db: any,
    ) {}

  async create(createWorkspaceDto: CreateWorkspaceDto) {
    // El frontend de prueba manda UUIDs de ceros. tenant_id sí tiene FK
    // hacia tenants; si el registro no existe, Postgres responde 23503.
    // max_member_limit_id no referencia ninguna tabla, así que no hay
    // un "límite de miembros" que insertar: se guarda tal cual en el workspace.
    await this.db
      .insert(tenants)
      .values({
        tenantId: createWorkspaceDto.tenantId,
        name: 'Tenant genérico',
        rut: 0,
        dv: '0',
        type: 'EMPRESA',
      })
      .onConflictDoNothing({ target: tenants.tenantId });

    const [workspace] = await this.db
      .insert(tenantWorkspaces)
      .values({
        tenantId: createWorkspaceDto.tenantId,
        workspaceNombre: createWorkspaceDto.workspaceNombre,
        maxMemberLimitId: createWorkspaceDto.maxMemberLimitId,
      })
      .returning();
    return workspace;
  }

  async findAll(pagination: PaginationDto) {
    const { page, limit } = pagination;
    
    const offset = (page - 1) * limit;

    const data = await this.db
      .select()
      .from(tenantWorkspaces)
      .where(eq(tenantWorkspaces.status, 'ACTIVE'))
      .orderBy(desc(tenantWorkspaces.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await this.db
      .select({
        total: count(),
      })
      .from(tenantWorkspaces)
      .where(eq(tenantWorkspaces.status, 'ACTIVE'));

    return {
      data,
      meta: {
        page,
        limit,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / limit),
      },
    };
  
  }

  async findOne(id: string) {
    const data = await this.db
      .select()
      .from(tenantWorkspaces)
      .where(eq(tenantWorkspaces.workspaceId,id))

    if(data.length > 0){
      return data[0];
    }
    throw new NotFoundException(`Tenant con id ${id} no encontrado`);
  }

  async update(id: string, updateWorkspaceDto: UpdateWorkspaceDto) {
    const existe = await this.findOne(id);
    const data = await this.db
      .update(tenantWorkspaces)
      .set({
        ...updateWorkspaceDto,
      })
      .where(eq(tenantWorkspaces.tenantId, id))
      .returning()
    const mesage = `Tenant con id ${id} actualizado correctamente`
    return {mesage, data};
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.db
      .delete(workspaceInvitations)
      .where(eq(workspaceInvitations.workspaceId, id));

    await this.db
      .delete(workspaceMembers)
      .where(eq(workspaceMembers.workspaceId, id));

    const [data] = await this.db
      .delete(tenantWorkspaces)
      .where(eq(tenantWorkspaces.workspaceId, id))
      .returning();

    if (!data) {
      throw new NotFoundException(`Workspace con id ${id} no encontrado`);
    }

    return { message: 'Workspace eliminado correctamente', data };
  }

  async addMember(addMemberDto: AddMemberDto) {
    const { workspaceId, memberId } = addMemberDto;

    const [member] = await this.db
      .select()
      .from(members)
      .where(eq(members.memberId, memberId));
    
    const [workspace] = await this.db
      .select()
      .from(tenantWorkspaces)
      .where(eq(tenantWorkspaces.workspaceId, workspaceId));

    if (!member) {
      throw new NotFoundException(
        `Member ${memberId} not found`
      );
    }
    if (!workspace) {
      throw new NotFoundException(
        `workspace ${workspace} not found`
      );
    }
    

    const [workspaceMember] = await this.db
      .insert(workspaceMembers)
      .values({
        workspaceId,
        memberId,
      })
      .returning();

    return workspaceMember;
  }

  
  async getAllMembers() {
    try {
      const membersList = await this.db
        .select({
          workspaceId: workspaceMembers.workspaceId,
          memberId: workspaceMembers.memberId,
          name: membersData.name,
          lastname: membersData.lastname,
          profilePicture: membersData.profilePicture,
          workspaceNombre: tenantWorkspaces.workspaceNombre,
          tenantId: tenantWorkspaces.tenantId,
          tenantName: tenants.name,
        })
        .from(workspaceMembers)
        .leftJoin(
          members,
          eq(workspaceMembers.memberId, members.memberId)
        )
        .leftJoin(
          tenantWorkspaces,
          eq(
            tenantWorkspaces.workspaceId,
            workspaceMembers.workspaceId
          )
        )
        .leftJoin(
          membersData,
          eq(membersData.memberId, members.memberId)
        )
        .leftJoin(
          tenants,
          eq(tenants.tenantId, tenantWorkspaces.tenantId)
        );

      return membersList;
    } catch (error) {
      console.error("Error fetching members:", error);
      throw new Error("Failed to fetch members");
    }
  }


  async getMembers(workspaceId: string) {
    const membersList = await this.db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.workspaceId, workspaceId));
    return membersList;
  }

  async getInvitationsByWorkspace(workspaceId: string) {
    return this.db
      .select({
        invitationId: workspaceInvitations.invitationId,
        receiverId: workspaceInvitations.receiverId,
        senderId: workspaceInvitations.senderId,
        workspaceId: workspaceInvitations.workspaceId,
        createdAt: workspaceInvitations.createdAt,
        expirationDate: workspaceInvitations.expirationDate,
        status: workspaceInvitations.status,
        invitedEmail: workspaceInvitations.invitedEmail,
        email: workspaceInvitations.invitedEmail,
        name: membersData.name,
        lastname: membersData.lastname,
        iamUserId: members.iamUserId,
      })
      .from(workspaceInvitations)
      .leftJoin(
        members,
        eq(workspaceInvitations.receiverId, members.memberId),
      )
      .leftJoin(
        membersData,
        eq(membersData.memberId, members.memberId),
      )
      .where(eq(workspaceInvitations.workspaceId, workspaceId))
      .orderBy(desc(workspaceInvitations.createdAt));
  }

  async removeMemberWorkspace(addMemberDto: AddMemberDto) {
    const { workspaceId, memberId } = addMemberDto;

    const [workspaceMember] = await this.db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.memberId, memberId)
        )
      );

    if (!workspaceMember) {
      throw new NotFoundException(
        `No existe la relación entre el miembro ${memberId} y el workspace ${workspaceId}`
      );
    }

    const [ACTIVE, INACTIVE] = statusEnum.enumValues;

    const newStatus =
      workspaceMember.status === ACTIVE ? INACTIVE : ACTIVE;

    const [updatedRelation] = await this.db
      .update(workspaceMembers)
      .set({
        status: newStatus
      })
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.memberId, memberId)
        )
      )
      .returning();

    return {
      message: `Relación actualizada a ${newStatus}`,
      data: updatedRelation
    };
  }

  private getIamUserIdFromAuthorization(authorization?: string): string | null {
    if (!authorization?.toLowerCase().startsWith('bearer ')) {
      return null;
    }

    const token = authorization.slice(7).trim();
    const segment = token.split('.')[1];
    if (!segment) return null;

    try {
      const json = Buffer.from(segment, 'base64url').toString('utf8');
      const payload = JSON.parse(json) as { id?: string; sub?: string };
      return payload.id ?? payload.sub ?? null;
    } catch {
      return null;
    }
  }

  private async findIamUserByEmail(
    email: string,
    authorization?: string,
  ): Promise<{ id: string; email?: string } | null> {
    const iamUrl = process.env.IAM_URL ?? 'http://localhost:4002';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authorization) {
      headers.Authorization = authorization;
    }

    try {
      const response = await fetch(`${iamUrl}/iam/users`, { headers });
      if (!response.ok) {
        return null;
      }

      const body = (await response.json()) as
        | { id?: string; email?: string }[]
        | { data?: { id?: string; email?: string }[] };

      const users = Array.isArray(body) ? body : (body.data ?? []);
      const normalized = email.trim().toLowerCase();
      const match = users.find(
        (user) =>
          typeof user.id === 'string' &&
          (user.email ?? '').trim().toLowerCase() === normalized,
      );

      return match?.id ? { id: match.id, email: match.email } : null;
    } catch {
      return null;
    }
  }

  private async findOrCreateMember(iamUserId: string, tenantId: string) {
    const [existing] = await this.db
      .select()
      .from(members)
      .where(eq(members.iamUserId, iamUserId))
      .limit(1);

    if (existing) return existing;

    const [created] = await this.db
      .insert(members)
      .values({ iamUserId, tenantId })
      .returning();

    return created;
  }

  private async findOrCreatePendingInvitee(email: string, tenantId: string) {
    const [existingInvitation] = await this.db
      .select()
      .from(workspaceInvitations)
      .where(eq(workspaceInvitations.invitedEmail, email))
      .limit(1);

    if (existingInvitation?.receiverId) {
      const [existingMember] = await this.db
        .select()
        .from(members)
        .where(eq(members.memberId, existingInvitation.receiverId))
        .limit(1);
      if (existingMember) return existingMember;
    }

    const [created] = await this.db
      .insert(members)
      .values({
        iamUserId: randomUUID(),
        tenantId,
      })
      .returning();

    const localPart = email.split('@')[0]?.slice(0, 45) || 'Invitado';
    await this.db.insert(membersData).values({
      memberId: created.memberId,
      name: localPart,
      lastname: 'Invitado',
    });

    return created;
  }

  private async ensureActiveWorkspaceMember(
    workspaceId: string,
    memberId: string,
  ) {
    const [relation] = await this.db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.memberId, memberId),
        ),
      )
      .limit(1);

    if (!relation) {
      await this.db.insert(workspaceMembers).values({
        workspaceId,
        memberId,
        status: 'ACTIVE',
      });
      return;
    }

    if (relation.status !== 'ACTIVE') {
      await this.db
        .update(workspaceMembers)
        .set({ status: 'ACTIVE' })
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.memberId, memberId),
          ),
        );
    }
  }

  async createInvitationByEmail(
    workspaceId: string,
    email: string,
    authorization?: string,
  ) {
    const normalizedEmail = email.trim().toLowerCase();
    const iamUser = await this.findIamUserByEmail(
      normalizedEmail,
      authorization,
    );

    const senderIamId = this.getIamUserIdFromAuthorization(authorization);
    if (!senderIamId) {
      throw new ForbiddenException(
        'No hay una sesión activa. Inicia sesión de nuevo.',
      );
    }

    const [workspace] = await this.db
      .select()
      .from(tenantWorkspaces)
      .where(eq(tenantWorkspaces.workspaceId, workspaceId))
      .limit(1);

    if (!workspace) {
      throw new NotFoundException(`Workspace ${workspaceId} no encontrado`);
    }

    const receiver = iamUser?.id
      ? await this.findOrCreateMember(iamUser.id, workspace.tenantId)
      : await this.findOrCreatePendingInvitee(
          normalizedEmail,
          workspace.tenantId,
        );

    const sender = await this.findOrCreateMember(
      senderIamId,
      workspace.tenantId,
    );
    await this.ensureActiveWorkspaceMember(workspaceId, sender.memberId);

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);

    return this.createInvitationLink(
      workspaceId,
      receiver.memberId,
      sender.memberId,
      expirationDate,
      normalizedEmail,
    );
  }

  async createInvitationLink(
    workspaceId: string,
    receiverId: string,
    senderId: string,
    expirationDate: Date,
    invitedEmail?: string,
  ) {
    const now = new Date();

    if (
      !(expirationDate instanceof Date) ||
      !Number.isFinite(expirationDate.getTime()) ||
      expirationDate <= now
    ) {
      throw new BadRequestException(
        'La fecha de expiración debe ser futura'
      );
    }

    return this.db.transaction(async (tx) => {
      const [workspace] = await tx
        .select()
        .from(tenantWorkspaces)
        .where(eq(tenantWorkspaces.workspaceId, workspaceId))
        .limit(1);

      if (!workspace) {
        throw new NotFoundException(
          `Workspace ${workspaceId} no encontrado`
        );
      }

      const [receiver] = await tx
        .select()
        .from(members)
        .where(eq(members.memberId, receiverId))
        .limit(1);

      if (!receiver) {
        throw new NotFoundException(
          `Destinatario ${receiverId} no encontrado`
        );
      }

      const [sender] = await tx
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.memberId, senderId),
            eq(workspaceMembers.status, 'ACTIVE')
          )
        )
        .limit(1);

      if (!sender) {
        throw new ForbiddenException(
          'El remitente no es un miembro activo del workspace'
        );
      }

      const [existingMembership] = await tx
        .select()
        .from(workspaceMembers)
        .where(
          and(
            eq(workspaceMembers.workspaceId, workspaceId),
            eq(workspaceMembers.memberId, receiverId),
            eq(workspaceMembers.status, 'ACTIVE')
          )
        )
        .limit(1);

      if (existingMembership) {
        throw new BadRequestException(
          'El usuario ya pertenece a este workspace'
        );
      }

      const invitationMatch = invitedEmail
        ? or(
            eq(workspaceInvitations.receiverId, receiverId),
            eq(workspaceInvitations.invitedEmail, invitedEmail),
          )
        : eq(workspaceInvitations.receiverId, receiverId);

      const [existingInvitation] = await tx
        .select()
        .from(workspaceInvitations)
        .where(
          and(
            eq(workspaceInvitations.workspaceId, workspaceId),
            eq(workspaceInvitations.status, 'PENDING'),
            gt(workspaceInvitations.expirationDate, now),
            invitationMatch,
          )
        )
        .limit(1);

      if (existingInvitation) {
        throw new BadRequestException(
          'Ya existe una invitación pendiente para este usuario'
        );
      }

      const [invitation] = await tx
        .insert(workspaceInvitations)
        .values({
          workspaceId,
          receiverId,
          senderId,
          invitedEmail: invitedEmail ?? null,
          expirationDate,
          status: 'PENDING',
          statusUpdatedAt: now
        })
        .returning();

      return invitation;
    });
  }

  async respondToInvitation(
    invitationId: string,
    receiverId: string,
    response: 'ACCEPTED' | 'REJECTED'
  ) {
    if (
      response !== 'ACCEPTED' &&
      response !== 'REJECTED'
    ) {
      throw new BadRequestException(
        'La respuesta debe ser ACCEPTED o REJECTED'
      );
    }

    const now = new Date();

    return this.db.transaction(async (tx) => {
      const [invitation] = await tx
        .select()
        .from(workspaceInvitations)
        .where(
          eq(workspaceInvitations.invitationId, invitationId)
        )
        .limit(1);

      if (!invitation) {
        throw new NotFoundException(
          'La invitación no existe'
        );
      }

      if (invitation.receiverId !== receiverId) {
        throw new ForbiddenException(
          'No puedes responder una invitación dirigida a otro usuario'
        );
      }

      if (invitation.status !== 'PENDING') {
        throw new BadRequestException(
          'La invitación ya fue respondida'
        );
      }

      if (invitation.expirationDate <= now) {
        throw new BadRequestException(
          'La invitación ha expirado'
        );
      }

      const [updatedInvitation] = await tx
        .update(workspaceInvitations)
        .set({
          status: response,
          statusUpdatedAt: now
        })
        .where(
          and(
            eq(
              workspaceInvitations.invitationId,
              invitationId
            ),
            eq(workspaceInvitations.receiverId, receiverId),
            eq(workspaceInvitations.status, 'PENDING'),
            gt(workspaceInvitations.expirationDate, now)
          )
        )
        .returning();

      if (!updatedInvitation) {
        throw new BadRequestException(
          'La invitación ya no está disponible'
        );
      }

      if (response === 'ACCEPTED') {
        const [existingMembership] = await tx
          .select()
          .from(workspaceMembers)
          .where(
            and(
              eq(
                workspaceMembers.workspaceId,
                invitation.workspaceId
              ),
              eq(workspaceMembers.memberId, receiverId)
            )
          )
          .limit(1);

        if (existingMembership) {
          if (existingMembership.status !== 'ACTIVE') {
            await tx
              .update(workspaceMembers)
              .set({
                status: 'ACTIVE'
              })
              .where(
                and(
                  eq(
                    workspaceMembers.workspaceId,
                    invitation.workspaceId
                  ),
                  eq(workspaceMembers.memberId, receiverId)
                )
              );
          }
        } else {
          await tx
            .insert(workspaceMembers)
            .values({
              workspaceId: invitation.workspaceId,
              memberId: receiverId
            });
        }
      }

      return {
        message: response === 'ACCEPTED'
          ? 'Invitación aceptada correctamente'
          : 'Invitación rechazada correctamente',
        data: updatedInvitation
      };
    });
  }

  async getInvitationsByReceiver(receiverId: string) {
    const invitations = await this.db
      .select({
        invitationId: workspaceInvitations.invitationId,
        receiverId: workspaceInvitations.receiverId,
        senderId: workspaceInvitations.senderId,
        workspaceId: workspaceInvitations.workspaceId,
        workspaceNombre: tenantWorkspaces.workspaceNombre,
        createdAt: workspaceInvitations.createdAt,
        expirationDate: workspaceInvitations.expirationDate,
        status: workspaceInvitations.status,
        statusUpdatedAt: workspaceInvitations.statusUpdatedAt
      })
      .from(workspaceInvitations)
      .leftJoin(
        tenantWorkspaces,
        eq(
          workspaceInvitations.workspaceId,
          tenantWorkspaces.workspaceId
        )
      )
      .where(
        eq(workspaceInvitations.receiverId, receiverId)
      )
      .orderBy(desc(workspaceInvitations.createdAt));

    return invitations;
  }

async getInvitationsBySender(senderId: string) {
  const invitations = await this.db
    .select({
      invitationId: workspaceInvitations.invitationId,
      receiverId: workspaceInvitations.receiverId,
      senderId: workspaceInvitations.senderId,
      workspaceId: workspaceInvitations.workspaceId,
      workspaceNombre: tenantWorkspaces.workspaceNombre,
      createdAt: workspaceInvitations.createdAt,
      expirationDate: workspaceInvitations.expirationDate,
      status: workspaceInvitations.status,
      statusUpdatedAt: workspaceInvitations.statusUpdatedAt
    })
    .from(workspaceInvitations)
    .leftJoin(
      tenantWorkspaces,
      eq(
        workspaceInvitations.workspaceId,
        tenantWorkspaces.workspaceId
      )
    )
    .where(
      eq(workspaceInvitations.senderId, senderId)
    )
    .orderBy(desc(workspaceInvitations.createdAt));

  return invitations;
}
async getInvitationById(invitationId: string) {
  const [invitation] = await this.db
    .select({
      invitationId: workspaceInvitations.invitationId,
      workspaceId: workspaceInvitations.workspaceId,
      workspaceNombre: tenantWorkspaces.workspaceNombre,
      receiverId: workspaceInvitations.receiverId,
      senderId: workspaceInvitations.senderId,
      createdAt: workspaceInvitations.createdAt,
      expirationDate: workspaceInvitations.expirationDate,
      status: workspaceInvitations.status,
      statusUpdatedAt: workspaceInvitations.statusUpdatedAt
    })
    .from(workspaceInvitations)
    .leftJoin(
      tenantWorkspaces,
      eq(
        workspaceInvitations.workspaceId,
        tenantWorkspaces.workspaceId
      )
    )
    .where(
      eq(workspaceInvitations.invitationId, invitationId)
    )
    .limit(1);

  if (!invitation) {
    throw new NotFoundException(
      `Invitación ${invitationId} no encontrada`
    );
  }

  return invitation;
  }

  async cancelInvitation(invitationId: string) {
    const [invitation] = await this.db
      .select()
      .from(workspaceInvitations)
      .where(eq(workspaceInvitations.invitationId, invitationId))
      .limit(1);

    if (!invitation) {
      throw new NotFoundException(
        `Invitación ${invitationId} no encontrada`,
      );
    }

    await this.db
      .delete(workspaceInvitations)
      .where(eq(workspaceInvitations.invitationId, invitationId));

    return { message: 'Invitación cancelada correctamente' };
  }

  async deleteWorkspaceMember(workspaceId: string, memberId: string) {
    const [workspaceMember] = await this.db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.memberId, memberId),
        ),
      )
      .limit(1);

    if (!workspaceMember) {
      throw new NotFoundException(
        `No existe la relación entre el miembro ${memberId} y el workspace ${workspaceId}`,
      );
    }

    await this.db
      .delete(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.memberId, memberId),
        ),
      );

    return { message: 'Miembro eliminado del workspace' };
  }
}
