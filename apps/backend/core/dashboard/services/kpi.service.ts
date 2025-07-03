import { RiskStatus } from '1pd-types';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterOperator, PaginateQuery } from 'nestjs-paginate';
import { ActionStatus } from 'src/modules/actions/entities/action.entity';
import { Repository } from 'typeorm';
import { Action } from '../../actions/entities/action.entity';
import { RisksService } from '../../risks/risks.service';
import { KpiDto } from '../dto/kpi.dto';

// Define the statuses you want to include (all except CLOSED)
const OPEN_STATUSES = [
  RiskStatus.IDENTIFIED,
  RiskStatus.MITIGATING,
  RiskStatus.MONITORED,
  RiskStatus.ASSESSED,
].join(',');

// Define action statuses that are considered pending
const PENDING_ACTION_STATUSES = [
  ActionStatus.NOT_STARTED,
  ActionStatus.IN_PROGRESS,
  ActionStatus.BLOCKED,
];

@Injectable()
export class KpiService {
  constructor(
    private readonly risksService: RisksService,
    @InjectRepository(Action)
    private readonly actionRepository: Repository<Action>,
  ) {}

  async getKpis(): Promise<KpiDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month

    const query: PaginateQuery = {
      path: '', // Required by nestjs-paginate
      limit: 1, // We only need the count, so limit data fetched
      filter: {
        // Include all specified non-closed statuses
        status: `${FilterOperator.IN}:${OPEN_STATUSES}`,
        // Filter by creation date within the current month
        createdAt: [
          `${FilterOperator.GTE}:${startOfMonth.toISOString()}`,
          `${FilterOperator.LTE}:${endOfMonth.toISOString()}`,
        ],
      },
    };

    try {
      // Call risksService.find and get the total count from metadata
      const paginatedResult = await this.risksService.find(query);
      const newRisksCount = paginatedResult.meta.totalItems ?? 0; // Default to 0 if undefined

      // Get count of pending actions related to risks
      const pendingActionsCount = await this.actionRepository
        .createQueryBuilder('action')
        .innerJoin('action.risk', 'risk')
        .where('action.status IN (:...statuses)', {
          statuses: PENDING_ACTION_STATUSES,
        })
        .andWhere('risk.deletedAt IS NULL')
        .getCount();

      return {
        newRisksThisMonth: newRisksCount,
        pendingRiskActions: pendingActionsCount,
      };
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      // Return a default or error state if needed
      return {
        newRisksThisMonth: 0,
        pendingRiskActions: 0,
      };
    }
  }
}
