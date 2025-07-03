import { HeatmapResponse } from '1pd-types';
import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ErrorResponseDto } from './dto/error-response.dto';
import { HeatmapResponseDto } from './dto/heatmap-response.dto';
import { KpiDto } from './dto/kpi.dto';
import { KpiService } from './services/kpi.service';
import { RiskHeatmapService } from './services/risk-heatmap.service';
import {
  TopMatterDto,
  TopMattersService,
} from './services/top-matters.service';
@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly kpiService: KpiService,
    private readonly topMattersService: TopMattersService,
    private readonly riskHeatmapService: RiskHeatmapService,
  ) {}

  @Get('kpis')
  @ApiOperation({ summary: 'Get Dashboard KPIs' })
  @ApiOkResponse({
    description: 'Returns key performance indicators for the dashboard.',
    type: KpiDto,
  })
  getKpis(): Promise<KpiDto> {
    return this.kpiService.getKpis();
  }

  @Get('top-matters-by-risks')
  @ApiOperation({ summary: 'Get Top 5 Matters by Risk Count' })
  @ApiOkResponse({
    description:
      'Returns a list of the top 5 matters with the highest number of associated risks.',
    type: [TopMatterDto],
  })
  findTopMattersByRiskCount(): Promise<TopMatterDto[]> {
    return this.topMattersService.findTopMattersByRiskCount();
  }

  @Get('critical-risk-heatmap')
  @ApiOperation({
    summary: 'Get critical risk heatmap data',
    description:
      'Returns data for visualizing a risk heatmap with subsidiaries and risk types. Shows the highest severity risks for each subsidiary and risk type combination.',
  })
  @ApiOkResponse({
    description: 'Heatmap data successfully retrieved',
    type: HeatmapResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User is not authorized to access risk data',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'No active risks found in the system',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error occurred while processing the request',
    type: ErrorResponseDto,
  })
  async getCriticalRiskHeatmap(): Promise<HeatmapResponse> {
    return this.riskHeatmapService.getCriticalRiskHeatmap();
  }
}
