import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { ICrudService } from 'src/shared/crud-service.interface';
import { QueryRunner, Repository } from 'typeorm';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { Sector } from './entities/sector.entity';

@Injectable()
export class SectorsService
  implements ICrudService<Sector, CreateSectorDto, UpdateSectorDto>
{
  constructor(
    @InjectRepository(Sector)
    private readonly sectorsRepository: Repository<Sector>,
  ) {}

  /**
   * Creates a new sector
   *
   * @param createSectorDto Data for creating the sector
   * @param runner Optional QueryRunner for transaction support
   * @returns Newly created sector
   */
  async create(
    createSectorDto: CreateSectorDto,
    runner?: QueryRunner,
  ): Promise<Sector> {
    const repository = runner
      ? runner.manager.getRepository(Sector)
      : this.sectorsRepository;

    const sector = repository.create(createSectorDto);

    return repository.save(sector);
  }

  /**
   * Retrieves all sectors with pagination, sorting, filtering, and search capabilities
   * Supports filtering by IDs using the filter.id parameter
   *
   * @param query Pagination query parameters
   * @param withDeleted Whether to include soft deleted sectors
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns Paginated array of sectors
   */
  async find(
    query: PaginateQuery,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<Paginated<Sector>> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Sector)
      : this.sectorsRepository;

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
      withDeleted: withDeleted,
    });
  }

  /**
   * Retrieves a sector by its ID
   *
   * @param id ID of the sector to retrieve
   * @param withDeleted Whether to include soft deleted sectors
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The found sector
   * @throws NotFoundException if the sector is not found
   */
  async findOne(
    id: number,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<Sector> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Sector)
      : this.sectorsRepository;

    const sector = await repository.findOne({
      where: { id },
      withDeleted: withDeleted,
    });

    if (!sector) {
      throw new NotFoundException(`Sector with ID ${id} not found`);
    }

    return sector;
  }

  /**
   * Updates a sector by its ID
   *
   * @param id ID of the sector to update
   * @param updateSectorDto Data for updating the sector
   * @param runner Optional QueryRunner for transaction support
   * @returns Updated sector
   * @throws NotFoundException if the sector is not found
   */
  async update(
    id: number,
    updateSectorDto: UpdateSectorDto,
    runner?: QueryRunner,
  ): Promise<Sector> {
    const repository = runner
      ? runner.manager.getRepository(Sector)
      : this.sectorsRepository;

    const sector = await this.findOne(id, false, runner);

    // Filter out undefined values from updateSectorDto
    const filteredUpdateDto = Object.fromEntries(
      Object.entries(updateSectorDto).filter(
        ([_, value]) => value !== undefined,
      ),
    );

    repository.merge(sector, filteredUpdateDto);

    return repository.save(sector);
  }

  /**
   * Soft deletes a sector by its ID
   *
   * @param id ID of the sector to delete
   * @param runner Optional QueryRunner for transaction support
   * @throws NotFoundException if the sector is not found
   */
  async delete(id: number, runner?: QueryRunner): Promise<void> {
    const repository = runner
      ? runner.manager.getRepository(Sector)
      : this.sectorsRepository;

    // Check if sector exists
    await this.findOne(id, false, runner);

    const result = await repository.softDelete(id);

    if (!result.affected || result.affected === 0) {
      throw new NotFoundException(`Failed to delete sector with ID ${id}`);
    }
  }

  /**
   * Hard deletes a sector by its ID
   *
   * @param id ID of the sector to permanently delete
   * @param runner Optional QueryRunner for transaction support
   * @throws NotFoundException if the sector is not found
   */
  async hardDelete(id: number, runner?: QueryRunner): Promise<void> {
    const repository = runner
      ? runner.manager.getRepository(Sector)
      : this.sectorsRepository;

    const sector = await repository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!sector) {
      throw new NotFoundException(`Sector with ID ${id} not found`);
    }

    const result = await repository.delete(id);

    if (!result.affected || result.affected === 0) {
      throw new NotFoundException(`Failed to hard delete sector with ID ${id}`);
    }
  }

  /**
   * Restores a soft-deleted sector by its ID
   *
   * @param id ID of the sector to restore
   * @param runner Optional QueryRunner for transaction support
   * @throws NotFoundException if the sector is not found or not deleted
   */
  async restore(id: number, runner?: QueryRunner): Promise<void> {
    const repository = runner
      ? runner.manager.getRepository(Sector)
      : this.sectorsRepository;

    const sector = await repository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!sector) {
      throw new NotFoundException(`Sector with ID ${id} not found`);
    }

    if (!sector.deletedAt) {
      throw new NotFoundException(`Sector with ID ${id} is not deleted`);
    }

    const result = await repository.restore(id);

    if (!result.affected || result.affected === 0) {
      throw new NotFoundException(`Failed to restore sector with ID ${id}`);
    }
  }
}
