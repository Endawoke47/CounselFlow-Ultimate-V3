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
import { executeInTransaction } from '../../../utils/transaction.util';
import { CreateStateDto } from '../dto/create-state.dto';
import { UpdateStateDto } from '../dto/update-state.dto';
import { State } from '../entities/state.entity';
import { CountriesService } from './countries.service';
import { ICrudService } from 'src/shared/crud-service.interface';

@Injectable()
export class StatesService
  implements ICrudService<State, CreateStateDto, UpdateStateDto>
{
  constructor(
    @InjectRepository(State)
    private readonly statesRepository: Repository<State>,
    private readonly countriesService: CountriesService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a new state
   *
   * @param createStateDto Data for creating the state
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns Newly created state
   */
  async create(
    createStateDto: CreateStateDto,
    queryRunner?: QueryRunner,
  ): Promise<State> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(State)
      : this.statesRepository;

    await this.countriesService.findOne(createStateDto.countryId);

    const state = repository.create(createStateDto);

    return repository.save(state);
  }

  /**
   * Retrieves all states with pagination, sorting, filtering and search capabilities
   *
   * @param query Pagination query parameters
   * @returns Paginated array of states
   */
  async find(
    query: PaginateQuery,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<Paginated<State>> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(State)
      : this.statesRepository;

    const options: PaginateConfig<State> = {
      sortableColumns: ['id', 'name', 'createdAt', 'updatedAt'],
      filterableColumns: {
        name: [FilterOperator.EQ, FilterOperator.IN],
        countryId: [FilterOperator.EQ],
        'country.id': [FilterOperator.EQ],
      },
      searchableColumns: ['name'],
      defaultSortBy: [['name', 'ASC']],
      relations: ['country'],
      withDeleted: withDeleted,
    };

    return paginate<State>(query, repository, options);
  }

  /**
   * Retrieves a state by its ID
   *
   * @param id ID of the state to retrieve
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The found state
   * @throws NotFoundException if the state is not found
   */
  async findOne(
    id: number,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<State> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(State)
      : this.statesRepository;
    const state = await repository.findOne({
      where: { id },
      relations: ['country'],
      withDeleted: withDeleted,
    });

    if (!state) {
      throw new NotFoundException(`State with ID ${id} not found`);
    }

    return state;
  }

  /**
   * Retrieves states by their IDs
   *
   * @param ids Array of state IDs
   * @param queryRunner Optional QueryRunner for transaction support
   * @param withDeleted Whether to include soft-deleted states
   * @returns Array of states
   */
  async findByIds(
    ids: number[],
    queryRunner?: QueryRunner,
    withDeleted: boolean = false,
  ): Promise<State[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    const repository = queryRunner
      ? queryRunner.manager.getRepository(State)
      : this.statesRepository;

    return repository.find({
      where: { id: In(ids) },
      relations: ['country'],
      withDeleted,
    });
  }

  /**
   * Updates a state by its ID
   *
   * @param id ID of the state to update
   * @param updateStateDto Data for updating the state
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns Updated state
   * @throws NotFoundException if the state is not found
   */
  async update(
    id: number,
    updateStateDto: UpdateStateDto,
    queryRunner?: QueryRunner,
  ): Promise<State> {
    if (queryRunner) {
      const repository = queryRunner.manager.getRepository(State);
      const state = await this.findOne(id, false, queryRunner);

      if (updateStateDto.countryId) {
        await this.countriesService.findOne(updateStateDto.countryId);
      }

      // Filter out undefined values
      const filteredDto = Object.fromEntries(
        Object.entries(updateStateDto).filter(
          ([_, value]) => value !== undefined,
        ),
      );

      repository.merge(state, filteredDto);

      return repository.save(state);
    }

    return executeInTransaction(async (runner: QueryRunner) => {
      return this.update(id, updateStateDto, runner);
    }, this.dataSource);
  }

  /**
   * Soft deletes a state by its ID
   *
   * @param id ID of the state to delete
   * @param queryRunner Optional QueryRunner for transaction support
   * @throws NotFoundException if the state is not found
   */
  async delete(id: number, queryRunner?: QueryRunner): Promise<void> {
    if (queryRunner) {
      const repository = queryRunner.manager.getRepository(State);
      await this.findOne(id, false, queryRunner);

      const result = await repository.softDelete(id);

      if (!result.affected || result.affected === 0) {
        throw new NotFoundException(`Failed to delete state with ID ${id}`);
      }
      return;
    }

    return executeInTransaction(async (runner: QueryRunner) => {
      return this.delete(id, runner);
    }, this.dataSource);
  }

  /**
   * Hard deletes a state by its ID
   *
   * @param id ID of the state to permanently delete
   * @param queryRunner Optional QueryRunner for transaction support
   * @throws NotFoundException if the state is not found
   */
  async hardDelete(id: number, queryRunner?: QueryRunner): Promise<void> {
    if (queryRunner) {
      const repository = queryRunner.manager.getRepository(State);
      const state = await this.findOne(id, true, queryRunner);

      if (!state) {
        throw new NotFoundException(`State with ID ${id} not found`);
      }

      const result = await repository.delete(id);

      if (!result.affected || result.affected === 0) {
        throw new NotFoundException(
          `Failed to hard delete state with ID ${id}`,
        );
      }
      return;
    }

    return executeInTransaction(async (runner: QueryRunner) => {
      return this.hardDelete(id, runner);
    }, this.dataSource);
  }

  /**
   * Restores a soft-deleted state by its ID
   *
   * @param id ID of the state to restore
   * @param queryRunner Optional QueryRunner for transaction support
   * @throws NotFoundException if the state is not found or not deleted
   */
  async restore(id: number, queryRunner?: QueryRunner): Promise<void> {
    if (queryRunner) {
      const repository = queryRunner.manager.getRepository(State);
      const state = await repository.findOne({
        where: { id },
        withDeleted: true,
      });

      if (!state) {
        throw new NotFoundException(`State with ID ${id} not found`);
      }

      if (!state.deletedAt) {
        throw new NotFoundException(`State with ID ${id} is not deleted`);
      }

      const result = await repository.restore(id);

      if (!result.affected || result.affected === 0) {
        throw new NotFoundException(`Failed to restore state with ID ${id}`);
      }
      return;
    }

    return executeInTransaction(async (runner: QueryRunner) => {
      return this.restore(id, runner);
    }, this.dataSource);
  }
}
