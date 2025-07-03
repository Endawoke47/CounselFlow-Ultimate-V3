import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  FilterOperator,
  paginate,
  PaginateConfig,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate';
import { DataSource, In, QueryRunner, Repository } from 'typeorm';
import { CreateCountryDto } from '../dto/create-country.dto';
import { UpdateCountryDto } from '../dto/update-country.dto';
import { Country } from '../entities/country.entity';
import { ICrudService } from 'src/shared/crud-service.interface';

@Injectable()
export class CountriesService
  implements ICrudService<Country, CreateCountryDto, UpdateCountryDto>
{
  constructor(
    @InjectRepository(Country)
    private readonly countriesRepository: Repository<Country>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a new country
   *
   * @param createCountryDto Data for creating the country
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns Newly created country
   */
  async create(
    createCountryDto: CreateCountryDto,
    queryRunner?: QueryRunner,
  ): Promise<Country> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Country)
      : this.countriesRepository;

    const country = repository.create(createCountryDto);

    return repository.save(country);
  }

  /**
   * Retrieves all countries with pagination, sorting, filtering and search capabilities
   *
   * @param query Pagination query parameters
   * @param withDeleted Whether to include soft-deleted countries
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns Paginated array of countries
   */
  async find(
    query: PaginateQuery,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<Paginated<Country>> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Country)
      : this.countriesRepository;

    const options: PaginateConfig<Country> = {
      sortableColumns: ['id', 'name', 'createdAt', 'updatedAt'],
      filterableColumns: {
        name: [FilterOperator.EQ, FilterOperator.IN],
      },
      searchableColumns: ['name'],
      defaultSortBy: [['name', 'ASC']],
      withDeleted: withDeleted,
    };

    return paginate<Country>(query, repository, options);
  }

  /**
   * Retrieves a country by its ID
   *
   * @param id ID of the country to retrieve
   * @param withDeleted Whether to include soft-deleted countries
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The found country
   * @throws NotFoundException if the country is not found
   */
  async findOne(
    id: number,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<Country> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Country)
      : this.countriesRepository;
    const country = await repository.findOne({
      where: { id },
      withDeleted: withDeleted,
    });

    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }

    return country;
  }

  /**
   * Retrieves countries by their IDs
   *
   * @param ids Array of country IDs
   * @param queryRunner Optional QueryRunner for transaction support
   * @param withDeleted Whether to include soft-deleted countries
   * @returns Array of countries
   */
  async findByIds(
    ids: number[],
    queryRunner?: QueryRunner,
    withDeleted: boolean = false,
  ): Promise<Country[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    const repository = queryRunner
      ? queryRunner.manager.getRepository(Country)
      : this.countriesRepository;

    return repository.find({
      where: { id: In(ids) },
      withDeleted,
    });
  }

  /**
   * Updates a country by its ID
   *
   * @param id ID of the country to update
   * @param updateCountryDto Data for updating the country
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns Updated country
   * @throws NotFoundException if the country is not found
   */
  async update(
    id: number,
    updateCountryDto: UpdateCountryDto,
    queryRunner?: QueryRunner,
  ): Promise<Country> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Country)
      : this.countriesRepository;

    const country = await this.findOne(id, false, queryRunner);

    // Filter out undefined values
    const filteredDto = Object.fromEntries(
      Object.entries(updateCountryDto).filter(
        ([_, value]) => value !== undefined,
      ),
    );

    repository.merge(country, filteredDto);

    return repository.save(country);
  }

  /**
   * Soft deletes a country by its ID
   *
   * @param id ID of the country to delete
   * @param queryRunner Optional QueryRunner for transaction support
   * @throws NotFoundException if the country is not found
   */
  async delete(id: number, queryRunner?: QueryRunner): Promise<void> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Country)
      : this.countriesRepository;

    await this.findOne(id, false, queryRunner);

    const result = await repository.softDelete(id);

    if (!result.affected || result.affected === 0) {
      throw new NotFoundException(`Failed to delete country with ID ${id}`);
    }
    return;
  }

  /**
   * Hard deletes a country by its ID
   *
   * @param id ID of the country to permanently delete
   * @param queryRunner Optional QueryRunner for transaction support
   * @throws NotFoundException if the country is not found
   */
  async hardDelete(id: number, queryRunner?: QueryRunner): Promise<void> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Country)
      : this.countriesRepository;

    const country = await repository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }

    const result = await repository.delete(id);

    if (!result.affected || result.affected === 0) {
      throw new NotFoundException(
        `Failed to hard delete country with ID ${id}`,
      );
    }
    return;
  }

  /**
   * Restores a soft-deleted country by its ID
   *
   * @param id ID of the country to restore
   * @param queryRunner Optional QueryRunner for transaction support
   * @throws NotFoundException if the country is not found or not deleted
   */
  async restore(id: number, queryRunner?: QueryRunner): Promise<void> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Country)
      : this.countriesRepository;

    const country = await repository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }

    if (!country.deletedAt) {
      throw new NotFoundException(`Country with ID ${id} is not deleted`);
    }

    const result = await repository.restore(id);

    if (!result.affected || result.affected === 0) {
      throw new NotFoundException(`Failed to restore country with ID ${id}`);
    }
    return;
  }
}
