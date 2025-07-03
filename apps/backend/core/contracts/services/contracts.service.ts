import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { ICrudService } from 'src/shared/crud-service.interface';
import { executeInTransaction } from 'src/utils/transaction.util';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CompaniesService } from '../../companies/companies.service';
import { MattersService } from '../../matters/matters.service';
import { UsersService } from '../../users/users.service';
import { CreateContractDto } from '../dto/create-contract.dto';
import { UpdateContractDto } from '../dto/update-contract.dto';
import { Contract } from '../entities/contract.entity';
import { ContractPartiesService } from './contract-parties.service';

@Injectable()
export class ContractsService
  implements ICrudService<Contract, CreateContractDto, UpdateContractDto>
{
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    private readonly mattersService: MattersService,
    private readonly companiesService: CompaniesService,
    private readonly usersService: UsersService,
    private readonly contractPartiesService: ContractPartiesService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Creates a new contract
   *
   * @param createContractDto DTO containing contract data
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The created contract
   */
  async create(
    createContractDto: CreateContractDto,
    queryRunner?: QueryRunner,
  ): Promise<Contract> {
    return executeInTransaction(
      async transactionQueryRunner => {
        const repository =
          transactionQueryRunner.manager.getRepository(Contract);
        const contract = repository.create(createContractDto);

        // Set matter relationship if matterId is provided
        if (createContractDto.matterId) {
          try {
            const matter = await this.mattersService.findOne(
              parseInt(createContractDto.matterId),
              false,
              transactionQueryRunner,
            );
            contract.matter = matter;
          } catch (error) {
            if (error instanceof NotFoundException) {
              throw new NotFoundException(
                `Matter with ID ${createContractDto.matterId} not found`,
              );
            }
            throw error;
          }
        }

        // Set owning company relationship if owningCompanyId is provided
        if (createContractDto.owningCompanyId) {
          try {
            const owningCompany = await this.companiesService.findOne(
              parseInt(createContractDto.owningCompanyId),
              false,
              transactionQueryRunner,
            );
            contract.owningCompany = owningCompany;
          } catch (error) {
            if (error instanceof NotFoundException) {
              throw new NotFoundException(
                `Company with ID ${createContractDto.owningCompanyId} not found`,
              );
            }
            throw error;
          }
        }

        // Set counterparty relationship if counterpartyId is provided
        if (createContractDto.counterpartyId) {
          try {
            const counterparty = await this.companiesService.findOne(
              parseInt(createContractDto.counterpartyId),
              false,
              transactionQueryRunner,
            );
            contract.counterparty = counterparty;
          } catch (error) {
            if (error instanceof NotFoundException) {
              throw new NotFoundException(
                `Counterparty company with ID ${createContractDto.counterpartyId} not found`,
              );
            }
            throw error;
          }
        }

        // Set internal legal owner relationship if internalLegalOwnerId is provided
        if (createContractDto.internalLegalOwnerId) {
          try {
            const internalLegalOwner = await this.usersService.findOne(
              parseInt(createContractDto.internalLegalOwnerId),
              false,
              transactionQueryRunner,
            );
            contract.internalLegalOwner = internalLegalOwner;
          } catch (error) {
            if (error instanceof NotFoundException) {
              throw new NotFoundException(
                `User with ID ${createContractDto.internalLegalOwnerId} not found`,
              );
            }
            throw error;
          }
        }

        // Save the contract first to get its ID
        const savedContract = await repository.save(contract);

        // Create contract parties if provided
        if (
          createContractDto.partiesInvolved &&
          createContractDto.partiesInvolved.length > 0
        ) {
          await this.contractPartiesService.createForContract(
            savedContract,
            createContractDto.partiesInvolved,
            transactionQueryRunner,
          );
        }

        // Return the complete contract with relations
        return this.findOne(savedContract.id, false, transactionQueryRunner);
      },
      this.dataSource,
      queryRunner,
    );
  }

  /**
   * Retrieves all contracts with pagination
   *
   * @param query Pagination query parameters
   * @param withDeleted Whether to include soft deleted contracts
   * @returns Paginated contracts
   */
  async find(
    query: PaginateQuery,
    withDeleted: boolean = false,
  ): Promise<Paginated<Contract>> {
    return paginate(query, this.contractRepository, {
      sortableColumns: [
        'id',
        'title',
        'type',
        'status',
        'priority',
        'effectiveDate',
        'executionDate',
        'expirationDate',
        'createdAt',
        'updatedAt',
      ],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['title', 'description', 'counterpartyName', 'notes'],
      relations: [
        'matter',
        'owningCompany',
        'counterparty',
        'internalLegalOwner',
        'createdBy',
        'parties',
        'parties.company',
        'parties.createdBy',
      ],
      withDeleted,
    });
  }

  /**
   * Retrieves a contract by its ID
   *
   * @param id ID of the contract to retrieve
   * @param withDeleted Whether to include soft deleted contracts
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The found contract
   * @throws NotFoundException if the contract is not found
   */
  async findOne(
    id: number,
    withDeleted: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<Contract> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(Contract)
      : this.contractRepository;

    const contract = await repository.findOne({
      where: { id },
      relations: [
        'matter',
        'owningCompany',
        'counterparty',
        'internalLegalOwner',
        'createdBy',
        'parties',
        'parties.company',
        'parties.createdBy',
      ],
      withDeleted: withDeleted,
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    return contract;
  }

  /**
   * Updates a contract by its ID
   *
   * @param id ID of the contract to update
   * @param updateContractDto DTO containing updated contract data
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The updated contract
   * @throws NotFoundException if the contract is not found
   */
  async update(
    id: number,
    updateContractDto: UpdateContractDto,
    queryRunner?: QueryRunner,
  ): Promise<Contract> {
    return executeInTransaction(
      async transactionQueryRunner => {
        // Get the contract with existing relations
        const contract = await this.findOne(id, false, transactionQueryRunner);

        const {
          matterId,
          owningCompanyId,
          counterpartyId,
          internalLegalOwnerId,
          partiesInvolved,
          ...updateData
        } = updateContractDto;

        // Update matter relationship if matterId is provided
        if (matterId) {
          try {
            const matter = await this.mattersService.findOne(
              parseInt(matterId),
              false,
              transactionQueryRunner,
            );
            contract.matter = matter;
          } catch (error) {
            if (error instanceof NotFoundException) {
              throw new NotFoundException(
                `Matter with ID ${matterId} not found`,
              );
            }
            throw error;
          }
        }

        // Update owning company relationship if owningCompanyId is provided
        if (owningCompanyId) {
          try {
            const owningCompany = await this.companiesService.findOne(
              parseInt(owningCompanyId),
              false,
              transactionQueryRunner,
            );
            contract.owningCompany = owningCompany;
          } catch (error) {
            if (error instanceof NotFoundException) {
              throw new NotFoundException(
                `Company with ID ${owningCompanyId} not found`,
              );
            }
            throw error;
          }
        }

        // Update counterparty relationship if counterpartyId is provided
        if (counterpartyId) {
          try {
            const counterparty = await this.companiesService.findOne(
              parseInt(counterpartyId),
              false,
              transactionQueryRunner,
            );
            contract.counterparty = counterparty;
          } catch (error) {
            if (error instanceof NotFoundException) {
              throw new NotFoundException(
                `Counterparty company with ID ${counterpartyId} not found`,
              );
            }
            throw error;
          }
        }

        // Update internal legal owner relationship if internalLegalOwnerId is provided
        if (internalLegalOwnerId) {
          try {
            const internalLegalOwner = await this.usersService.findOne(
              parseInt(internalLegalOwnerId),
              false,
              transactionQueryRunner,
            );
            contract.internalLegalOwner = internalLegalOwner;
          } catch (error) {
            if (error instanceof NotFoundException) {
              throw new NotFoundException(
                `User with ID ${internalLegalOwnerId} not found`,
              );
            }
            throw error;
          }
        }

        // Save the contract changes
        Object.assign(contract, updateData);
        const repository =
          transactionQueryRunner.manager.getRepository(Contract);
        const savedContract = await repository.save(contract);

        // Update contract parties if provided
        if (partiesInvolved) {
          // Remove existing contract parties
          await this.contractPartiesService.removeAllForContract(
            id,
            transactionQueryRunner,
          );

          // Create new contract parties
          if (partiesInvolved.length > 0) {
            await this.contractPartiesService.createForContract(
              savedContract,
              partiesInvolved,
              transactionQueryRunner,
            );
          }
        }

        // Return the updated contract with all relations
        return this.findOne(id, false, transactionQueryRunner);
      },
      this.dataSource,
      queryRunner,
    );
  }

  /**
   * Removes a contract by its ID
   *
   * @param id ID of the contract to remove
   * @param permanent Whether to permanently delete the contract
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The removed contract
   * @throws NotFoundException if the contract is not found
   */
  async remove(
    id: number,
    permanent: boolean = false,
    queryRunner?: QueryRunner,
  ): Promise<Contract> {
    return executeInTransaction(
      async transactionQueryRunner => {
        // Get the contract with relations
        const contract = await this.findOne(id, false, transactionQueryRunner);

        // First, remove all associated contract parties if permanent delete
        if (permanent) {
          await this.contractPartiesService.removeAllForContract(
            id,
            transactionQueryRunner,
          );
        }

        const repository =
          transactionQueryRunner.manager.getRepository(Contract);

        if (permanent) {
          return repository.remove(contract);
        }

        return repository.softRemove(contract);
      },
      this.dataSource,
      queryRunner,
    );
  }

  /**
   * Restores a soft-deleted contract by its ID
   *
   * @param id ID of the contract to restore
   * @returns Promise resolved when operation is complete
   * @throws NotFoundException if the contract is not found
   */
  async restore(id: number): Promise<void> {
    // First check if the deleted record exists
    const deletedContract = await this.contractRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!deletedContract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    await this.contractRepository.restore(id);
  }

  /**
   * Deletes a contract by ID
   *
   * @param id Contract ID
   * @returns Promise resolved when operation is complete
   */
  async delete(id: number): Promise<void> {
    await this.remove(id, false);
  }
}
