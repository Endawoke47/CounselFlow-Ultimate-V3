import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../companies/entities/company.entity';
import { Matter } from './entities/matter.entity';
import { MattersController } from './matters.controller';
import { MattersService } from './matters.service';

@Module({
  imports: [TypeOrmModule.forFeature([Matter, Company])],
  controllers: [MattersController],
  providers: [MattersService],
  exports: [MattersService],
})
export class MattersModule {}
