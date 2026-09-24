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

  async findAll() {
    return `This action returns all workspaces`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} workspace`;
  }

  async update(id: number, updateWorkspaceDto: UpdateWorkspaceDto) {
    return `This action updates a #${id} workspace`;
  }

  async remove(id: number) {
    return `This action removes a #${id} workspace`;
  }
}
