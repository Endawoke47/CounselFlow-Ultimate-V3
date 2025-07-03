import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRiskScoreConstraint1745573165523 implements MigrationInterface {
  name = 'AddRiskScoreConstraint1745573165523';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "risks" ADD CONSTRAINT "CHK_8220c1a28328e7cb505fb3b753" CHECK ("score" >= 0 AND "score" <= 10)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "risks" DROP CONSTRAINT "CHK_8220c1a28328e7cb505fb3b753"`,
    );
  }
}
