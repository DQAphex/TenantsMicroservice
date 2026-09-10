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
import { MembersService } from './members.service';
import { QueryMemberDto } from './dto/query_member.dto';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { PaginationDto } from '../global/paginacion.dto';
import { Status } from '../database/schema/enums';


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
    required:true,
    description: 'Cantidad de registros a mostrar por página.',
    example:10,
    })
  @ApiOperation({
    summary: 'Mostrar todos los members, con paginación',
    description: 'Mostrar todos los members, sin filtros y ordenados por fecha de creación en orden descendente.',
  })
  async findAll(
    @Query() pagination: PaginationDto,
  ) {
    return this.membersService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Get()
  query(
    @Query() queryMemberDto: QueryMemberDto
  ) {
    return this.membersService.query(queryMemberDto.tenantId, queryMemberDto.status);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
  //   return this.membersService.update(+id, updateMemberDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.membersService.toggleStatus(id);
  }
}
