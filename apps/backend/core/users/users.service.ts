import {
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  paginate,
  PaginateConfig,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate';
import { ICrudService } from 'src/shared/crud-service.interface';
import { DataSource, FindOptionsWhere, In, QueryRunner } from 'typeorm';
import { executeInTransaction } from '../../utils/transaction.util';
import { AccountsService } from '../accounts/accounts.service';
import Account from '../accounts/entities/account.entity';
import { Auth0Service } from '../auth0/auth0.service';
import { CompaniesService } from '../companies/companies.service';
import { CompanyAccount } from '../companies/entities/company-account.entity';
import { CitiesService } from '../geo/services/cities.service';
import { CountriesService } from '../geo/services/countries.service';
import { StatesService } from '../geo/services/states.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { User } from './entities/user.entity';
import { UserRepository } from './users.repository';

interface FindOneUserParams {
  id?: number;
  email?: string;
  uuid?: string;
}

@Injectable()
export class UsersService
  implements ICrudService<User, CreateUserDto, UpdateUserDto>
{
  constructor(
    @InjectRepository(User)
    private readonly userRepo: UserRepository,
    private readonly companyService: CompaniesService,
    private readonly auth0Service: Auth0Service,
    private readonly countriesService: CountriesService,
    private readonly statesService: StatesService,
    private readonly citiesService: CitiesService,
    private readonly accountsService: AccountsService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a new user
   * If a user with the same email exists in Auth0 but not in our database,
   * it will use the Auth0 user data.
   *
   * @param createUserDto User creation data
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The created user
   * @throws HttpException if company does not exist, location data is invalid, or user already exists
   */
  async create(
    createUserDto: CreateUserDto,
    queryRunner?: QueryRunner,
  ): Promise<User> {
    return executeInTransaction(
      async (runner: QueryRunner) => {
        const repository = runner.manager.getRepository(User);

        const company = await this.companyService.findOneByCompanyId(
          createUserDto.companyId,
          false,
          queryRunner,
        );

        if (company === null) {
          throw new HttpException('Company does not exist', 400);
        }

        const state = await this.statesService.findOne(createUserDto.stateId);
        const country = await this.countriesService.findOne(
          createUserDto.countryId,
        );

        const city = createUserDto.cityId
          ? await this.citiesService.findOne(createUserDto.cityId)
          : null;

        if (state === null || country === null || city === null) {
          Logger.warn(
            `Invalid location data: ${JSON.stringify(createUserDto)}`,
          );
          throw new HttpException('Invalid location data', 400);
        }

        const existingUser = await this.userRepo.getUsersByEmailAndCompany(
          createUserDto.email,
          company,
        );

        if (existingUser) {
          throw new HttpException('User already exists', 400);
        }

        let userExistsInAuth0 = false;
        try {
          // Check if user exists in Auth0 before creating
          const auth0Users = await this.getAuth0Users();

          // Filter the Auth0 users by email
          const auth0User = auth0Users.find(
            (u: any) => u.email === createUserDto.email,
          );

          // If the user exists in Auth0, use that data where appropriate
          if (auth0User) {
            Logger.log(`Found user in Auth0: ${JSON.stringify(auth0User)}`);
            userExistsInAuth0 = true;

            // Override with Auth0 data if available
            if (auth0User.given_name) {
              createUserDto.firstName = auth0User.given_name;
            }
            if (auth0User.family_name) {
              createUserDto.lastName = auth0User.family_name;
            }
            if (auth0User.phone_number) {
              createUserDto.phone = auth0User.phone_number;
            }
            if (auth0User.user_metadata?.title) {
              createUserDto.title = auth0User.user_metadata.title;
            }
            if (auth0User.user_metadata?.department) {
              createUserDto.department = auth0User.user_metadata.department;
            }
          }
        } catch (error) {
          // Just log the error but continue with creation using provided data
          Logger.error(
            `Error checking Auth0 for existing user: ${JSON.stringify(error)}`,
          );
        }

        const user = repository.create({
          ...createUserDto,
          middleName: createUserDto.middleName || '',
          phone: createUserDto.phone || '',
          bestWayToContact: createUserDto.bestWayToContact || '',
          title: createUserDto.title || '',
          department: createUserDto.department || '',
          company,
          state,
          country,
          city,
        });

        const savedUser = await repository.save(user);

        // Only create Auth0 user if it doesn't already exist
        if (!userExistsInAuth0) {
          try {
            await this.auth0Service.createUser({
              email: createUserDto.email,
              password: createUserDto.password,
              family_name: createUserDto.lastName,
              connection: 'Username-Password-Authentication',
              user_id: user.uuid,
            });
          } catch (error: any) {
            // If creation fails because user already exists, just log and continue
            if (
              error.response &&
              typeof error.response === 'string' &&
              error.response.includes('already exists')
            ) {
              Logger.warn(
                `Auth0 user already exists for email ${createUserDto.email}`,
              );
            } else {
              // For other errors, throw the exception
              throw error;
            }
          }
        } else {
          Logger.log(
            `Skipping Auth0 user creation as user already exists for email ${createUserDto.email}`,
          );
        }

        return savedUser;
      },
      this.dataSource,
      queryRunner,
    );
  }

  private async findOneBy(
    params: FindOneUserParams,
    companyId?: number,
    withDeleted = false,
    queryRunner?: QueryRunner,
  ): Promise<User> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(User)
      : this.userRepo;
    const where: FindOptionsWhere<User> = {};

    if (params.id) where.id = params.id;
    if (params.email) where.email = params.email;
    if (params.uuid) where.uuid = params.uuid;
    if (companyId) where.company = { id: companyId };

    const user = await repository.findOne({
      where,
      withDeleted,
      relations: [
        'company',
        'company.companyAccounts',
        'company.companyAccounts.account',
        'state',
        'country',
        'city',
      ],
    });

    if (!user) {
      const identifier = params.id || params.email || params.uuid;
      throw new NotFoundException(
        `User with identifier ${identifier} not found`,
      );
    }

    return user;
  }

  /**
   * Retrieves all users with pagination, sorting, filtering and search capabilities
   *
   * @param query Pagination query parameters
   * @param withDeleted Whether to include soft deleted users
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns Paginated array of users
   */
  async find(
    query: PaginateQuery,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<Paginated<User>> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(User)
      : this.userRepo;

    const options: PaginateConfig<User> = {
      sortableColumns: [
        'id',
        'firstName',
        'lastName',
        'email',
        'createdAt',
        'updatedAt',
      ] as (keyof User)[],
      searchableColumns: [
        'firstName',
        'lastName',
        'email',
        'department',
        'title',
      ] as (keyof User)[],
      filterableColumns: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        title: true,
        'company.id': true,
        'company.companyAccounts.accountId': true,
      },
      defaultSortBy: [['lastName', 'ASC']],
      relations: [
        'company',
        'company.companyAccounts',
        'company.companyAccounts.account',
        'state',
        'country',
        'city',
      ],
      withDeleted,
    };

    return paginate(query, repository, options);
  }

  /**
   * Retrieves a user by its ID
   */
  async findOne(
    id: number,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<User> {
    return this.findOneBy({ id }, undefined, withDeleted, queryRunner);
  }

  /**
   * Retrieves a user by email
   */
  async findByEmail(
    email: string,
    companyId?: number,
    queryRunner?: QueryRunner,
  ): Promise<User> {
    return this.findOneBy({ email }, companyId, false, queryRunner);
  }

  /**
   * Retrieves a user by UUID
   */
  async findByUuid(uuid: string, queryRunner?: QueryRunner): Promise<User> {
    return this.findOneBy({ uuid }, undefined, false, queryRunner);
  }

  /**
   * Updates a user
   *
   * @param id ID of the user to update
   * @param updateUserDto User update data
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The updated user
   * @throws NotFoundException if the user is not found
   * @throws HttpException if related entities do not exist
   */
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    queryRunner?: QueryRunner,
  ): Promise<User> {
    if (queryRunner) {
      const repository = queryRunner.manager.getRepository(User);
      const user = await this.findOneBy({ id }, undefined, false, queryRunner);

      // If email is being updated, check if it's already taken
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.userRepo.getUsersByEmailAndCompany(
          updateUserDto.email,
          user.company,
        );
        if (existingUser) {
          throw new HttpException('Email is already taken', 400);
        }
      }

      // Handle company update if companyId is provided
      if (updateUserDto.companyId) {
        const company = await this.companyService.findOneByCompanyId(
          updateUserDto.companyId,
          false,
          queryRunner,
        );
        if (!company) {
          throw new HttpException('Company does not exist', 400);
        }
        user.company = company;
      }

      // Handle location updates if provided
      if (
        updateUserDto.stateId ||
        updateUserDto.countryId ||
        updateUserDto.cityId
      ) {
        const state = updateUserDto.stateId
          ? await this.statesService.findOne(updateUserDto.stateId)
          : user.state;
        const country = updateUserDto.countryId
          ? await this.countriesService.findOne(updateUserDto.countryId)
          : user.country;
        const city = updateUserDto.cityId
          ? await this.citiesService.findOne(updateUserDto.cityId)
          : user.city;

        if (!state || !country || (updateUserDto.cityId && !city)) {
          throw new HttpException('Invalid location data', 400);
        }

        user.state = state;
        user.country = country;
        user.city = city;
      }

      // Update simple fields
      if (updateUserDto.firstName) user.firstName = updateUserDto.firstName;
      if (updateUserDto.lastName) user.lastName = updateUserDto.lastName;
      if (updateUserDto.middleName !== undefined)
        user.middleName = updateUserDto.middleName || null;
      if (updateUserDto.phone !== undefined)
        user.phone = updateUserDto.phone || '';
      if (updateUserDto.title !== undefined)
        user.title = updateUserDto.title || '';
      if (updateUserDto.department !== undefined)
        user.department = updateUserDto.department || '';
      if (updateUserDto.bestWayToContact !== undefined)
        user.bestWayToContact = updateUserDto.bestWayToContact || null;
      if (updateUserDto.notes !== undefined)
        user.notes = updateUserDto.notes || null;

      const savedUser = await repository.save(user);

      // Update user in Auth0 if any relevant fields are being updated
      if (
        updateUserDto.email ||
        updateUserDto.password ||
        updateUserDto.firstName ||
        updateUserDto.lastName ||
        updateUserDto.phone ||
        updateUserDto.title ||
        updateUserDto.department
      ) {
        try {
          await this.auth0Service.updateUser(user.uuid, {
            email: updateUserDto.email,
            password: updateUserDto.password,
            firstName: updateUserDto.firstName,
            lastName: updateUserDto.lastName,
            phone: updateUserDto.phone,
            title: updateUserDto.title,
            department: updateUserDto.department,
          });
        } catch (error) {
          Logger.error(`Failed to update Auth0 user: ${JSON.stringify(error)}`);
          throw new HttpException('Failed to update user in Auth0', 500);
        }
      }

      return savedUser;
    }

    return executeInTransaction(async (runner: QueryRunner) => {
      return this.update(id, updateUserDto, runner);
    }, this.dataSource);
  }

  /**
   * Soft deletes a user
   */
  async delete(id: number, queryRunner?: QueryRunner): Promise<void> {
    if (queryRunner) {
      const repository = queryRunner.manager.getRepository(User);
      const user = await this.findOneBy({ id }, undefined, false, queryRunner);

      // Delete user from Auth0
      try {
        await this.auth0Service.deleteUser(user.uuid);
      } catch (error) {
        Logger.error(`Failed to delete Auth0 user: ${JSON.stringify(error)}`);
        throw new HttpException('Failed to delete user from Auth0', 500);
      }

      // Execute soft delete and wait for it to complete
      await repository.softDelete({ id: user.id });
      return;
    }

    return executeInTransaction(async (runner: QueryRunner) => {
      const repository = runner.manager.getRepository(User);
      const user = await this.findOneBy({ id }, undefined, false, runner);

      // Delete user from Auth0
      try {
        await this.auth0Service.deleteUser(user.uuid);
      } catch (error) {
        Logger.error(`Failed to delete Auth0 user: ${JSON.stringify(error)}`);
        throw new HttpException('Failed to delete user from Auth0', 500);
      }

      // Execute soft delete and wait for it to complete
      await repository.softDelete({ id: user.id });
    }, this.dataSource);
  }

  /**
   * Hard deletes a user
   */
  async hardDelete(id: number, queryRunner?: QueryRunner): Promise<void> {
    if (queryRunner) {
      const repository = queryRunner.manager.getRepository(User);
      const user = await this.findOneBy({ id }, undefined, true, queryRunner);
      await repository.remove(user);
      return;
    }

    return executeInTransaction(async (runner: QueryRunner) => {
      return this.hardDelete(id, runner);
    }, this.dataSource);
  }

  /**
   * Restores a soft-deleted user
   */
  async restore(id: number, queryRunner?: QueryRunner): Promise<void> {
    if (queryRunner) {
      const repository = queryRunner.manager.getRepository(User);
      const user = await this.findOneBy({ id }, undefined, true, queryRunner);

      if (!user.deletedAt) {
        throw new NotFoundException(`User with ID ${id} is not deleted`);
      }

      // Create new user in Auth0
      try {
        await this.auth0Service.createUser({
          email: user.email,
          password: Math.random().toString(36), // Generate random password
          family_name: user.lastName,
          connection: 'Username-Password-Authentication',
          user_id: user.uuid,
        });
      } catch (error) {
        Logger.error(`Failed to create Auth0 user: ${JSON.stringify(error)}`);
        throw new HttpException('Failed to restore user in Auth0', 500);
      }

      await repository.recover(user);
      return;
    }

    return executeInTransaction(async (runner: QueryRunner) => {
      return this.restore(id, runner);
    }, this.dataSource);
  }

  /**
   * Get users by company ID
   *
   * @param companyId Company ID
   * @param withDeleted Whether to include soft deleted users
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns Array of users
   */
  async getCompanyUsers(
    companyId: number,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<User[]> {
    const company = await this.companyService.findOneByCompanyId(
      companyId,
      false,
      queryRunner,
    );
    if (!company) {
      throw new HttpException('Company not found', 404);
    }

    return this.userRepo.find({
      where: { company: { id: companyId } },
      relations: [
        'company',
        'company.accountToCompanies',
        'company.accountToCompanies.account',
        'state',
        'country',
        'city',
      ],
      withDeleted,
    });
  }

  /**
   * Get users by account ID
   *
   * @param accountId Account ID
   * @param withDeleted Whether to include soft deleted users
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns Array of users
   */
  async getAccountUsers(
    accountId: number,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<User[]> {
    const account = (await this.accountsService.findOne(
      accountId,
      withDeleted,
      queryRunner,
    )) as Account & {
      companyAccounts: CompanyAccount[];
    };
    if (!account) {
      throw new HttpException('Account not found', 404);
    }

    // Get all companies associated with this account
    const accountCompanies = account.companyAccounts.map(
      (atc: CompanyAccount) => atc.company.id,
    );
    if (accountCompanies.length === 0) {
      return [];
    }

    return this.userRepo.find({
      where: { company: { id: In(accountCompanies) } },
      relations: [
        'company',
        'company.companyAccounts',
        'company.companyAccounts.account',
        'state',
        'country',
        'city',
      ],
      withDeleted,
    });
  }

  /**
   * Retrieves all users from Auth0
   *
   * @returns Array of Auth0 users
   */
  async getAuth0Users(): Promise<any> {
    return this.auth0Service.getUsers();
  }
}
