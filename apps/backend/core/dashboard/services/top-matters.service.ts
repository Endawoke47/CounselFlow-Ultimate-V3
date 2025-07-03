import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Matter } from '../../matters/entities/matter.entity';

export class TopMatterDto {
  id!: number;
  name!: string;
  numberOfRisks!: number;
}

@Injectable()
export class TopMattersService {
  constructor(
    @InjectRepository(Matter)
    private readonly matterRepository: Repository<Matter>,
  ) {}

  /**
   * Find top 5 matters by number of associated risks
   * @returns Promise<TopMatterDto[]> Array of matters with risk counts
   */
  async findTopMattersByRiskCount(): Promise<TopMatterDto[]> {
    const query = this.matterRepository
      .createQueryBuilder('matter')
      .leftJoin('matter.risks', 'risk')
      .select([
        'matter.id as id',
        'matter.name as name',
        'COUNT(DISTINCT risk.id) as "numberOfRisks"',
      ])
      .where('risk.deletedAt IS NULL')
      .groupBy('matter.id')
      .orderBy('"numberOfRisks"', 'DESC')
      .limit(5);

    const results = await query.getRawMany();

    return results.map(result => ({
      id: result.id,
      name: result.name,
      numberOfRisks: parseInt(result.numberOfRisks, 10) || 0,
    }));
  }
}
