import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sector } from './entities/sector.entity';
import { SectorsController } from './sectors.controller';
import { SectorsService } from './sectors.service';
import { Country } from '../geo/entities/country.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sector, Country])],
  controllers: [SectorsController],
  providers: [SectorsService],
  exports: [SectorsService],
})
export class SectorsModule {}
