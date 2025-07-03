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
import { createCrudController } from '../../shared/crud.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';

@ApiTags('companies')
@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController extends createCrudController<
  Company,
  CreateCompanyDto,
  UpdateCompanyDto,
  Company,
  Paginated<Company>
>(Company, CreateCompanyDto, UpdateCompanyDto) {
  constructor(private readonly companiesService: CompaniesService) {
    super(companiesService);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  @ApiBody({
    type: CreateCompanyDto,
    examples: {
      example1: {
        summary: 'Create a new company',
        description: 'Create a new company with the given details',
        value: {
          name: 'Entity Name',
          description: 'Entity description',
          shareholdersInfo: [
            {
              shareholder_name: 'XYZ Holding Company',
              ownership_percentage: 100,
              share_class: 'Common',
            },
          ],
          directorsInfo: [
            {
              name: 'Jane Doe',
              title: 'Managing Director',
              start_date: '2020-01-01',
            },
          ],
          status: 'Active',
          jurisdictionOfIncorporation: 'United States',
          incorporationDate: '2021-01-01',
          taxId: '12-3456789',
          businessRegNumber: 'REG123456',
          registeredAddress: '123 Main St, City, State, ZIP',
          industrySector: 'Technology',
          fiscalYearEnd: '2021-12-31',
          reportingCurrency: 'USD',
          regulatoryBodies: ['SEC', 'FINRA'],
          notes: 'This is a sample entity',
          parentId: 3,
          childrenIds: [4, 5],
          createdById: 1,
        } as CreateCompanyDto,
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The company has been successfully created.',
    type: Company,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input - check the request body',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to create companies',
  })
  async create(
    @Body(ValidationPipe) createCompanyDto: CreateCompanyDto,
  ): Promise<Company> {
    return super.create(createCompanyDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a company' })
  @ApiBody({
    type: UpdateCompanyDto,
    examples: {
      example1: {
        summary: 'Update a company',
        description: 'Update a company with the given details',
        value: {
          name: 'Updated Entity Name',
          description: 'Updated entity description',
          shareholdersInfo: [
            {
              shareholder_name: 'Updated Holding Company',
              ownership_percentage: 75,
              share_class: 'Preferred',
            },
          ],
          directorsInfo: [
            {
              name: 'John Smith',
              title: 'CEO',
              start_date: '2022-01-01',
            },
          ],
          status: 'Active',
          jurisdictionOfIncorporation: 'United Kingdom',
          incorporationDate: '2021-02-01',
          taxId: 'UK-12345',
          businessRegNumber: 'UK-REG-789',
          registeredAddress: '456 High St, London, UK',
          industrySector: 'Finance',
          fiscalYearEnd: '2022-12-31',
          reportingCurrency: 'GBP',
          regulatoryBodies: ['FCA', 'PRA'],
          notes: 'This is an updated entity',
          parentId: 6,
          childrenIds: [7, 8, 9],
        } as UpdateCompanyDto,
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The company has been successfully updated.',
    type: Company,
  })
  @ApiNotFoundResponse({
    description: 'Company with the given id was not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input - check the request body or ID format',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to update this company',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    return super.update(id, updateCompanyDto);
  }
}
