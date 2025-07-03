import {
  HeatmapCell,
  HeatmapResponse,
  RiskPriority,
  RiskSeverityCounts,
} from '1pd-types';
import { ApiProperty } from '@nestjs/swagger';

export class SeverityCountsDto implements RiskSeverityCounts {
  @ApiProperty({
    description: 'Count of low severity risks',
    example: 2,
  })
  low!: number;

  @ApiProperty({
    description: 'Count of moderate severity risks',
    example: 3,
  })
  moderate!: number;

  @ApiProperty({
    description: 'Count of high severity risks',
    example: 1,
  })
  high!: number;

  @ApiProperty({
    description: 'Count of critical severity risks',
    example: 0,
  })
  critical!: number;

  @ApiProperty({
    description: 'The highest severity level among the risks',
    enum: RiskPriority,
    example: RiskPriority.HIGH,
    enumName: 'RiskPriority',
  })
  highestSeverity!: RiskPriority;
}

export class HeatmapCellDto implements HeatmapCell {
  @ApiProperty({
    description: 'Name of the subsidiary',
    example: 'Subsidiary A',
  })
  subsidiary!: string;

  @ApiProperty({
    description: 'ID of the subsidiary',
    example: 1,
  })
  subsidiaryId!: number;

  @ApiProperty({
    description: 'Type of risk',
    example: 'Regulatory',
  })
  riskType!: string;

  @ApiProperty({
    description: 'Counts of risks by severity level',
    type: SeverityCountsDto,
  })
  severityCounts!: SeverityCountsDto;
}

export class SubsidiaryDto {
  @ApiProperty({
    description: 'ID of the subsidiary',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Name of the subsidiary',
    example: 'Subsidiary A',
  })
  name!: string;
}

export class HeatmapResponseDto implements HeatmapResponse {
  @ApiProperty({
    description: 'List of subsidiaries in the heatmap',
    type: [SubsidiaryDto],
    isArray: true,
  })
  subsidiaries!: SubsidiaryDto[];

  @ApiProperty({
    description: 'List of risk types in the heatmap',
    example: ['Litigation', 'Regulatory', 'Contract'],
    type: [String],
    isArray: true,
  })
  riskTypes!: string[];

  @ApiProperty({
    description: 'Heatmap data organized by subsidiary and risk type',
    type: [HeatmapCellDto],
    isArray: true,
  })
  heatmapData!: HeatmapCellDto[];
}
