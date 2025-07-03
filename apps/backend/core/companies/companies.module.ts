import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '../categories/categories.module';
import { GeoModule } from '../geo/geo.module';
import { SectorsModule } from '../sectors/sectors.module';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { CompanyAccount } from './entities/company-account.entity';
import { Company } from './entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, CompanyAccount]),
    GeoModule,
    SectorsModule,
    CategoriesModule,
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
