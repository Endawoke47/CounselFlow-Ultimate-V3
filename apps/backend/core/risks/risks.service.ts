import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { ICrudService } from 'src/shared/crud-service.interface';
import { QueryRunner, Repository } from 'typeorm';
import { MattersService } from '../matters/matters.service';
import { CreateRiskDto } from './dto/create-risk.dto';
import { UpdateRiskDto } from './dto/update-risk.dto';
import { Risk } from './entities/risk.entity';

@Injectable()
export class RisksService
  implements ICrudService<Risk, CreateRiskDto, UpdateRiskDto>
{
  constructor(
    @InjectRepository(Risk)
    private readonly riskRepository: Repository<Risk>,
    private readonly mattersService: MattersService,
  ) {}

  /**
   * Creates a new risk
   *
   * @param createRiskDto DTO containing risk data
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The created risk
   * @throws NotFoundException if the matter is not found
   */
  async create(
    createRiskDto: CreateRiskDto,
    queryRunner?: QueryRunner,
  ): Promise<Risk> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Risk)
      : this.riskRepository;

    // Verify matter exists using MattersService
    const matter = await this.mattersService.findOne(createRiskDto.matterId);

    const risk = repository.create({
      ...createRiskDto,
      matter: matter,
    });

    return repository.save(risk);
  }

  /**
   * Retrieves all risks with pagination, sorting, filtering, and search capabilities
   *
   * @param query Pagination query parameters
   * @param withDeleted Whether to include soft deleted risks
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns Paginated array of risks
   */
  async find(
    query: PaginateQuery,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<Paginated<Risk>> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Risk)
      : this.riskRepository;

    return paginate(query, repository, {
      sortableColumns: [
        'id',
        'name',
        'category',
        'score',
        'status',
        'priority',
        'tolerance',
        'mitigationStatus',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ],
      searchableColumns: ['name', 'description'],
      filterableColumns: {
        id: true,
        name: true,
        category: true,
        score: true,
        status: true,
        priority: true,
        tolerance: true,
        mitigationStatus: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
      relations: ['matter', 'matter.company', 'owner', 'company'],
      defaultSortBy: [['id', 'DESC']],
      ignoreSelectInQueryParam: false,
      withDeleted: withDeleted,
    });
  }

  /**
   * Retrieves a risk by its ID
   *
   * @param id ID of the risk to retrieve
   * @param withDeleted Whether to include soft deleted risks
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The found risk
   * @throws NotFoundException if the risk is not found
   */
  async findOne(
    id: number,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<Risk> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Risk)
      : this.riskRepository;

    const risk = await repository.findOne({
      where: { id },
      withDeleted: withDeleted,
      relations: ['matter', 'matter.company', 'owner', 'company'],
    });

    if (!risk) {
      throw new NotFoundException(`Risk with ID ${id} not found`);
    }

    return risk;
  }

  /**
   * Updates a risk by its ID
   *
   * @param id ID of the risk to update
   * @param updateRiskDto DTO containing updated risk data
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The updated risk
   * @throws NotFoundException if the risk or matter is not found
   */
  async update(
    id: number,
    updateRiskDto: UpdateRiskDto,
    queryRunner?: QueryRunner,
  ): Promise<Risk> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Risk)
      : this.riskRepository;

    // Check if risk exists
    const existingRisk = await this.findOne(id, false, queryRunner);

    // Handle matter relationship
    if (updateRiskDto.matterId === null) {
      // If matterId is explicitly null, remove the matter relationship
      existingRisk.matter = undefined;
    } else if (updateRiskDto.matterId) {
      // If matterId is provided, verify the new matter exists
      const matter = await this.mattersService.findOne(updateRiskDto.matterId);

      // Update the matter relationship
      existingRisk.matter = matter;
    }

    // Update other fields
    Object.assign(existingRisk, updateRiskDto);

    return repository.save(existingRisk);
  }

  /**
   * Soft deletes a risk by its ID
   *
   * @param id ID of the risk to delete
   * @param queryRunner Optional QueryRunner for transaction support
   * @throws NotFoundException if the risk is not found
   */
  async delete(id: number, queryRunner?: QueryRunner): Promise<void> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Risk)
      : this.riskRepository;

    const deleteResult = await repository.softDelete(id);

    if (!deleteResult.affected) {
      throw new NotFoundException(`Risk with ID ${id} not found`);
    }
  }

  /**
   * Restores a soft-deleted risk by its ID
   *
   * @param id ID of the risk to restore
   * @throws NotFoundException if the risk is not found
   */
  async restore(id: number): Promise<void> {
    const restoreResult = await this.riskRepository.restore(id);

    if (!restoreResult.affected) {
      throw new NotFoundException(`Risk with ID ${id} not found`);
    }
  }
}
