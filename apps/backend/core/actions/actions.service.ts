import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { ICrudService } from 'src/shared/crud-service.interface';
import { QueryRunner, Repository } from 'typeorm';
import { Matter } from '../matters/entities/matter.entity';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { Action } from './entities/action.entity';

@Injectable()
export class ActionsService
  implements ICrudService<Action, CreateActionDto, UpdateActionDto>
{
  constructor(
    @InjectRepository(Action)
    private readonly actionRepository: Repository<Action>,
    @InjectRepository(Matter)
    private readonly matterRepository: Repository<Matter>,
  ) {}

  /**
   * Creates a new action
   *
   * @param createActionDto DTO containing action data
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The created action
   */
  async create(
    createActionDto: CreateActionDto,
    queryRunner?: QueryRunner,
  ): Promise<Action> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Action)
      : this.actionRepository;

    const matter = await this.matterRepository.findOne({
      where: { id: createActionDto.matterId },
    });

    if (!matter) {
      throw new NotFoundException(
        `Matter with ID ${createActionDto.matterId} not found`,
      );
    }

    const action = repository.create({
      ...createActionDto,
      matter,
    });

    return repository.save(action);
  }

  /**
   * Retrieves all actions with pagination, sorting, filtering, and search capabilities
   *
   * @param query Pagination query parameters
   * @param withDeleted Whether to include soft deleted actions
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns Paginated array of actions
   */
  async find(
    query: PaginateQuery,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<Paginated<Action>> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Action)
      : this.actionRepository;

    return paginate(query, repository, {
      sortableColumns: ['id', 'title', 'createdAt', 'updatedAt', 'deletedAt'],
      searchableColumns: ['title', 'description'],
      filterableColumns: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
      defaultSortBy: [['id', 'DESC']],
      ignoreSelectInQueryParam: false,
      withDeleted: withDeleted,
    });
  }

  /**
   * Retrieves an action by its ID
   *
   * @param id ID of the action to retrieve
   * @param withDeleted Whether to include soft deleted actions
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The found action
   * @throws NotFoundException if the action is not found
   */
  async findOne(
    id: number,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<Action> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Action)
      : this.actionRepository;

    const action = await repository.findOne({
      where: { id },
      withDeleted: withDeleted,
    });

    if (!action) {
      throw new NotFoundException(`Action with ID ${id} not found`);
    }

    return action;
  }

  /**
   * Updates an action by its ID
   *
   * @param id ID of the action to update
   * @param updateActionDto DTO containing updated action data
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The updated action
   * @throws NotFoundException if the action is not found
   */
  async update(
    id: number,
    updateActionDto: UpdateActionDto,
    queryRunner?: QueryRunner,
  ): Promise<Action> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Action)
      : this.actionRepository;

    const action = await this.findOne(id, false, queryRunner);

    if (updateActionDto.matterId) {
      const matter = await this.matterRepository.findOne({
        where: { id: updateActionDto.matterId },
      });

      if (!matter) {
        throw new NotFoundException(
          `Matter with ID ${updateActionDto.matterId} not found`,
        );
      }

      action.matter = matter;
    }

    Object.assign(action, updateActionDto);
    return repository.save(action);
  }

  /**
   * Soft deletes an action by its ID
   *
   * @param id ID of the action to delete
   * @param queryRunner Optional QueryRunner for transaction support
   * @throws NotFoundException if the action is not found
   */
  async delete(id: number, queryRunner?: QueryRunner): Promise<void> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Action)
      : this.actionRepository;

    const deleteResult = await repository.softDelete(id);

    if (!deleteResult.affected) {
      throw new NotFoundException(`Action with ID ${id} not found`);
    }
  }

  /**
   * Restores a soft-deleted action by its ID
   *
   * @param id ID of the action to restore
   * @throws NotFoundException if the action is not found
   */
  async restore(id: number): Promise<void> {
    const restoreResult = await this.actionRepository.restore(id);

    if (!restoreResult.affected) {
      throw new NotFoundException(`Action with ID ${id} not found`);
    }
  }
}
