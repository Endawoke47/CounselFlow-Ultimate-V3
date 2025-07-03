import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Paginated } from 'nestjs-paginate';
import { createCrudController } from 'src/shared/crud.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { Sector } from './entities/sector.entity';
import { SectorsService } from './sectors.service';

@ApiTags('Sectors')
@Controller('sectors')
@UseGuards(JwtAuthGuard)
export class SectorsController extends createCrudController<
  Sector,
  CreateSectorDto,
  UpdateSectorDto,
  Sector,
  Paginated<Sector>
>(Sector, CreateSectorDto, UpdateSectorDto) {
  constructor(service: SectorsService) {
    super(service);
  }

  @Post()
  @ApiBody({
    type: CreateSectorDto,
    examples: {
      example1: {
        summary: 'Create a new sector',
        description: 'Create a new sector with the given name',
        value: { name: 'Technology' } as CreateSectorDto,
      },
    },
  })
  @ApiOkResponse({
    description: 'The sector has been successfully created',
    type: Sector,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input - check the request body',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to create sectors',
  })
  async create(
    @Body(ValidationPipe) createSectorDto: CreateSectorDto,
  ): Promise<Sector> {
    return this.service.create(createSectorDto);
  }

  @Patch(':id')
  @ApiBody({
    type: UpdateSectorDto,
    examples: {
      example1: {
        summary: 'Update a sector',
        description: 'Update a sector with the given id',
        value: { name: 'Technology' } as UpdateSectorDto,
      },
    },
  })
  @ApiOkResponse({
    description: 'The sector has been successfully updated',
    type: Sector,
  })
  @ApiNotFoundResponse({
    description: 'Sector with the given id was not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input - check the request body or ID format',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to update this sector',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSectorDto: UpdateSectorDto,
  ): Promise<Sector> {
    return this.service.update(id, updateSectorDto);
  }
}
