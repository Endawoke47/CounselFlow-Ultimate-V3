import {
  TCreateRiskResponse,
  TFindManyRisksResponse,
  TRiskResponse,
  TUpdateRiskResponse,
} from '1pd-types';
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
import { createCrudController } from 'src/shared/crud.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRiskDto } from './dto/create-risk.dto';
import { UpdateRiskDto } from './dto/update-risk.dto';
import { Risk } from './entities/risk.entity';
import { mapRiskToResponse } from './mappers/risk.mapper';
import { RisksService } from './risks.service';

@ApiTags('risks')
@Controller('risks')
@UseGuards(JwtAuthGuard)
export class RisksController extends createCrudController<
  Risk,
  CreateRiskDto,
  UpdateRiskDto,
  TRiskResponse,
  TFindManyRisksResponse
>(Risk, CreateRiskDto, UpdateRiskDto, mapRiskToResponse) {
  constructor(private readonly risksService: RisksService) {
    super(risksService);
  }

  @Post()
  @ApiBody({
    type: CreateRiskDto,
    examples: {
      example1: {
        summary: 'Create a new risk',
        description: 'Create a new risk with required and optional fields',
        value: {
          matterId: 1,
          name: 'Breach of Contract Penalty',
          category: 'Legal',
          description:
            'This risk involves potential penalties for late delivery as specified in section 4.2 of the contract.',
          inherentLikelihood: 'Possible',
          financialImpactMin: 50000.0,
          financialImpactMax: 100000.0,
          currency: 'USD',
          priority: 'High',
          tolerance: 'Mitigate',
          mitigationPlan:
            'Implement weekly progress reviews to ensure timely delivery.',
          mitigationStatus: 'In Progress',
          ownerId: 1,
          internalDepartmentCode: 'LEG-001',
          documentAccess: 'Legal Team Only',
          documentLinks: ['/docs/risk_assessment.pdf'],
          reputationalAssessment: 'Medium',
          identificationDate: '2023-01-15',
          reviewDate: '2023-04-15',
          regulatoryImplications: true,
          relatedRegulations: ['GDPR', 'SOX'],
          status: 'Assessed',
          notes: 'Risk level may change after Q3 financial review.',
        } as CreateRiskDto,
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The risk has been successfully created.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input - check the request body',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to create risks',
  })
  async create(
    @Body(ValidationPipe) createRiskDto: CreateRiskDto,
  ): Promise<TCreateRiskResponse> {
    const result = await super.create(createRiskDto);
    return result as TCreateRiskResponse;
  }

  @Patch(':id')
  @ApiBody({
    type: UpdateRiskDto,
    examples: {
      example1: {
        summary: 'Update a risk',
        description: 'Update a risk with partial fields',
        value: {
          name: 'Updated Risk Name',
          description: 'Updated risk description',
          priority: 'Medium',
          mitigationStatus: 'Completed',
          reviewDate: '2023-07-15',
          status: 'Monitored',
          notes:
            'Risk has been successfully mitigated through contract renegotiation.',
        } as UpdateRiskDto,
      },
    },
  })
  @ApiOperation({ summary: 'Update a risk' })
  @ApiResponse({
    status: 200,
    description: 'The risk has been successfully updated.',
  })
  @ApiNotFoundResponse({
    description: 'Risk with the given id was not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input - check the request body or ID format',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to update this risk',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRiskDto: UpdateRiskDto,
  ): Promise<TUpdateRiskResponse> {
    const result = await super.update(id, updateRiskDto);
    return result as TUpdateRiskResponse;
  }
}
