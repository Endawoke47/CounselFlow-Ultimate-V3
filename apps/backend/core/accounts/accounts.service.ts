import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { ICrudService } from 'src/shared/crud-service.interface';
import { executeInTransaction } from 'src/utils/transaction.util';
import { DataSource, DeepPartial, QueryRunner, Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import Account from './entities/account.entity';

@Injectable()
export class AccountsService
  implements ICrudService<Account, CreateAccountDto, UpdateAccountDto>
{
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepo: Repository<Account>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a new account
   *
   * @param createAccountDto Account creation data
   * @param createdBy User who created the account
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The created account
   */
  async create(
    createAccountDto: CreateAccountDto,
    createdBy?: any,
    queryRunner?: QueryRunner,
  ): Promise<Account> {
    return executeInTransaction(
      async (runner: QueryRunner) => {
        const repository = runner.manager.getRepository(Account);

        const newAccount = repository.create({
          ...createAccountDto,
          createdBy,
        } as DeepPartial<Account>);

        return repository.save(newAccount);
      },
      this.dataSource,
      queryRunner,
    );
  }

  /**
   * Retrieves all accounts with pagination, sorting, filtering and search capabilities
   *
   * @param query Pagination query parameters
   * @param withDeleted Whether to include soft deleted accounts
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns Paginated array of accounts
   */
  async find(
    query: PaginateQuery,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<Paginated<Account>> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Account)
      : this.accountsRepo;

    return paginate(query, repository, {
      sortableColumns: [
        'id',
        'organizationSize',
        'isAdmin',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ],
      filterableColumns: {
        id: true,
        organizationSize: true,
        isAdmin: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
      searchableColumns: ['organizationSize'],
      defaultSortBy: [['id', 'DESC']],
      relations: ['companyAccounts', 'companyAccounts.company', 'createdBy'],
      ignoreSelectInQueryParam: false,
      withDeleted,
    });
  }

  /**
   * Retrieves an account by its ID
   *
   * @param id ID of the account to retrieve
   * @param withDeleted Whether to include soft deleted accounts
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The found account
   * @throws NotFoundException if the account is not found
   */
  async findOne(
    id: number,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<Account> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Account)
      : this.accountsRepo;

    const account = await repository.findOne({
      where: { id },
      relations: ['companyAccounts', 'companyAccounts.company', 'createdBy'],
      withDeleted,
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return account;
  }

  /**
   * Updates an account
   *
   * @param id ID of the account to update
   * @param updateAccountDto Account update data
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The updated account
   * @throws NotFoundException if the account is not found
   */
  async update(
    id: number,
    updateAccountDto: UpdateAccountDto,
    queryRunner?: QueryRunner,
  ): Promise<Account> {
    return executeInTransaction(
      async (runner: QueryRunner) => {
        const repository = runner.manager.getRepository(Account);

        const account = await this.findOne(id, false, queryRunner);

        // Only update fields that are defined in the DTO
        if (updateAccountDto.organizationSize !== undefined) {
          account.organizationSize = updateAccountDto.organizationSize;
        }
        if (updateAccountDto.isAdmin !== undefined) {
          account.isAdmin = updateAccountDto.isAdmin;
        }

        return repository.save(account);
      },
      this.dataSource,
      queryRunner,
    );
  }

  /**
   * Soft deletes an account
   *
   * @param id ID of the account to delete
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The deleted account
   * @throws NotFoundException if the account is not found
   */
  async delete(id: number, queryRunner?: QueryRunner): Promise<void> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Account)
      : this.accountsRepo;

    const account = await this.findOne(id, false, queryRunner);

    await repository.softRemove(account);
  }

  /**
   * Restores a soft-deleted account
   *
   * @param id ID of the account to restore
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The restored account
   * @throws NotFoundException if the account is not found
   */
  async restore(id: number, queryRunner?: QueryRunner): Promise<void> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Account)
      : this.accountsRepo;

    const account = await repository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    if (!account.deletedAt) {
      return; // Account is not deleted, return as is
    }

    await repository.recover(account);
  }
}
