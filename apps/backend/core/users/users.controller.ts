import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Paginated } from 'nestjs-paginate';
import { createCrudController } from 'src/shared/crud.controller';
import { CompanyTypeAccess } from '../auth/decorators/company-type.decorator';
import { CompanyType } from '../auth/decorators/company-type.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRole } from '../auth/decorators/roles.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateUserDto, UpdateUserDto } from './dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@UseGuards(JwtAuthGuard)
// @UseGuards(RolesGuard)
// @UseGuards(CompanyTypeGuard)
@Controller('users')
export class UsersController extends createCrudController<
  User,
  CreateUserDto,
  UpdateUserDto,
  User,
  Paginated<User>
>(User, CreateUserDto, UpdateUserDto) {
  constructor(private readonly usersService: UsersService) {
    super(usersService);
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get current user information',
  })
  @ApiOkResponse({
    description: 'Current user information retrieved successfully',
    type: User,
  })
  @CompanyTypeAccess(CompanyType.ADMIN)
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get current user information' })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiResponse({ status: 200, description: 'Return current user information' })
  async getCurrentUser(@CurrentUser() curUser: any): Promise<User> {
    return curUser;
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new user',
  })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      example1: {
        summary: 'Create a new user',
        description: 'Create a new user with required fields',
        value: {
          email: 'test@test.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'somepass',
          companyId: 1,
          countryId: 1,
          stateId: 1,
          cityId: 1,
        } as CreateUserDto,
      },
    },
  })
  @ApiOkResponse({
    description: 'The user has been successfully created',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input - check the request body',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to create users',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return super.create(createUserDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a user',
  })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      example1: {
        summary: 'Update a user',
        description: 'Update an existing user with new details',
        value: {
          email: 'test@test.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'somepass',
          companyId: 1,
          countryId: 1,
          stateId: 1,
          cityId: 1,
        } as UpdateUserDto,
      },
    },
  })
  @ApiOkResponse({
    description: 'The user has been successfully updated',
    type: User,
  })
  @ApiNotFoundResponse({
    description: 'User with the given id was not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input - check the request body or ID format',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to update this user',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return super.update(id, updateUserDto);
  }

  @Get('/company/:companyId')
  @ApiOperation({
    summary: 'Get users by company ID. Use /users?filter.company.id=2 instead',
    deprecated: true,
  })
  @ApiQuery({
    name: 'withDeleted',
    required: false,
    type: Boolean,
    description: 'Include deleted users in the response',
  })
  @ApiOkResponse({
    description: 'Users retrieved successfully',
    type: [User],
  })
  @ApiBadRequestResponse({
    description: 'Invalid company ID format',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to view company users',
  })
  async getCompanyUsers(
    @Param('companyId') companyId: string,
    @Query('withDeleted', new ParseBoolPipe({ optional: true }))
    withDeleted: boolean = false,
  ) {
    return await this.usersService.find(
      {
        page: 1,
        limit: 100,
        path: 'users',
        filter: { 'company.id': companyId },
      },
      withDeleted,
    );
  }

  @Get('/account/:accountId')
  @ApiOperation({
    summary:
      'Get users by account ID. Use /users?filter.company.companyAccounts.accountId=1 instead',
    deprecated: true,
  })
  @ApiQuery({
    name: 'withDeleted',
    required: false,
    type: Boolean,
    description: 'Include deleted users in the response',
  })
  @ApiOkResponse({
    description: 'Users retrieved successfully',
    type: [User],
  })
  @ApiBadRequestResponse({
    description: 'Invalid account ID format',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to view account users',
  })
  async getAccountUsers(
    @Param('accountId') accountId: string,
    @Query('withDeleted', new ParseBoolPipe({ optional: true }))
    withDeleted: boolean = false,
  ) {
    return await this.usersService.find(
      {
        page: 1,
        limit: 100,
        path: 'users',
        filter: { 'company.companyAccounts.accountId': accountId },
      },
      withDeleted,
    );
  }
}
