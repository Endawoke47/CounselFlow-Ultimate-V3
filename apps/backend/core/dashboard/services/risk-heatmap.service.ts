import {
  HeatmapCell,
  HeatmapResponse,
  RiskPriority,
  RiskSeverityCounts,
  RiskStatus,
} from '1pd-types';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Risk } from '../../risks/entities/risk.entity';

@Injectable()
export class RiskHeatmapService {
  constructor(
    @InjectRepository(Risk)
    private readonly riskRepository: Repository<Risk>,
  ) {}

  async getCriticalRiskHeatmap(): Promise<HeatmapResponse> {
    const risks = await this.riskRepository
      .createQueryBuilder('risk')
      .leftJoinAndSelect('risk.matter', 'matter')
      .leftJoinAndSelect('risk.company', 'company')
      .leftJoinAndSelect('matter.company', 'matterCompany')
      .where('risk.status != :closedStatus', {
        closedStatus: RiskStatus.CLOSED,
      })
      .andWhere('risk.deletedAt IS NULL')
      .select([
        'risk.id',
        'risk.name',
        'risk.category',
        'risk.priority',
        'risk.inherentLikelihood',
        'risk.financialImpactMin',
        'risk.financialImpactMax',
        'risk.currency',
        'matter.id',
        'matter.name',
        'company.id',
        'company.name',
        'matterCompany.id',
        'matterCompany.name',
      ])
      .getMany();

    // Get all unique subsidiaries
    const subsidiaries = this.getUniqueSubsidiaries(risks);

    // Get all unique risk types/categories
    const riskTypes = [...new Set(risks.map(risk => risk.category))];

    // Transform data into the heatmap format
    const heatmapData = this.generateHeatmapData(
      risks,
      subsidiaries,
      riskTypes,
    );

    return {
      subsidiaries: subsidiaries.map(s => ({ id: s.id, name: s.name })),
      riskTypes,
      heatmapData,
    };
  }

  private getUniqueSubsidiaries(risks: Risk[]): { id: number; name: string }[] {
    const subsidiariesMap = new Map<number, { id: number; name: string }>();

    risks.forEach(risk => {
      // If risk is directly linked to a company
      if (risk.company) {
        subsidiariesMap.set(risk.company.id, {
          id: risk.company.id,
          name: risk.company.name,
        });
      }

      // If risk is linked to a matter and matter is linked to a company
      if (risk.matter && (risk.matter as any).company) {
        const matterCompany = (risk.matter as any).company;
        subsidiariesMap.set(matterCompany.id, {
          id: matterCompany.id,
          name: matterCompany.name,
        });
      }
    });

    return [...subsidiariesMap.values()];
  }

  private generateHeatmapData(
    risks: Risk[],
    subsidiaries: { id: number; name: string }[],
    riskTypes: string[],
  ): HeatmapCell[] {
    const heatmapData: HeatmapCell[] = [];

    // Initialize a map to track counts for each company-riskType combination
    const counts = new Map<string, RiskSeverityCounts>();

    // For each subsidiary-riskType combination, we'll create a cell
    subsidiaries.forEach(subsidiary => {
      riskTypes.forEach(riskType => {
        const key = `${subsidiary.id}-${riskType}`;
        counts.set(key, {
          low: 0,
          moderate: 0,
          high: 0,
          critical: 0,
          highestSeverity: RiskPriority.LOW,
        });
      });
    });

    // Count risks by subsidiary and type
    risks.forEach(risk => {
      let subsidiaryId: number | null = null;

      // Determine which subsidiary this risk belongs to
      if (risk.company) {
        subsidiaryId = risk.company.id;
      } else if (risk.matter && (risk.matter as any).company) {
        subsidiaryId = (risk.matter as any).company.id;
      }

      if (subsidiaryId && risk.category) {
        const key = `${subsidiaryId}-${risk.category}`;
        const countData = counts.get(key);

        if (countData) {
          // Update counts based on priority
          switch (risk.priority.toLowerCase()) {
            case RiskPriority.LOW.toLowerCase():
              countData.low += 1;
              break;
            case RiskPriority.MEDIUM.toLowerCase():
              countData.moderate += 1;
              if (countData.highestSeverity === RiskPriority.LOW) {
                countData.highestSeverity = RiskPriority.MEDIUM;
              }
              break;
            case RiskPriority.HIGH.toLowerCase():
              countData.high += 1;
              if (
                [RiskPriority.LOW, RiskPriority.MEDIUM].includes(
                  countData.highestSeverity,
                )
              ) {
                countData.highestSeverity = RiskPriority.HIGH;
              }
              break;
            case RiskPriority.CRITICAL.toLowerCase():
              countData.critical += 1;
              countData.highestSeverity = RiskPriority.CRITICAL;
              break;
          }
        }
      }
    });

    // Create heatmap cells from the count data
    subsidiaries.forEach(subsidiary => {
      riskTypes.forEach(riskType => {
        const key = `${subsidiary.id}-${riskType}`;
        const countData = counts.get(key);

        if (
          countData &&
          (countData.low > 0 ||
            countData.moderate > 0 ||
            countData.high > 0 ||
            countData.critical > 0)
        ) {
          heatmapData.push({
            subsidiary: subsidiary.name,
            subsidiaryId: subsidiary.id,
            riskType,
            severityCounts: countData,
          });
        }
      });
    });

    return heatmapData;
  }
}
