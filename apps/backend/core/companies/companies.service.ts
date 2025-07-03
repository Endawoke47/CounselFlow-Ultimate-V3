import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  FilterOperator,
  paginate,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate';
import { ICrudService } from 'src/shared/crud-service.interface';
import {
  DataSource,
  FindOptionsWhere,
  In,
  QueryRunner,
  Repository,
} from 'typeorm';
import { executeInTransaction } from '../../utils/transaction.util';
import { CategoriesService } from '../categories/categories.service';
import { CitiesService } from '../geo/services/cities.service';
import { CountriesService } from '../geo/services/countries.service';
import { StatesService } from '../geo/services/states.service';
import { SectorsService } from '../sectors/sectors.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyAccount } from './entities/company-account.entity';
import { Company } from './entities/company.entity';

@Injectable()
export class CompaniesService
  implements ICrudService<Company, CreateCompanyDto, UpdateCompanyDto>
{
  constructor(
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    @InjectRepository(CompanyAccount)
    private readonly companyAccountRepo: Repository<CompanyAccount>,
    private readonly categoriesService: CategoriesService,
    private readonly sectorsService: SectorsService,
    private readonly countriesService: CountriesService,
    private readonly statesService: StatesService,
    private readonly citiesService: CitiesService,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  /**
   * Creates a new company
   *
   * @param createCompanyDto Data to create a company
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The created company
   */
  async create(
    createCompanyDto: CreateCompanyDto,
    queryRunner?: QueryRunner,
  ): Promise<Company> {
    return executeInTransaction(
      async (runner: QueryRunner) => {
        const repository = runner.manager.getRepository(Company);
        const company = repository.create(createCompanyDto);

        // Handle city, state, and country if provided
        if (createCompanyDto.cityId) {
          const cities = await this.citiesService.find({
            path: 'cities',
            filter: {
              id: [String(createCompanyDto.cityId)],
            },
          });
          company.city = cities.data[0];
        }

        if (createCompanyDto.stateId) {
          const states = await this.statesService.find({
            path: 'states',
            filter: {
              id: [String(createCompanyDto.stateId)],
            },
          });
          company.state = states.data[0];
        }

        if (createCompanyDto.countryId) {
          const countries = await this.countriesService.find({
            path: 'countries',
            filter: {
              id: [String(createCompanyDto.countryId)],
            },
          });
          company.country = countries.data[0];
        }

        // Save the company first to get the ID
        const savedCompany = await repository.save(company);

        // Handle categories and sectors if provided
        if (
          createCompanyDto.categoryIds &&
          createCompanyDto.categoryIds.length > 0
        ) {
          const categories = await this.categoriesService.find({
            path: 'categories',
            filter: {
              id: createCompanyDto.categoryIds.map(String),
            },
          });
          savedCompany.categories = categories.data;
        }

        if (
          createCompanyDto.sectorIds &&
          createCompanyDto.sectorIds.length > 0
        ) {
          const sectors = await this.sectorsService.find({
            path: 'sectors',
            filter: {
              id: createCompanyDto.sectorIds.map(String),
            },
          });
          savedCompany.sectors = sectors.data;
        }

        const finalCompany = await repository.save(savedCompany);

        if (createCompanyDto.accountId) {
          const companyAccountRepo =
            runner.manager.getRepository(CompanyAccount);
          await companyAccountRepo.save(
            companyAccountRepo.create({
              companyId: finalCompany.id,
              accountId: createCompanyDto.accountId,
              companyType: createCompanyDto.type,
            }),
          );
        }

        return finalCompany;
      },
      this.dataSource,
      queryRunner,
    );
  }

  /**
   * Retrieves all companies with pagination, sorting, filtering, and search capabilities
   *
   * @param query Pagination query parameters
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns Paginated array of companies
   */
  async find(
    query: PaginateQuery,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<Paginated<Company>> {
    return executeInTransaction(
      async (runner: QueryRunner) => {
        const repository = runner.manager.getRepository(Company);
        return paginate(query, repository, {
          sortableColumns: [
            'id',
            'name',
            'contact',
            'email',
            'phone',
            'website',
            'number',
            'address',
            'createdAt',
            'updatedAt',
            'deletedAt',
          ],
          searchableColumns: [
            'name',
            'contact',
            'email',
            'phone',
            'website',
            'address',
            'number',
          ],
          filterableColumns: {
            id: true,
            name: true,
            email: true,
            phone: true,
            'city.id': true,
            'state.id': true,
            'country.id': true,
            'categories.id': true,
            'sectors.id': true,
          },
          defaultSortBy: [['name', 'ASC']],
          relations: ['city', 'state', 'country', 'categories', 'sectors'],
          ignoreSelectInQueryParam: false,
          withDeleted: withDeleted,
        });
      },
      this.dataSource,
      queryRunner,
    );
  }

  /**
   * Retrieves a company by its ID
   *
   * @param id ID of the company to retrieve
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The found company
   * @throws NotFoundException if the company is not found
   */
  async findOne(
    id: number,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<Company> {
    return executeInTransaction(
      async (runner: QueryRunner) => {
        const repository = runner.manager.getRepository(Company);
        const company = await repository.findOne({
          where: { id },
          relations: ['categories', 'sectors', 'city', 'state', 'country'],
          withDeleted: withDeleted,
        });

        if (!company) {
          throw new NotFoundException(`Company with ID ${id} not found`);
        }

        return company;
      },
      this.dataSource,
      queryRunner,
    );
  }

  /**
   * Finds multiple companies by their IDs
   *
   * @param ids Array of company IDs
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns Array of found companies
   */
  async findByIds(
    ids: number[],
    queryRunner?: QueryRunner,
  ): Promise<Company[]> {
    return executeInTransaction(
      async (runner: QueryRunner) => {
        const repository = runner.manager.getRepository(Company);
        return repository.find({
          where: { id: In(ids) },
          withDeleted: false,
        });
      },
      this.dataSource,
      queryRunner,
    );
  }

  /**
   * Updates a company
   *
   * @param id ID of the company to update
   * @param updateCompanyDto Data for updating the company
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns Updated company
   * @throws NotFoundException if the company is not found
   */
  async update(
    id: number,
    updateCompanyDto: UpdateCompanyDto,
    queryRunner?: QueryRunner,
  ): Promise<Company> {
    return executeInTransaction(
      async (runner: QueryRunner) => {
        const repository = runner.manager.getRepository(Company);
        const company = await this.findOne(id);

        const filteredUpdateDto = Object.fromEntries(
          Object.entries(updateCompanyDto).filter(
            ([_, value]) => value !== undefined,
          ),
        );

        repository.merge(company, filteredUpdateDto);
        return repository.save(company);
      },
      this.dataSource,
      queryRunner,
    );
  }

  /**
   * Soft deletes a company
   *
   * @param id ID of the company to delete
   * @param queryRunner Optional QueryRunner for transaction support
   * @throws NotFoundException if the company is not found
   */
  async delete(id: number, queryRunner?: QueryRunner): Promise<void> {
    return executeInTransaction(
      async (runner: QueryRunner) => {
        const repository = runner.manager.getRepository(Company);
        const company = await this.findOne(id);
        await repository.softRemove(company);
      },
      this.dataSource,
      queryRunner,
    );
  }

  /**
   * Hard deletes a company
   *
   * @param id ID of the company to delete
   * @param queryRunner Optional QueryRunner for transaction support
   * @throws NotFoundException if the company is not found
   */
  async hardDelete(id: number, queryRunner?: QueryRunner): Promise<void> {
    return executeInTransaction(
      async (runner: QueryRunner) => {
        const repository = runner.manager.getRepository(Company);
        const company = await repository.findOne({
          where: { id },
          withDeleted: true,
        });

        if (!company) {
          throw new NotFoundException(`Company with ID ${id} not found`);
        }

        await repository.remove(company);
      },
      this.dataSource,
      queryRunner,
    );
  }

  /**
   * Restores a soft-deleted company
   *
   * @param id ID of the company to restore
   * @param queryRunner Optional QueryRunner for transaction support
   * @throws NotFoundException if the company is not found
   */
  async restore(id: number, queryRunner?: QueryRunner): Promise<void> {
    return executeInTransaction(
      async (runner: QueryRunner) => {
        const repository = runner.manager.getRepository(Company);
        const company = await repository.findOne({
          where: { id },
          withDeleted: true,
        });

        if (!company) {
          throw new NotFoundException(`Company with ID ${id} not found`);
        }

        if (!company.deletedAt) {
          return; // Company is not deleted, return as is
        }

        await repository.recover(company);
      },
      this.dataSource,
      queryRunner,
    );
  }

  async findAll(): Promise<Company[]> {
    return this.companiesRepository.find({
      relations: [
        'companyAccounts',
        'companyAccounts.account',
        'city',
        'country',
        'state',
        'sectors',
        'categories',
      ],
    });
  }

  async findAllByAccountId(accountId: number): Promise<Company[]> {
    return this.companiesRepository.find({
      where: {
        companyAccounts: {
          account: {
            id: accountId,
          },
        },
      },
      relations: ['companyAccounts', 'companyAccounts.account'],
    });
  }
  async findOneByAccountId(id: number, accountId: number): Promise<Company> {
    const company = await this.companiesRepository.findOne({
      where: {
        id,
        companyAccounts: {
          accountId,
          companyId: id,
        },
      },
      relations: [
        'companyAccounts',
        'companyAccounts.account',
        'city',
        'country',
        'state',
        'sectors',
        'categories',
      ],
    });

    if (company === null) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
    return company;
  }

  // TODO fix many to many update
  async updateByAccountId(
    id: number,
    accountId: number,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    const company = await this.findOneByAccountId(id, accountId);

    Object.assign(company, updateCompanyDto);

    return this.companiesRepository.save(company);
  }

  async removeByAccountId(id: number, accountId: number): Promise<Company> {
    const company = await this.findOneByAccountId(id, accountId);
    await this.companyAccountRepo.delete({ companyId: id, accountId });

    return this.companiesRepository.remove(company);
  }

  async findOneByCompanyId(
    id: number,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<Company> {
    const repository =
      queryRunner?.manager.getRepository(Company) ?? this.companiesRepository;
    const company = await repository.findOne({
      where: {
        id,
      },
      withDeleted,
      relations: ['companyAccounts', 'companyAccounts.account'],
    });
    if (company === null) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
    return company;
  }

  async findByCompanyIds(accountId: number, ids: number[]): Promise<Company[]> {
    const companies = await this.companiesRepository.find({
      where: {
        id: In(ids),
        companyAccounts: {
          accountId,
        },
      },
      relations: ['companyAccounts', 'companyAccounts.account'],
    });

    return companies || [];
  }

  async findByCompanyName(
    name: string,
    accountId?: number,
  ): Promise<Company | null> {
    const whereStatement: FindOptionsWhere<Company> = {
      name,
    };

    if (accountId) {
      whereStatement.companyAccounts = {
        account: {
          id: accountId,
        },
      };
    }
    const company = await this.companiesRepository.findOne({
      where: whereStatement,
      relations: ['companyAccounts', 'companyAccounts.account'],
    });

    return company;
  }

  // TODO: check after transfer for account module
  async updateAccountCompanies(companyIds: number[], accountId: number) {
    if (companyIds) {
      const companies = await this.findByCompanyIds(accountId, companyIds);

      if (companies.length !== companyIds.length) {
        throw new NotFoundException('Some companies not found');
      }

      await this.companyAccountRepo.delete({ accountId });
      for (const companyId of companyIds) {
        const companyAccount = this.companyAccountRepo.create({
          accountId,
          companyId,
        });
        await this.companyAccountRepo.save(companyAccount);
      }
    }
  }

  /**
   * Retrieves all companies for an account with pagination, filtering, sorting and search capabilities
   *
   * @param accountId ID of the account
   * @param query Pagination query parameters
   * @returns Paginated array of companies
   */
  async findByAccount(
    accountId: number,
    query: PaginateQuery,
  ): Promise<Paginated<Company>> {
    return paginate(query, this.companiesRepository, {
      relations: ['companyAccounts'],
      where: {
        companyAccounts: {
          accountId,
        },
      },
      sortableColumns: ['id', 'name', 'createdAt', 'updatedAt'],
      filterableColumns: {
        name: [FilterOperator.EQ, FilterOperator.ILIKE],
        email: [FilterOperator.EQ, FilterOperator.ILIKE],
      },
      searchableColumns: ['name', 'description', 'email', 'phone', 'website'],
      defaultSortBy: [['createdAt', 'DESC']],
      withDeleted: false,
    });
  }

  /**
   * Retrieves a company by its ID
   *
   * @param id ID of the company to retrieve
   * @returns The found company
   * @throws NotFoundException if the company is not found
   */
  async findOneById(id: number): Promise<Company> {
    const company = await this.companiesRepository.findOne({
      where: { id },
      relations: ['categories', 'sectors'],
      withDeleted: false,
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }
}
