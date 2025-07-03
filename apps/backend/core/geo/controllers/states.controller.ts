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
import { createCrudController } from '../../../shared/crud.controller';
import { CreateStateDto } from '../dto/create-state.dto';
import { UpdateStateDto } from '../dto/update-state.dto';
import { State } from '../entities/state.entity';
import { StatesService } from '../services/states.service';
@ApiTags('States')
@Controller('geo/states')
@UseGuards(JwtAuthGuard)
export class StatesController extends createCrudController<
  State,
  CreateStateDto,
  UpdateStateDto,
  State,
  Paginated<State>
>(State, CreateStateDto, UpdateStateDto) {
  constructor(private readonly statesService: StatesService) {
    super(statesService);
  }

  @Post()
  @ApiExcludeEndpoint()
  @ApiResponse({ status: 405, description: 'Method not allowed' })
  async create(@Body() _createStateDto: CreateStateDto): Promise<State> {
    throw new MethodNotAllowedException('Creating states is not allowed');
  }

  @Patch(':id')
  @ApiExcludeEndpoint()
  @ApiResponse({ status: 405, description: 'Method not allowed' })
  async update(
    @Param('id', ParseIntPipe) _id: number,
    @Body() _updateStateDto: UpdateStateDto,
  ): Promise<State> {
    throw new MethodNotAllowedException('Updating states is not allowed');
  }

  @Delete(':id')
  @ApiExcludeEndpoint()
  @ApiResponse({ status: 405, description: 'Method not allowed' })
  async delete(@Param('id', ParseIntPipe) _id: number): Promise<void> {
    throw new MethodNotAllowedException('Deleting states is not allowed');
  }

  @Post(':id/restore')
  @ApiExcludeEndpoint()
  @ApiResponse({ status: 405, description: 'Method not allowed' })
  async restore(@Param('id', ParseIntPipe) _id: number): Promise<void> {
    throw new MethodNotAllowedException('Restoring states is not allowed');
  }
}
