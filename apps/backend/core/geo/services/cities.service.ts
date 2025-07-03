import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  FilterOperator,
  paginate,
  PaginateConfig,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { executeInTransaction } from '../../../utils/transaction.util';
import { CreateCityDto } from '../dto/create-city.dto';
import { UpdateCityDto } from '../dto/update-city.dto';
import { City } from '../entities/city.entity';
import { StatesService } from './states.service';
import { ICrudService } from 'src/shared/crud-service.interface';

@Injectable()
export class CitiesService
  implements ICrudService<City, CreateCityDto, UpdateCityDto>
{
  constructor(
    @InjectRepository(City)
    private readonly citiesRepository: Repository<City>,
    private readonly statesService: StatesService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a new city
   *
   * @param createCityDto Data for creating the city
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns Newly created city
   */
  async create(
    createCityDto: CreateCityDto,
    queryRunner?: QueryRunner,
  ): Promise<City> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(City)
      : this.citiesRepository;

    await this.statesService.findOne(createCityDto.stateId);

    const city = repository.create(createCityDto);

    return repository.save(city);
  }

  /**
   * Retrieves all cities with pagination, sorting, filtering and search capabilities
   *
   * @param query Pagination query parameters
   * @param withDeleted Whether to include soft-deleted cities
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns Paginated array of cities
   */
  async find(
    query: PaginateQuery,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<Paginated<City>> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(City)
      : this.citiesRepository;

    const options: PaginateConfig<City> = {
      sortableColumns: ['id', 'name', 'createdAt', 'updatedAt'],
      filterableColumns: {
        name: [FilterOperator.EQ, FilterOperator.IN],
        stateId: [FilterOperator.EQ],
        'state.id': [FilterOperator.EQ],
        'state.country.id': [FilterOperator.EQ],
      },
      searchableColumns: ['name'],
      defaultSortBy: [['name', 'ASC']],
      relations: ['state', 'state.country'],
      withDeleted: withDeleted,
    };

    return paginate<City>(query, repository, options);
  }

  /**
   * Retrieves a city by its ID
   *
   * @param id ID of the city to retrieve
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The found city
   * @throws NotFoundException if the city is not found
   */
  async findOne(
    id: number,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<City> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(City)
      : this.citiesRepository;
    const city = await repository.findOne({
      where: { id },
      relations: ['state', 'state.country'],
      withDeleted: withDeleted,
    });

    if (!city) {
      throw new NotFoundException(`City with ID ${id} not found`);
    }

    return city;
  }

  /**
   * Updates a city by its ID
   *
   * @param id ID of the city to update
   * @param updateCityDto Data for updating the city
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns Updated city
   * @throws NotFoundException if the city is not found
   */
  async update(
    id: number,
    updateCityDto: UpdateCityDto,
    queryRunner?: QueryRunner,
  ): Promise<City> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(City)
      : this.citiesRepository;

    const city = await this.findOne(id, false, queryRunner);

    if (updateCityDto.stateId) {
      await this.statesService.findOne(updateCityDto.stateId);
    }

    // Filter out undefined values
    const filteredDto = Object.fromEntries(
      Object.entries(updateCityDto).filter(([_, value]) => value !== undefined),
    );

    repository.merge(city, filteredDto);

    return repository.save(city);
  }

  /**
   * Soft deletes a city by its ID
   *
   * @param id ID of the city to delete
   * @param queryRunner Optional QueryRunner for transaction support
   * @throws NotFoundException if the city is not found
   */
  async delete(id: number, queryRunner?: QueryRunner): Promise<void> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(City)
      : this.citiesRepository;

    await this.findOne(id, false, queryRunner);

    const result = await repository.softDelete(id);

    if (!result.affected || result.affected === 0) {
      throw new NotFoundException(`Failed to delete city with ID ${id}`);
    }
    return;
  }

  /**
   * Hard deletes a city by its ID
   *
   * @param id ID of the city to permanently delete
   * @param queryRunner Optional QueryRunner for transaction support
   * @throws NotFoundException if the city is not found
   */
  async hardDelete(id: number, queryRunner?: QueryRunner): Promise<void> {
    if (queryRunner) {
      const repository = queryRunner.manager.getRepository(City);
      const city = await repository.findOne({
        where: { id },
        withDeleted: true,
      });

      if (!city) {
        throw new NotFoundException(`City with ID ${id} not found`);
      }

      const result = await repository.delete(id);

      if (!result.affected || result.affected === 0) {
        throw new NotFoundException(`Failed to hard delete city with ID ${id}`);
      }
      return;
    }

    return executeInTransaction(async (runner: QueryRunner) => {
      return this.hardDelete(id, runner);
    }, this.dataSource);
  }

  /**
   * Restores a soft-deleted city by its ID
   *
   * @param id ID of the city to restore
   * @param queryRunner Optional QueryRunner for transaction support
   * @throws NotFoundException if the city is not found or not deleted
   */
  async restore(id: number, queryRunner?: QueryRunner): Promise<void> {
    if (queryRunner) {
      const repository = queryRunner.manager.getRepository(City);
      const city = await repository.findOne({
        where: { id },
        withDeleted: true,
      });

      if (!city) {
        throw new NotFoundException(`City with ID ${id} not found`);
      }

      if (!city.deletedAt) {
        throw new NotFoundException(`City with ID ${id} is not deleted`);
      }

      const result = await repository.restore(id);

      if (!result.affected || result.affected === 0) {
        throw new NotFoundException(`Failed to restore city with ID ${id}`);
      }
      return;
    }

    return executeInTransaction(async (runner: QueryRunner) => {
      return this.restore(id, runner);
    }, this.dataSource);
  }
}
