import { MigrationInterface, QueryRunner } from 'typeorm';

export class RiskCreatedBy1745312014567 implements MigrationInterface {
  name = 'RiskCreatedBy1745312014567';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "risks" ADD "created_by" integer`);
    await queryRunner.query(
      `ALTER TABLE "risks" ADD CONSTRAINT "FK_39a7959d91ac446ae5dd6b23654" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "risks" DROP CONSTRAINT "FK_39a7959d91ac446ae5dd6b23654"`,
    );
    await queryRunner.query(`ALTER TABLE "risks" DROP COLUMN "created_by"`);
  }
}
