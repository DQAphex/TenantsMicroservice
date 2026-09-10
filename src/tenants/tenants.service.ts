import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { count, asc, desc, eq } from 'drizzle-orm';

import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PaginationDto } from '../global/paginacion.dto';

import { DRIZZLE } from '../database/database.provider';
import { tenants } from '../database/schema/tenants.schema';
import { tenantTypeEnum, statusEnum} from '../database/schema/enums';

@Injectable()
export class TenantsService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: any,
  ) {}

  async create(createTenantDto: CreateTenantDto) {
    const [tenant] = await this.db
      .insert(tenants)
      .values({
        name: createTenantDto.name,
        rut: createTenantDto.rut,
        dv: createTenantDto.dv,
        type: createTenantDto.type,
      })
      .returning();

    return tenant;
  }

  async findAll(pagination: PaginationDto) {
    const { page, limit } = pagination;

    const offset = (page - 1) * limit;

    const data = await this.db
      .select()
      .from(tenants)
      .orderBy(desc(tenants.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await this.db
      .select({
        total: count(),
      })
      .from(tenants);

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
      .from(tenants)
      .where(eq(tenants.tenantId,id))

    if(data.length > 0){
      return data[0];
    }
    throw new NotFoundException(`Tenant con id ${id} no encontrado`);
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    const existe = await this.findOne(id);
    const data = await this.db
      .update(tenants)
      .set({
        ...updateTenantDto,
      })
      .where(eq(tenants.tenantId, id))
      .returning()
    const mesage = `Tenant con id ${id} actualizado correctamente`
    return {mesage, data};
  }

  async toggleStatus(id: string) {
    const existe = await this.findOne(id);
    const [ACTIVE, INACTIVE] = statusEnum.enumValues;
    const newStatus = 
      existe.status === ACTIVE ? INACTIVE : ACTIVE;
    const data = await this.db
      .update(tenants)
      .set({status : newStatus})
      .where(eq(tenants.tenantId, id))
      .returning()
    const mesage = `Tenant con id ${id} eliminado correctamente`
    return {mesage, data};
  }
}