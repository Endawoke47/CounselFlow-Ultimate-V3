import {
  Body,
  Controller,
  Delete,
  MethodNotAllowedException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Paginated } from 'nestjs-paginate';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { createCrudController } from 'src/shared/crud.controller';
import { CreateCountryDto } from '../dto/create-country.dto';
import { UpdateCountryDto } from '../dto/update-country.dto';
import { Country } from '../entities/country.entity';
import { CountriesService } from '../services/countries.service';
@ApiTags('Countries')
@Controller('geo/countries')
@UseGuards(JwtAuthGuard)
export class CountriesController extends createCrudController<
  Country,
  CreateCountryDto,
  UpdateCountryDto,
  Country,
  Paginated<Country>
>(Country, CreateCountryDto, UpdateCountryDto) {
  constructor(private readonly countriesService: CountriesService) {
    super(countriesService);
  }

  @Post()
  @ApiExcludeEndpoint()
  @ApiResponse({ status: 405, description: 'Method not allowed' })
  async create(@Body() _createCountryDto: CreateCountryDto): Promise<Country> {
    throw new MethodNotAllowedException('Creating countries is not allowed');
  }

  @Patch(':id')
  @ApiExcludeEndpoint()
  @ApiResponse({ status: 405, description: 'Method not allowed' })
  async update(
    @Param('id', ParseIntPipe) _id: number,
    @Body() _updateCountryDto: UpdateCountryDto,
  ): Promise<Country> {
    throw new MethodNotAllowedException('Updating countries is not allowed');
  }

  @Delete(':id')
  @ApiExcludeEndpoint()
  @ApiResponse({ status: 405, description: 'Method not allowed' })
  async delete(@Param('id', ParseIntPipe) _id: number): Promise<void> {
    throw new MethodNotAllowedException('Deleting countries is not allowed');
  }

  @Post(':id/restore')
  @ApiExcludeEndpoint()
  @ApiResponse({ status: 405, description: 'Method not allowed' })
  async restore(@Param('id', ParseIntPipe) _id: number): Promise<void> {
    throw new MethodNotAllowedException('Restoring countries is not allowed');
  }
}
