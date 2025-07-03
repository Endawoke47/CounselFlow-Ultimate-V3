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
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { Contract } from './entities/contract.entity';
import { ContractsService } from './services/contracts.service';

@ApiTags('contracts')
@Controller('contracts')
@UseGuards(JwtAuthGuard)
export class ContractsController extends createCrudController<
  Contract,
  CreateContractDto,
  UpdateContractDto,
  Contract,
  Paginated<Contract>
>(Contract, CreateContractDto, UpdateContractDto) {
  constructor(service: ContractsService) {
    super(service);
  }

  @Post()
  @ApiBody({
    type: CreateContractDto,
    examples: {
      example1: {
        summary: 'Create a new contract',
        description: 'Create a new contract with the given data',
        value: {
          contractTitle: 'Master Services Agreement with Acme Corp',
          contractType: 'Sales',
          status: 'Draft',
          priority: 'High',
          description:
            'This agreement covers all consulting services provided to Acme Corp for their digital transformation project.',
          partiesInvolved: [
            { entity_id: '1', role: 'Vendor', signatory: 'John Doe' },
          ],
          counterpartyName: 'Acme Corporation',
          effectiveDate: '2023-01-01',
          executionDate: '2022-12-15',
          expirationDate: '2024-12-31',
          valueAmount: 100000.0,
          valueCurrency: 'USD',
          paymentTerms:
            'Monthly installments of $10,000 due on the 1st of each month',
          notes: 'This contract replaces our previous agreement from 2020',
        } as unknown as CreateContractDto,
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The contract has been successfully created.',
    type: Contract,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input - check the request body',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to create contracts',
  })
  async create(
    @Body(ValidationPipe) createContractDto: CreateContractDto,
  ): Promise<Contract> {
    return super.create(createContractDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contract' })
  @ApiResponse({
    status: 200,
    description: 'The contract has been successfully updated.',
    type: Contract,
  })
  @ApiNotFoundResponse({
    description: 'Contract not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to update contracts',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContractDto: UpdateContractDto,
  ): Promise<Contract> {
    return super.update(id, updateContractDto);
  }
}
