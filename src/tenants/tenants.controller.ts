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
} from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PaginationDto } from '../global/paginacion.dto';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantsController {
  
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear tenant',
    description: 'Crea un nuevo tenant.',
  })
  async create(
    @Body() createTenantDto: CreateTenantDto,
  ) {
    return this.tenantsService.create(createTenantDto);
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
    summary: 'Mostrar todos los tenants, con paginación',
    description: 'Mostrar todos los tenants, sin filtros y ordenados por fecha de creación en orden descendente.',
  })
  async findAll(
    @Query() pagination: PaginationDto,
  ) {
    return this.tenantsService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id',new ParseUUIDPipe({ version:'4'})) id: string) {
    return this.tenantsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id',new ParseUUIDPipe({ version:'4'})) id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.update(id, updateTenantDto);
  } 

  @Post(':id')
  remove(@Param('id',new ParseUUIDPipe({ version:'4'})) id: string) {
    return this.tenantsService.toggleStatus(id);
  }
}
