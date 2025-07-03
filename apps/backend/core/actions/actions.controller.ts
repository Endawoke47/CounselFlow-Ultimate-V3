import type { TCreateActionRequest } from '1pd-types';
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
import { ActionsService } from './actions.service';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { Action } from './entities/action.entity';

@ApiTags('actions')
@Controller('actions')
@UseGuards(JwtAuthGuard)
export class ActionsController extends createCrudController<
  Action,
  CreateActionDto,
  UpdateActionDto,
  Action,
  Paginated<Action>
>(Action, CreateActionDto, UpdateActionDto) {
  constructor(service: ActionsService) {
    super(service);
  }

  @Post()
  @ApiBody({
    type: CreateActionDto,
    examples: {
      example1: {
        summary: 'Create a new top-level action',
        description: 'Create a new action with all required fields',
        value: {
          matterId: 1,
          title: 'File Motion to Dismiss',
          description:
            'Prepare and file a motion to dismiss based on lack of jurisdiction',
          type: 'Task',
          status: 'Not Started',
          priority: 'Medium',
          startDate: '2024-04-15T09:00:00.000Z',
          dueDate: '2024-04-30T17:00:00.000Z',
          assignedToId: 1,
          dependencyIds: [1, 2],
          recurring: false,
          attachments: [
            {
              name: 'Draft Motion.docx',
              path: '/documents/12345',
            },
          ],
          reminderSettings: {
            reminder_offset_days: 7,
            reminder_type: 'email',
          },
        } as TCreateActionRequest,
      },
      example2: {
        summary: 'Create a new sub-action',
        description: 'Create a new action as a child of an existing action',
        value: {
          matterId: 1,
          parentId: 1, // ID of the parent action
          title: 'Draft Motion Document',
          description: 'Prepare the initial draft of the motion to dismiss',
          type: 'Task',
          status: 'Not Started',
          priority: 'Medium',
          startDate: '2024-04-15T09:00:00.000Z',
          dueDate: '2024-04-20T17:00:00.000Z',
          assignedToId: 2,
          recurring: false,
        } as TCreateActionRequest,
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The action has been successfully created.',
    type: Action,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input - check the request body',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to create actions',
  })
  async create(
    @Body(ValidationPipe) createActionDto: CreateActionDto,
  ): Promise<Action> {
    return super.create(createActionDto);
  }

  @Patch(':id')
  @ApiBody({
    type: UpdateActionDto,
    examples: {
      example1: {
        summary: 'Update an action',
        description: 'Update an action with the given id',
        value: {
          title: 'Updated Action Title',
          description: 'Updated action description',
          status: 'In Progress',
          priority: 'High',
          assignedToId: 2,
          completionDate: '2024-04-20T15:30:00.000Z',
        } as UpdateActionDto,
      },
    },
  })
  @ApiOperation({ summary: 'Update an action' })
  @ApiResponse({
    status: 200,
    description: 'The action has been successfully updated.',
    type: Action,
  })
  @ApiNotFoundResponse({
    description: 'Action with the given id was not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input - check the request body or ID format',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to update this action',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateActionDto: UpdateActionDto,
  ): Promise<Action> {
    return super.update(id, updateActionDto);
  }
}
