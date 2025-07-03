import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompaniesService } from 'src/modules/companies/companies.service';
import { QueryRunner, Repository } from 'typeorm';
import { ContractPartyDto } from '../dto/create-contract.dto';
import { ContractParty } from '../entities/contract-party.entity';
import { Contract } from '../entities/contract.entity';

@Injectable()
export class ContractPartiesService {
  constructor(
    @InjectRepository(ContractParty)
    private readonly contractPartyRepository: Repository<ContractParty>,
    private readonly companiesService: CompaniesService,
  ) {}

  /**
   * Creates contract parties for a contract
   *
   * @param contract The contract to create parties for
   * @param partiesDto DTOs containing party data
   * @param queryRunner Optional QueryRunner for transaction support
   * @returns The created contract parties
   */
  async createForContract(
    contract: Contract,
    partiesDto: ContractPartyDto[],
    queryRunner?: QueryRunner,
  ): Promise<ContractParty[]> {
    if (!partiesDto || partiesDto.length === 0) {
      return [];
    }

    const repository = queryRunner
      ? queryRunner.manager.getRepository(ContractParty)
      : this.contractPartyRepository;

    const parties: ContractParty[] = [];

    for (const partyDto of partiesDto) {
      const party = repository.create({
        role: partyDto.role,
        signatory: partyDto.signatory,
        contract: contract,
      });

      // Set company relationship
      try {
        const company = await this.companiesService.findOne(
          parseInt(partyDto.companyId),
          false,
          queryRunner,
        );
        party.company = company;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new NotFoundException(
            `Company with ID ${partyDto.companyId} not found`,
          );
        }
        throw error;
      }

      parties.push(await repository.save(party));
    }

    return parties;
  }

  /**
   * Removes all contract parties for a contract
   *
   * @param contractId ID of the contract
   * @param queryRunner Optional QueryRunner for transaction support
   */
  async removeAllForContract(
    contractId: number,
    queryRunner?: QueryRunner,
  ): Promise<void> {
    const repository = queryRunner
      ? queryRunner.manager.getRepository(ContractParty)
      : this.contractPartyRepository;

    await repository.delete({ contract: { id: contractId } });
  }
}
