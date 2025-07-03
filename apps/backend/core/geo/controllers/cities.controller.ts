import {
  Controller,
  Delete,
  MethodNotAllowedException,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Paginated } from 'nestjs-paginate';
import { createCrudController } from '../../../shared/crud.controller';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateCityDto } from '../dto/create-city.dto';
import { UpdateCityDto } from '../dto/update-city.dto';
import { City } from '../entities/city.entity';
import { CitiesService } from '../services/cities.service';
@ApiTags('Cities')
@Controller('geo/cities')
@UseGuards(JwtAuthGuard)
export class CitiesController extends createCrudController<
  City,
  CreateCityDto,
  UpdateCityDto,
  City,
  Paginated<City>
>(City, CreateCityDto, UpdateCityDto) {
  constructor(private readonly citiesService: CitiesService) {
    super(citiesService);
  }

  @Post()
  @ApiExcludeEndpoint()
  @ApiResponse({ status: 405, description: 'Method not allowed' })
  async create(): Promise<City> {
    throw new MethodNotAllowedException('Creating cities is not allowed');
  }

  @Patch(':id')
  @ApiExcludeEndpoint()
  @ApiResponse({ status: 405, description: 'Method not allowed' })
  async update(): Promise<City> {
    throw new MethodNotAllowedException('Updating cities is not allowed');
  }

  @Delete(':id')
  @ApiExcludeEndpoint()
  @ApiResponse({ status: 405, description: 'Method not allowed' })
  async delete(): Promise<void> {
    throw new MethodNotAllowedException('Deleting cities is not allowed');
  }

  @Post(':id/restore')
  @ApiExcludeEndpoint()
  @ApiResponse({ status: 405, description: 'Method not allowed' })
  async restore(): Promise<void> {
    throw new MethodNotAllowedException('Restoring cities is not allowed');
  }
}
