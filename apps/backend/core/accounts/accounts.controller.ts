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
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Paginated } from 'nestjs-paginate';
import { createCrudController } from 'src/shared/crud.controller';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import Account from './entities/account.entity';
@ApiTags('Accounts')
@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController extends createCrudController<
  Account,
  CreateAccountDto,
  UpdateAccountDto,
  Account,
  Paginated<Account>
>(Account, CreateAccountDto, UpdateAccountDto) {
  constructor(service: AccountsService) {
    super(service);
  }

  @Post()
  @ApiBody({
    type: CreateAccountDto,
    examples: {
      example1: {
        summary: 'Create a new account',
        description: 'Create a new account with the given name',
        value: {
          isAdmin: false,
          organizationSize: 'CORPORATION',
        } as CreateAccountDto,
      },
    },
  })
  @ApiOkResponse({
    description: 'The account has been successfully created',
    type: Account,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input - check the request body',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to create accounts',
  })
  async create(
    @Body(ValidationPipe) createAccountDto: CreateAccountDto,
  ): Promise<Account> {
    return super.create(createAccountDto);
  }

  @Patch(':id')
  @ApiBody({
    type: UpdateAccountDto,
    examples: {
      example1: {
        summary: 'Update an account',
        description: 'Update an account with the given id',
        value: {
          isAdmin: false,
          organizationSize: 'CORPORATION',
        } as UpdateAccountDto,
      },
    },
  })
  @ApiOkResponse({
    description: 'The account has been successfully updated',
    type: Account,
  })
  @ApiNotFoundResponse({
    description: 'Account with the given id was not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input - check the request body or ID format',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have permission to update this account',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    return super.update(id, updateAccountDto);
  }
}
