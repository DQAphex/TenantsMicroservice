import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { count, asc, desc, eq, SQL } from 'drizzle-orm'

import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { PaginationDto } from '../global/paginacion.dto';

import { DRIZZLE } from '../database/database.provider';
import { members } from '../database/schema/member.schema';
import { Status,statusEnum } from '../database/schema/enums';

@Injectable()
export class MembersService {
  constructor(
      @Inject(DRIZZLE)
      private readonly db: any,
    ) {}
  
  async create(createMemberDto: CreateMemberDto) {
    const [member] = await this.db
      .insert(members)
      .values({
        iamUserId: createMemberDto.iamUserId,
        tenantId: createMemberDto.tenantId,
      })
      .returning();
    return member;
  }

  async findAll(pagination: PaginationDto) {
    const { page, limit } = pagination;

    const offset = (page - 1) * limit;

    const data = await this.db
      .select()
      .from(members)
      .orderBy(desc(members.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await this.db
      .select({
        total: count(),
      })
      .from(members);

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
    const [member] = await this.db
      .select()
      .from(members)
      .where(eq(members.memberId, id));

    if (!member) {
      throw new NotFoundException(`Member con id ${id} no encontrado`);
    }

    return member;
  }
  
  query(tenantId?: string, status?: Status) {
    const conditions:SQL[] = [];

    if (tenantId) {
      conditions.push(eq(members.tenantId,tenantId));
    }

    if (status){
      conditions.push(eq(members.status,status));
    }
    return this.db
      .select()
      .from(members)
      .where(...conditions)
      .orderBy(desc(members.createdAt));
  }

  async toggleStatus(id: string) {
      const existe = await this.findOne(id);
      const [ACTIVE, INACTIVE] = statusEnum.enumValues;
      const newStatus = 
        existe.status === ACTIVE ? INACTIVE : ACTIVE;
      console.log('Nuevo estado:', newStatus,existe.status);
      const data = await this.db
        .update(members)
        .set({status : newStatus})
        .where(eq(members.memberId, id))
        .returning()
      const mesage = `Member con id ${id} eliminado correctamente`
      const debug = {"Nuevo_estado": newStatus, "Estado_anterior": existe.status} 
      return {mesage, data,debug};
    }
}
