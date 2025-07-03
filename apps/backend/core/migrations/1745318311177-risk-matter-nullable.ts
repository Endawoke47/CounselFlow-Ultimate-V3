import { MigrationInterface, QueryRunner } from 'typeorm';

export class RiskMatterNullable1745318311177 implements MigrationInterface {
  name = 'RiskMatterNullable1745318311177';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "risks" DROP CONSTRAINT "FK_aa175c22ddbe89a5372ba11567a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ALTER COLUMN "matter_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ADD CONSTRAINT "FK_aa175c22ddbe89a5372ba11567a" FOREIGN KEY ("matter_id") REFERENCES "matters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "risks" DROP CONSTRAINT "FK_aa175c22ddbe89a5372ba11567a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ALTER COLUMN "matter_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ADD CONSTRAINT "FK_aa175c22ddbe89a5372ba11567a" FOREIGN KEY ("matter_id") REFERENCES "matters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
