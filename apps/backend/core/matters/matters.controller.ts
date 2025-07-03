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
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Paginated } from 'nestjs-paginate';
import { createCrudController } from 'src/shared/crud.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMatterDto } from './dto/create-matter.dto';
import { UpdateMatterDto } from './dto/update-matter.dto';
import { Matter } from './entities/matter.entity';
import { MattersService } from './matters.service';

@ApiTags('matters')
@Controller('matters')
@UseGuards(JwtAuthGuard)
export class MattersController extends createCrudController<
  Matter,
  CreateMatterDto,
  UpdateMatterDto,
  Matter,
  Paginated<Matter>
>(Matter, CreateMatterDto, UpdateMatterDto) {
  constructor(service: MattersService) {
    super(service);
  }

  @Post()
  @ApiBody({
    type: CreateMatterDto,
    examples: {
      example1: {
        summary: 'Create a new matter',
        description: 'Create a new matter with the given data',
        value: {
          companyId: '1',
          name: 'Matter Name',
          type: 'Contract',
          subtype: 'Patent Infringement',
          status: 'Active',
          priority: 'High',
          description: 'Matter description',
          keyDates: [
            {
              date: '2025-05-30',
              description: 'Closing Deadline',
            },
          ],
        } as CreateMatterDto,
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The matter has been successfully created.',
    type: Matter,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input - check the request body',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to create matters',
  })
  async create(
    @Body(ValidationPipe) createMatterDto: CreateMatterDto,
  ): Promise<Matter> {
    return super.create(createMatterDto);
  }

  @Patch(':id')
  @ApiBody({
    type: UpdateMatterDto,
    examples: {
      example1: {
        summary: 'Update a matter',
        description: 'Update a matter with the given id',
        value: {
          name: 'Updated Matter Name',
          description: 'Updated matter description',
        } as UpdateMatterDto,
      },
    },
  })
  @ApiOperation({ summary: 'Update a matter' })
  @ApiResponse({
    status: 200,
    description: 'The matter has been successfully updated.',
    type: Matter,
  })
  @ApiNotFoundResponse({
    description: 'Matter with the given id was not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input - check the request body or ID format',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to update this matter',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMatterDto: UpdateMatterDto,
  ) {
    return super.update(id, updateMatterDto);
  }
}
