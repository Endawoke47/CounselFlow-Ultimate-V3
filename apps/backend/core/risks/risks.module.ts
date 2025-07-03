import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MattersModule } from '../matters/matters.module';
import { Risk } from './entities/risk.entity';
import { RisksController } from './risks.controller';
import { RisksService } from './risks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Risk]), MattersModule],
  controllers: [RisksController],
  providers: [RisksService],
  exports: [RisksService],
})
export class RisksModule {}
