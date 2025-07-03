import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module';
import { CompaniesModule } from '../companies/companies.module';
import { GeoModule } from '../geo/geo.module';
import { SectorsModule } from '../sectors/sectors.module';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import Account from './entities/account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
    GeoModule,
    CategoriesModule,
    SectorsModule,
    CompaniesModule,
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
