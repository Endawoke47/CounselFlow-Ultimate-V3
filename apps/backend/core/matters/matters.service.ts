import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { ICrudService } from 'src/shared/crud-service.interface';
import { QueryRunner, Repository } from 'typeorm';
import { Company } from '../companies/entities/company.entity';
import { CreateMatterDto } from './dto/create-matter.dto';
import { UpdateMatterDto } from './dto/update-matter.dto';
import { Matter } from './entities/matter.entity';

@Injectable()
export class MattersService
  implements ICrudService<Matter, CreateMatterDto, UpdateMatterDto>
{
  constructor(
    @InjectRepository(Matter)
    private readonly matterRepository: Repository<Matter>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  /**
   * Creates a new matter
   *
   * @param createMatterDto DTO containing matter data
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The created matter
   */
  async create(
    createMatterDto: CreateMatterDto,
    queryRunner?: QueryRunner,
  ): Promise<Matter> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Matter)
      : this.matterRepository;

    const company = await this.companyRepository.findOne({
      where: { id: parseInt(createMatterDto.companyId) },
    });

    if (!company) {
      throw new NotFoundException(
        `Entity with ID ${createMatterDto.companyId} not found`,
      );
    }

    const { ...matterData } = createMatterDto;
    const matter = repository.create({
      ...matterData,
      company,
    });

    return repository.save(matter);
  }

  /**
   * Retrieves all matters with pagination, sorting, filtering, and search capabilities
   *
   * @param query Pagination query parameters
   * @param withDeleted Whether to include soft deleted matters
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns Paginated array of matters
   */
  async find(
    query: PaginateQuery,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<Paginated<Matter>> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Matter)
      : this.matterRepository;

    return paginate(query, repository, {
      sortableColumns: ['id', 'name', 'createdAt', 'updatedAt', 'deletedAt'],
      searchableColumns: ['name', 'description'],
      filterableColumns: {
        id: true,
        name: true,
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
   * Retrieves a matter by its ID
   *
   * @param id ID of the matter to retrieve
   * @param withDeleted Whether to include soft deleted matters
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The found matter
   * @throws NotFoundException if the matter is not found
   */
  async findOne(
    id: number,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<Matter> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Matter)
      : this.matterRepository;

    const matter = await repository.findOne({
      where: { id },
      relations: ['company'],
      withDeleted: withDeleted,
    });

    if (!matter) {
      throw new NotFoundException(`Matter with ID ${id} not found`);
    }

    return matter;
  }

  /**
   * Updates a matter by its ID
   *
   * @param id ID of the matter to update
   * @param updateMatterDto DTO containing updated matter data
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The updated matter
   * @throws NotFoundException if the matter is not found
   */
  async update(
    id: number,
    updateMatterDto: UpdateMatterDto,
    queryRunner?: QueryRunner,
  ): Promise<Matter> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Matter)
      : this.matterRepository;

    const matter = await this.findOne(id, false, queryRunner);
    const { companyId, ...updateData } = updateMatterDto;

    if (companyId) {
      const company = await this.companyRepository.findOne({
        where: { id: parseInt(companyId) },
      });

      if (!company) {
        throw new NotFoundException(`Entity with ID ${companyId} not found`);
      }

      matter.company = company;
    }

    Object.assign(matter, updateData);
    return repository.save(matter);
  }

  /**
   * Soft deletes a matter by its ID
   *
   * @param id ID of the matter to delete
   * @param queryRunner Optional QueryRunner for transaction support
   * @throws NotFoundException if the matter is not found
   */
  async delete(id: number, queryRunner?: QueryRunner): Promise<void> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Matter)
      : this.matterRepository;

    const deleteResult = await repository.softDelete(id);

    if (!deleteResult.affected) {
      throw new NotFoundException(`Matter with ID ${id} not found`);
    }
  }

  /**
   * Restores a soft-deleted matter by its ID
   *
   * @param id ID of the matter to restore
   * @throws NotFoundException if the matter is not found
   */
  async restore(id: number): Promise<void> {
    const restoreResult = await this.matterRepository.restore(id);

    if (!restoreResult.affected) {
      throw new NotFoundException(`Matter with ID ${id} not found`);
    }
  }
}
