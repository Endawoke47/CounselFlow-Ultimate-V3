import { TCreateCategoryRequest } from '1pd-types';
import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
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
import { createCrudController } from '../../shared/crud.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController extends createCrudController<
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  Category,
  Paginated<Category>
>(Category, CreateCategoryDto, UpdateCategoryDto) {
  constructor(private readonly categoriesService: CategoriesService) {
    super(categoriesService);
  }

  // Override the create method to provide correct API documentation
  @Post()
  @ApiBody({
    type: CreateCategoryDto,
    examples: {
      example1: {
        summary: 'Create a new category',
        description: 'Create a new category with the given name',
        value: { name: 'Technology' } as TCreateCategoryRequest,
      },
    },
  })
  @ApiOkResponse({
    description: 'The category has been successfully created',
    type: Category,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input - check the request body',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to create categories',
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return super.create(createCategoryDto);
  }

  @Patch(':id')
  @ApiBody({
    type: UpdateCategoryDto,
    examples: {
      example1: {
        summary: 'Update a category',
        description: 'Update a category with the given id',
        value: { name: 'Technology' } as UpdateCategoryDto,
      },
    },
  })
  @ApiOkResponse({
    description: 'The category has been successfully updated',
    type: Category,
  })
  @ApiNotFoundResponse({
    description: 'Category with the given id was not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input - check the request body or ID format',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to update this category',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return super.update(id, updateCategoryDto);
  }
}
