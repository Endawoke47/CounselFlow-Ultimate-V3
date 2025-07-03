import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModule } from '../companies/companies.module';
import { MattersModule } from '../matters/matters.module';
import { UsersModule } from '../users/users.module';
import { ContractsController } from './contracts.controller';
import { ContractParty } from './entities/contract-party.entity';
import { Contract } from './entities/contract.entity';
import { ContractPartiesService } from './services/contract-parties.service';
import { ContractsService } from './services/contracts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contract, ContractParty]),
    MattersModule,
    CompaniesModule,
    UsersModule,
  ],
  controllers: [ContractsController],
  providers: [ContractsService, ContractPartiesService],
  exports: [ContractsService, ContractPartiesService],
})
export class ContractsModule {}
