import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { count, asc, desc, eq, SQL } from 'drizzle-orm'

import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { PaginationDto } from '../global/paginacion.dto';
import { DRIZZLE } from '../database/database.provider';
import { Status,statusEnum } from '../database/schema/enums';
import { tenantWorkspaces } from '../database/schema/tenant-workspaces.schema';

@Injectable()
export class WorkspacesService {
  constructor(
      @Inject(DRIZZLE)
      private readonly db: any,
    ) {}

  async create(createWorkspaceDto: CreateWorkspaceDto) {
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
      .orderBy(desc(tenantWorkspaces.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await this.db
      .select({
        total: count(),
      })
      .from(tenantWorkspaces);

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
    const existe = await this.findOne(id);
    const [ACTIVE, INACTIVE] = statusEnum.enumValues;
    const newStatus = 
      existe.status === ACTIVE ? INACTIVE : ACTIVE;
    const data = await this.db
      .update(tenantWorkspaces)
      .set({status : newStatus})
      .where(eq(tenantWorkspaces.tenantId, id))
      .returning()
    const mesage = `Tenant con id ${id} eliminado correctamente`
    return {mesage, data};
  }
}
