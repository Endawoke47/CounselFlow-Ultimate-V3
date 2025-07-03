import { MigrationInterface, QueryRunner } from 'typeorm';

export class RiskTitleFieldToName1744620566255 implements MigrationInterface {
  name = 'RiskTitleFieldToName1744620566255';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "risks" RENAME COLUMN "title" TO "name"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "risks" RENAME COLUMN "name" TO "title"`,
    );
  }
}
