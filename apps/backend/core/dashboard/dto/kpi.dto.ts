import { ApiProperty } from '@nestjs/swagger';

export class KpiDto {
  @ApiProperty({
    description: 'Number of new risks identified this month',
    example: 5,
  })
  newRisksThisMonth!: number;

  @ApiProperty({
    description: 'Number of pending actions related to risks',
    example: 12,
  })
  pendingRiskActions!: number;
}
