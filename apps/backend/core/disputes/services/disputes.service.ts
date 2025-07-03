import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { ICrudService } from 'src/shared/crud-service.interface';
import { executeInTransaction } from 'src/utils/transaction.util';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CompaniesService } from '../../companies/companies.service';
import { MattersService } from '../../matters/matters.service';
import { UsersService } from '../../users/users.service';
import { CreateDisputeDto } from '../dto/create-dispute.dto';
import { UpdateDisputeDto } from '../dto/update-dispute.dto';
import { ClaimStatus, DisputeClaim } from '../entities/dispute-claim.entity';
import { DisputeParty } from '../entities/dispute-party.entity';
import { Dispute } from '../entities/dispute.entity';

@Injectable()
export class DisputesService
  implements ICrudService<Dispute, CreateDisputeDto, UpdateDisputeDto>
{
  constructor(
    @InjectRepository(Dispute)
    private readonly disputeRepository: Repository<Dispute>,
    private readonly mattersService: MattersService,
    private readonly companiesService: CompaniesService,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a new dispute
   *
   * @param createDisputeDto DTO containing dispute data
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The created dispute
   */
  async create(
    createDisputeDto: CreateDisputeDto,
    queryRunner?: QueryRunner,
  ): Promise<Dispute> {
    return executeInTransaction(
      async transactionQueryRunner => {
        const repository =
          transactionQueryRunner.manager.getRepository(Dispute);
        const dispute = repository.create(createDisputeDto);

        // Set matter relationship if matterId is provided
        if (createDisputeDto.matterId) {
          try {
            const matter = await this.mattersService.findOne(
              parseInt(createDisputeDto.matterId),
              false,
              transactionQueryRunner,
            );
            dispute.matter = matter;
          } catch (error) {
            if (error instanceof NotFoundException) {
              throw new NotFoundException(
                `Matter with ID ${createDisputeDto.matterId} not found`,
              );
            }
            throw error;
          }
        }

        // Set initiating company relationship if initiatingCompanyId is provided
        if (createDisputeDto.initiatingCompanyId) {
          try {
            const initiatingCompany = await this.companiesService.findOne(
              parseInt(createDisputeDto.initiatingCompanyId),
              false,
              transactionQueryRunner,
            );
            dispute.initiatingCompany = initiatingCompany;
          } catch (error) {
            if (error instanceof NotFoundException) {
              throw new NotFoundException(
                `Company with ID ${createDisputeDto.initiatingCompanyId} not found`,
              );
            }
            throw error;
          }
        }

        // Set lead attorney relationship if leadAttorneyId is provided
        if (createDisputeDto.leadAttorneyId) {
          try {
            const leadAttorney = await this.usersService.findOne(
              parseInt(createDisputeDto.leadAttorneyId),
              false,
              transactionQueryRunner,
            );
            dispute.leadAttorney = leadAttorney;
          } catch (error) {
            if (error instanceof NotFoundException) {
              throw new NotFoundException(
                `User with ID ${createDisputeDto.leadAttorneyId} not found`,
              );
            }
            throw error;
          }
        }

        // Save the dispute first to get its ID
        const savedDispute = await repository.save(dispute);

        // Create parties if provided
        if (createDisputeDto.parties && createDisputeDto.parties.length > 0) {
          const partiesRepository =
            transactionQueryRunner.manager.getRepository(DisputeParty);
          for (const party of createDisputeDto.parties) {
            try {
              const company = await this.companiesService.findOne(
                parseInt(party.companyId),
                false,
                transactionQueryRunner,
              );
              await partiesRepository.save({
                dispute: savedDispute,
                company,
                role: party.role,
              });
            } catch (error) {
              if (error instanceof NotFoundException) {
                throw new NotFoundException(
                  `Company with ID ${party.companyId} not found`,
                );
              }
              throw error;
            }
          }
        }

        // Create claims if provided
        if (createDisputeDto.claims && createDisputeDto.claims.length > 0) {
          const claimsRepository =
            transactionQueryRunner.manager.getRepository(DisputeClaim);
          for (const claim of createDisputeDto.claims) {
            await claimsRepository.save({
              dispute: savedDispute,
              claimType: claim.claimType,
              status: claim.status || ClaimStatus.PENDING,
            });
          }
        }

        // Return the complete dispute with relations
        return this.findOne(savedDispute.id, false, transactionQueryRunner);
      },
      this.dataSource,
      queryRunner,
    );
  }

  /**
   * Find all disputes with pagination
   *
   * @param query Pagination query parameters
   * @param withDeleted Whether to include soft-deleted disputes
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns Paginated list of disputes
   */
  async find(
    query: PaginateQuery,
    withDeleted = false,
    queryRunner?: QueryRunner,
  ): Promise<Paginated<Dispute>> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Dispute)
      : this.disputeRepository;

    return paginate(query, repository, {
      sortableColumns: [
        'id',
        'title',
        'type',
        'status',
        'createdAt',
        'updatedAt',
        'resolutionDate',
        'filingDate',
      ],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['title', 'description', 'resolutionSummary', 'notes'],
      filterableColumns: {
        type: true,
        status: true,
        riskAssessment: true,
        resolutionType: true,
      },
      relations: [
        'matter',
        'initiatingCompany',
        'leadAttorney',
        'parties',
        'parties.company',
        'claims',
        'createdBy',
      ],
      withDeleted,
    });
  }

  /**
   * Finds a dispute by its ID
   *
   * @param id The ID of the dispute to find
   * @param withDeleted Whether to include soft-deleted disputes
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The found dispute
   * @throws NotFoundException if the dispute is not found
   */
  async findOne(
    id: number,
    withDeleted = false,
    queryRunner?: QueryRunner,
  ): Promise<Dispute> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Dispute)
      : this.disputeRepository;

    const dispute = await repository.findOne({
      where: { id },
      relations: [
        'matter',
        'initiatingCompany',
        'leadAttorney',
        'parties',
        'parties.company',
        'claims',
        'createdBy',
      ],
      withDeleted,
    });

    if (!dispute) {
      throw new NotFoundException(`Dispute with ID ${id} not found`);
    }

    return dispute;
  }

  /**
   * Updates a dispute by its ID
   *
   * @param id ID of the dispute to update
   * @param updateDisputeDto DTO containing updated dispute data
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The updated dispute
   * @throws NotFoundException if the dispute is not found
   */
  async update(
    id: number,
    updateDisputeDto: UpdateDisputeDto,
    queryRunner?: QueryRunner,
  ): Promise<Dispute> {
    return executeInTransaction(
      async transactionQueryRunner => {
        // Get the dispute with existing relations
        const dispute = await this.findOne(id, false, transactionQueryRunner);

        const {
          matterId,
          initiatingCompanyId,
          leadAttorneyId,
          parties,
          claims,
          ...updateData
        } = updateDisputeDto;

        // Update matter relationship if matterId is provided
        if (matterId) {
          try {
            const matter = await this.mattersService.findOne(
              parseInt(matterId),
              false,
              transactionQueryRunner,
            );
            dispute.matter = matter;
          } catch (error) {
            if (error instanceof NotFoundException) {
              throw new NotFoundException(
                `Matter with ID ${matterId} not found`,
              );
            }
            throw error;
          }
        }

        // Update initiating company relationship if initiatingCompanyId is provided
        if (initiatingCompanyId) {
          try {
            const initiatingCompany = await this.companiesService.findOne(
              parseInt(initiatingCompanyId),
              false,
              transactionQueryRunner,
            );
            dispute.initiatingCompany = initiatingCompany;
          } catch (error) {
            if (error instanceof NotFoundException) {
              throw new NotFoundException(
                `Company with ID ${initiatingCompanyId} not found`,
              );
            }
            throw error;
          }
        }

        // Update lead attorney relationship if leadAttorneyId is provided
        if (leadAttorneyId) {
          try {
            const leadAttorney = await this.usersService.findOne(
              parseInt(leadAttorneyId),
              false,
              transactionQueryRunner,
            );
            dispute.leadAttorney = leadAttorney;
          } catch (error) {
            if (error instanceof NotFoundException) {
              throw new NotFoundException(
                `User with ID ${leadAttorneyId} not found`,
              );
            }
            throw error;
          }
        }

        // Save the dispute changes
        Object.assign(dispute, updateData);
        const repository =
          transactionQueryRunner.manager.getRepository(Dispute);
        const savedDispute = await repository.save(dispute);

        // Handle parties update if provided
        if (parties) {
          const partiesRepository =
            transactionQueryRunner.manager.getRepository(DisputeParty);

          // Remove existing parties
          await partiesRepository.delete({ dispute: { id: savedDispute.id } });

          // Create new parties
          for (const party of parties) {
            try {
              const company = await this.companiesService.findOne(
                parseInt(party.companyId),
                false,
                transactionQueryRunner,
              );
              await partiesRepository.save({
                dispute: savedDispute,
                company,
                role: party.role,
              });
            } catch (error) {
              if (error instanceof NotFoundException) {
                throw new NotFoundException(
                  `Company with ID ${party.companyId} not found`,
                );
              }
              throw error;
            }
          }
        }

        // Handle claims update if provided
        if (claims) {
          const claimsRepository =
            transactionQueryRunner.manager.getRepository(DisputeClaim);

          // Remove existing claims
          await claimsRepository.delete({ dispute: { id: savedDispute.id } });

          // Create new claims
          for (const claim of claims) {
            await claimsRepository.save({
              dispute: savedDispute,
              claimType: claim.claimType,
              status: claim.status || ClaimStatus.PENDING,
            });
          }
        }

        // Return the updated dispute with all relations
        return this.findOne(id, false, transactionQueryRunner);
      },
      this.dataSource,
      queryRunner,
    );
  }

  /**
   * Soft deletes a dispute by its ID
   *
   * @param id ID of the dispute to delete
   * @throws NotFoundException if the dispute is not found
   */
  async delete(id: number): Promise<void> {
    return executeInTransaction(async transactionQueryRunner => {
      const repository = transactionQueryRunner.manager.getRepository(Dispute);

      // Find the dispute using the repository directly
      const options: any = {
        where: { id },
      };

      const dispute = await repository.findOne(options);

      if (!dispute) {
        throw new NotFoundException(`Dispute with ID ${id} not found`);
      }

      // Soft delete the dispute
      await repository.softDelete(id);
    }, this.dataSource);
  }

  /**
   * Restores a soft-deleted dispute
   *
   * @param id ID of the dispute to restore
   * @returns void
   * @throws NotFoundException if the dispute is not found
   */
  async restore(id: number): Promise<void> {
    return executeInTransaction(async transactionQueryRunner => {
      const repository = transactionQueryRunner.manager.getRepository(Dispute);

      // Check if dispute exists (including soft-deleted)
      const options: any = {
        where: { id },
        withDeleted: true,
      };

      const dispute = await repository.findOne(options);

      if (!dispute) {
        throw new NotFoundException(`Dispute with ID ${id} not found`);
      }

      // Restore the dispute
      await repository.restore(id);
    }, this.dataSource);
  }
}
