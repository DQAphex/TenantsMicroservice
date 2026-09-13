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
  Put,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { MembersService } from './members.service';
import { QueryMemberDto } from './dto/query_member.dto';
import { CreateMemberDto } from './dto/create-member.dto';
import { PaginationDto } from '../global/paginacion.dto';
import { CreateMemberDataDTO } from './dto/create-member-data.dto';
import { UpdateMemberDataDTO } from './dto/update-member-data.dto';

@ApiTags('Members')
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create Member',
    description: 'Creates a new member.',
  })
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
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
    required: true,
    description: 'Cantidad de registros a mostrar por página.',
    example: 10,
  })
  @ApiOperation({
    summary: 'Mostrar todos los members, con paginación',
    description:
      'Mostrar todos los members, sin filtros y ordenados por fecha de creación en orden descendente.',
  })
  async findAll(
    @Query() pagination: PaginationDto,
  ) {
    return this.membersService.findAll(pagination);
  }

  @Get('/data/:memberId')
  @ApiOperation({
    summary: 'Obtener datos de un miembro',
    description: 'Obtiene los datos adicionales de un miembro específico utilizando su ID.',
  })
  async getMemberDataById(
    @Param('memberId', new ParseUUIDPipe({ version: '4' }))
    memberId: string,
  ) {
    return this.membersService.getMemberDataById(memberId);
  }

  @Post('/data/:memberId')
  @ApiOperation({
    summary: 'Crear datos de un miembro',
    description: 'Crea los datos adicionales de un miembro específico utilizando su ID.',
  })
  async createMemberData(
    @Param('memberId', new ParseUUIDPipe({ version: '4' }))
    memberId: string,
    @Body() createMemberDataDTO: CreateMemberDataDTO,
  ) {
    return this.membersService.createMemberData({
      ...createMemberDataDTO,
      memberId,
    });
  }

  @Put('/data/:memberId')
  @ApiOperation({
    summary: 'Actualizar datos de un miembro',
    description: 'Actualiza los datos adicionales de un miembro específico utilizando su ID.',
  })
  async updateMemberData(
    @Param('memberId', new ParseUUIDPipe({ version: '4' }))
    memberId: string,
    @Body() updateMemberDataDTO: UpdateMemberDataDTO,
  ) {
    return this.membersService.updateMemberData(
      memberId,
      updateMemberDataDTO,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
  ) {
    return this.membersService.findOne(id);
  }

  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
  ) {
    return this.membersService.toggleStatus(id);
  }
}

