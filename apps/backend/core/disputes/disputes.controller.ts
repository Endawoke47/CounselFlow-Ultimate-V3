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
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { UpdateDisputeDto } from './dto/update-dispute.dto';
import { Dispute, DisputeStatus, DisputeType } from './entities/dispute.entity';
import { DisputesService } from './services/disputes.service';

@ApiTags('disputes')
@Controller('disputes')
@UseGuards(JwtAuthGuard)
export class DisputesController extends createCrudController<
  Dispute,
  CreateDisputeDto,
  UpdateDisputeDto,
  Dispute,
  Paginated<Dispute>
>(Dispute, CreateDisputeDto, UpdateDisputeDto) {
  constructor(service: DisputesService) {
    super(service);
  }

  @Post()
  @ApiBody({
    type: CreateDisputeDto,
    examples: {
      example1: {
        summary: 'Create a new dispute',
        description: 'Create a new dispute with the given data',
        value: {
          matterId: '1',
          contractId: '1',
          initiatingCompanyId: '1',
          title: 'Late Delivery Penalty Dispute with Acme Corp',
          type: DisputeType.LITIGATION,
          description:
            'Dispute regarding the interpretation of delivery timeline in section 3.2 of the contract',
          status: DisputeStatus.PRE_FILING,
          parties: [
            {
              companyId: '2',
              role: 'Defendant',
              representative: 'John Doe',
            },
          ],
          amountClaimed: 100000,
          currency: 'USD',
          jurisdiction: 'New York Supreme Court',
          leadAttorneyId: '1',
          notes: 'Weekly status updates required for executive team',
          filingDate: '2023-01-15',
          estimatedCost: 50000,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The dispute has been successfully created.',
    type: Dispute,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input - check the request body',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to create disputes',
  })
  async create(
    @Body(ValidationPipe) createDisputeDto: CreateDisputeDto,
  ): Promise<Dispute> {
    return super.create(createDisputeDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a dispute' })
  @ApiBody({
    type: UpdateDisputeDto,
    examples: {
      example1: {
        summary: 'Update an existing dispute',
        description: 'Update a dispute with the given data',
        value: {
          matterId: '1',
          contractId: '1',
          initiatingCompanyId: '1',
          title: 'Updated Late Delivery Penalty Dispute with Acme Corp',
          type: DisputeType.LITIGATION,
          description:
            'Updated dispute regarding the interpretation of delivery timeline in section 3.2 of the contract',
          status: DisputeStatus.FILED,
          parties: [
            {
              companyId: '2',
              role: 'Defendant',
              representative: 'John Doe',
            },
          ],
          amountClaimed: 120000,
          currency: 'USD',
          jurisdiction: 'New York Supreme Court',
          leadAttorneyId: '1',
          notes: 'Updated weekly status updates required for executive team',
          filingDate: '2023-02-01',
          estimatedCost: 60000,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The dispute has been successfully updated.',
    type: Dispute,
  })
  @ApiNotFoundResponse({
    description: 'Dispute not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to update disputes',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDisputeDto: UpdateDisputeDto,
  ): Promise<Dispute> {
    return super.update(id, updateDisputeDto);
  }
}
