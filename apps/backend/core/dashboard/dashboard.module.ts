import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionsModule } from '../actions/actions.module';
import { Action } from '../actions/entities/action.entity';
import { Matter } from '../matters/entities/matter.entity';
import { MattersModule } from '../matters/matters.module';
import { Risk } from '../risks/entities/risk.entity';
import { RisksModule } from '../risks/risks.module';
import { DashboardController } from './dashboard.controller'; 
import { KpiService } from './services/kpi.service';
import { RiskHeatmapService } from './services/risk-heatmap.service';
import { TopMattersService } from './services/top-matters.service';

@Module({
  imports: [
    RisksModule,
    MattersModule,
    ActionsModule,
    TypeOrmModule.forFeature([Risk, Action, Matter]),
  ],
  controllers: [DashboardController],
  providers: [KpiService, TopMattersService, RiskHeatmapService],
})
export class DashboardModule {}
