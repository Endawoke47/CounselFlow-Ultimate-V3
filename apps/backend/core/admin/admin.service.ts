import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { AccountsService } from 'src/modules/accounts/accounts.service';
import { CompaniesService } from 'src/modules/companies/companies.service';
import { UsersService } from 'src/modules/users/users.service';
import { configService, Env } from 'src/services/config.service';
import { DataSource, QueryRunner } from 'typeorm';
import { executeInTransaction } from '../../utils/transaction.util';
import { CompanyAccountType } from '../companies/entities/company-account.entity';
import { CreateLawyerAccountDto } from './dto/createLawyerAccount.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UsersService,
    private readonly companyService: CompaniesService,
    private readonly accountService: AccountsService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createAdminAccount() {
    return executeInTransaction(async (queryRunner: QueryRunner) => {
      const geoData = {
        cityId: 25507, // Nairobi
        countryId: 113, // Kenya
        stateId: 2007, // Nairobi
      };
      const ADMIN_COMPANY_NAME = configService.get(Env.ADMIN_COMPANY_NAME);
      const ADMIN_COMPANY_USER = configService.get(Env.ADMIN_COMPANY_USER);
      const ADMIN_COMPANY_PASS = configService.get(Env.ADMIN_COMPANY_PASS);

      let accounts = await this.accountService.find(
        {
          path: '/admin/accounts',
          page: 1,
          limit: 100,
          filter: {
            isAdmin: ['true'],
          },
        },
        false,
        queryRunner,
      );

      if (accounts.data.length > 1) {
        throw new BadRequestException('There should be only one admin account');
      }

      if (accounts.data.length === 0) {
        await this.accountService.create(
          {
            organizationSize: '1-10',
            isAdmin: true,
          },
          undefined,
          queryRunner,
        );

        accounts = await this.accountService.find(
          {
            path: '/admin/accounts',
            page: 1,
            limit: 100,
            filter: {
              isAdmin: ['true'],
            },
          },
          false,
          queryRunner,
        );
      }

      const existingAdminCompany = await this.companyService.find(
        {
          path: '/companies',
          page: 1,
          limit: 1,
          filter: {
            name: [ADMIN_COMPANY_NAME],
            'companyAccounts.account.id': [String(accounts.data[0].id)],
          },
        },
        false,
        queryRunner,
      );

      let company = existingAdminCompany.data[0] || null;

      if (company === null) {
        company = await this.companyService.create(
          {
            name: ADMIN_COMPANY_NAME,
            address: '1PD',
            contact: '1PD',
            type: CompanyAccountType.ADMIN,
            ...geoData,
            accountId: accounts.data[0].id,
          },
          queryRunner,
        );
      }

      // Check if user exists in our database
      let user = null;
      try {
        user = await this.userService.findByEmail(
          ADMIN_COMPANY_USER,
          company.id,
          queryRunner,
        );
      } catch (error) {
        if (!(error instanceof NotFoundException)) {
          throw error;
        }

        // If user doesn't exist, create it (the create method will check Auth0)
        user = await this.userService.create(
          {
            email: ADMIN_COMPANY_USER,
            firstName: 'John',
            lastName: 'Doe',
            middleName: 'Johnny',
            phone: 'Phone number',
            bestWayToContact: 'Best way to contact',
            password: ADMIN_COMPANY_PASS,
            companyId: company.id,
            title: 'CTO',
            department: 'IT',
            ...geoData,
          },
          queryRunner,
        );
      }

      return user;
    }, this.dataSource);
  }

  async createLawyerAccount(lawyerAccountDto: CreateLawyerAccountDto) {
    return executeInTransaction(async (queryRunner: QueryRunner) => {
      const geoData = {
        cityId: 25507, // Nairobi
        countryId: 113, // Kenya
        stateId: 2007, // Nairobi
      };

      const account = await this.accountService.create(
        {
          organizationSize: '1-10',
          isAdmin: false,
        },
        undefined,
        queryRunner,
      );

      const company = await this.companyService.create(
        {
          name: lawyerAccountDto.companyName,
          address: lawyerAccountDto.companyAddress || '',
          contact: lawyerAccountDto.companyContact || '',
          type: CompanyAccountType.LAWYER,
          ...geoData,
          accountId: account.id,
        },
        queryRunner,
      );

      // Check if user exists in our database
      let user = null;
      try {
        user = await this.userService.findByEmail(
          lawyerAccountDto.email,
          company.id,
          queryRunner,
        );
      } catch (error) {
        if (!(error instanceof NotFoundException)) {
          throw error;
        }

        // If user doesn't exist, create it (the create method will check Auth0)
        user = await this.userService.create(
          {
            email: lawyerAccountDto.email,
            firstName: lawyerAccountDto.firstName,
            lastName: lawyerAccountDto.lastName,
            middleName: lawyerAccountDto.middleName || '',
            phone: lawyerAccountDto.phone,
            bestWayToContact: lawyerAccountDto.bestWayToContact || '',
            password: lawyerAccountDto.password,
            companyId: company.id,
            title: lawyerAccountDto.title || '',
            department: lawyerAccountDto.department || '',
            ...geoData,
          },
          queryRunner,
        );
      }

      return user;
    }, this.dataSource);
  }
}
