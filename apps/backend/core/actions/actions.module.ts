import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Matter } from '../matters/entities/matter.entity';
import { ActionsController } from './actions.controller';
import { ActionsService } from './actions.service';
import { Action } from './entities/action.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Action, Matter])],
  controllers: [ActionsController],
  providers: [ActionsService],
  exports: [ActionsService],
})
export class ActionsModule {}
