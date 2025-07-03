import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModule } from '../companies/companies.module';
import { ContractsModule } from '../contracts/contracts.module';
import { MattersModule } from '../matters/matters.module';
import { UsersModule } from '../users/users.module';
import { DisputesController } from './disputes.controller';
import { Dispute } from './entities/dispute.entity';
import { DisputesService } from './services/disputes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dispute]),
    MattersModule,
    CompaniesModule,
    ContractsModule,
    UsersModule,
  ],
  controllers: [DisputesController],
  providers: [DisputesService],
  exports: [DisputesService],
})
export class DisputesModule {}
