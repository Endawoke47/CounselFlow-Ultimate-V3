import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '../users/entities/user.entity';
import { AdminService } from './admin.service';
import { CreateLawyerAccountDto } from './dto/createLawyerAccount.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create-admin-account')
  @ApiOperation({
    summary: 'Create an admin account',
    description: 'Creates a new admin account',
  })
  @ApiCreatedResponse({
    description: 'Admin account has been successfully created',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or account already exists',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have admin privileges',
  })
  async createAdminAccount() {
    return this.adminService.createAdminAccount();
  }

  @Post('create-lawyer-account')
  @ApiOperation({
    summary: 'Create a lawyer account',
    description: 'Creates a new lawyer account with company and user details',
  })
  @ApiBody({
    type: CreateLawyerAccountDto,
    description: 'Lawyer account creation data',
  })
  @ApiCreatedResponse({
    description: 'Lawyer account has been successfully created',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input or account already exists',
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authenticated',
  })
  @ApiForbiddenResponse({
    description: 'User does not have admin privileges',
  })
  async createLawyerAccount(@Body() lawyerAccountDto: CreateLawyerAccountDto) {
    return this.adminService.createLawyerAccount(lawyerAccountDto);
  }
}
