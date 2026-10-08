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
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { PaginationDto } from '../global/paginacion.dto';

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
}
