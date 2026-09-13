import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { count, asc, desc, eq, SQL } from 'drizzle-orm'

import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { PaginationDto } from '../global/paginacion.dto';
import { CreateMemberDataDTO } from './dto/create-member-data.dto';
import { UpdateMemberDataDTO } from './dto/update-member-data.dto';

import { DRIZZLE } from '../database/database.provider';
import { members} from '../database/schema/member.schema';
import { membersData } from 'src/database/schema/members-data.schema';
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
      const debug = {"Nuevo_mmit estado": newStatus, "Estado_anterior": existe.status} 
      return {mesage, data,debug};
    }

    async getMemberDataById(memberId: string) {
      const [memberData] = await this.db
        .select()
        .from(membersData)
        .where(eq(membersData.memberId, memberId));
      
      const [member] = await this.db
        .select()
        .from(members)
        .where(eq(members.memberId, memberId));
      
      const result = {
        memberId: memberData?.memberId,
        name: memberData?.name,
        lastname: memberData?.lastname,
        profilePicture: memberData?.profilePicture,
        iamUserId: member?.iamUserId,
        tenantId: member?.tenantId,
        status: member?.status,
      }
        
      console.log('Datos del miembro:', result);
      return result;
    }

    async createMemberData(createMemberDataDTO: CreateMemberDataDTO) {
      console.log(createMemberDataDTO);
      const memberData = this.db
        .insert(membersData)
        .values({
          memberId: createMemberDataDTO.memberId,
          name: createMemberDataDTO.name,
          lastname: createMemberDataDTO.lastname,
          profilePicture: createMemberDataDTO.profilePicture,
        })
        .returning();
      console.log('Datos del miembro creados:', memberData);
      return memberData
    }

    async updateMemberData(memberId,updateMemberDataDTO: UpdateMemberDataDTO) {
      const [memberData] = await this.db
        .update(membersData)
        .set({
          name: updateMemberDataDTO.name,
          lastname: updateMemberDataDTO.lastname,
          profilePicture: updateMemberDataDTO.profilePicture,
        })
        .where(eq(membersData.memberId, memberId))
        .returning();

      console.log('Datos del miembro actualizados:', memberData);

      return memberData;
    }

}
