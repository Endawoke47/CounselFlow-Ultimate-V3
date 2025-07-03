import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { QueryRunner, Repository } from 'typeorm';
import { ICrudService } from '../../shared/crud-service.interface';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService
  implements ICrudService<Category, CreateCategoryDto, UpdateCategoryDto>
{
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepo: Repository<Category>,
  ) {}

  /**
   * Creates a new category
   *
   * @param createCategoryDto Category creation data
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The created category
   */
  async create(
    createCategoryDto: CreateCategoryDto,
    queryRunner?: QueryRunner,
  ): Promise<Category> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Category)
      : this.categoriesRepo;

    const category = repository.create(createCategoryDto);

    return repository.save(category);
  }

  /**
   * Retrieves all categories with pagination, sorting, filtering and search capabilities
   *
   * @param query Pagination query parameters
   * @param withDeleted Whether to include soft deleted categories
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns Paginated array of categories
   */
  async find(
    query: PaginateQuery,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<Paginated<Category>> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Category)
      : this.categoriesRepo;

    return paginate(query, repository, {
      sortableColumns: ['id', 'name', 'createdAt', 'updatedAt', 'deletedAt'],
      searchableColumns: ['name'],
      filterableColumns: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
      defaultSortBy: [['id', 'DESC']],
      ignoreSelectInQueryParam: false,
      withDeleted,
    });
  }

  /**
   * Retrieves a category by its ID
   *
   * @param id ID of the category to retrieve
   * @param withDeleted Whether to include soft deleted categories
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The found category
   * @throws NotFoundException if the category is not found
   */
  async findOne(
    id: number,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<Category> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Category)
      : this.categoriesRepo;

    const category = await repository.findOne({
      where: { id },
      withDeleted,
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  /**
   * Updates a category
   *
   * @param id ID of the category to update
   * @param updateCategoryDto Category update data
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The updated category
   * @throws NotFoundException if the category is not found
   */
  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    queryRunner?: QueryRunner,
  ): Promise<Category> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Category)
      : this.categoriesRepo;

    const category = await this.findOne(id, false, queryRunner);

    // Filter out undefined values from updateCategoryDto
    const filteredUpdateDto = Object.fromEntries(
      Object.entries(updateCategoryDto).filter(
        ([_, value]) => value !== undefined,
      ),
    );

    repository.merge(category, filteredUpdateDto);

    return repository.save(category);
  }

  /**
   * Soft deletes a category
   *
   * @param id ID of the category to delete
   * @param queryRunner Optional QueryRunner for transaction support
   * @throws NotFoundException if the category is not found or delete operation fails
   */
  async delete(id: number, queryRunner?: QueryRunner): Promise<void> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Category)
      : this.categoriesRepo;
    // Check if category exists
    await this.findOne(id, false, queryRunner);

    const result = await repository.softDelete(id);

    if (!result.affected || result.affected === 0) {
      throw new NotFoundException(`Failed to delete category with ID ${id}`);
    }
  }

  /**
   * Hard deletes a category
   *
   * @param id ID of the category to delete
   * @param queryRunner Optional QueryRunner for transaction support
   * @throws NotFoundException if the category is not found or delete operation fails
   */
  async hardDelete(id: number, queryRunner?: QueryRunner): Promise<void> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Category)
      : this.categoriesRepo;

    const category = await repository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    const result = await repository.delete(id);

    if (!result.affected || result.affected === 0) {
      throw new NotFoundException(
        `Failed to hard delete category with ID ${id}`,
      );
    }
  }

  /**
   * Restores a soft-deleted category
   *
   * @param id ID of the category to restore
   * @param queryRunner Optional QueryRunner for transaction support
   * @throws NotFoundException if the category is not found, not deleted, or restore operation fails
   */
  async restore(id: number, queryRunner?: QueryRunner): Promise<void> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Category)
      : this.categoriesRepo;

    const category = await repository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (!category.deletedAt) {
      throw new NotFoundException(`Category with ID ${id} is not deleted`);
    }

    const result = await repository.restore(id);

    if (!result.affected || result.affected === 0) {
      throw new NotFoundException(`Failed to restore category with ID ${id}`);
    }
  }
}
