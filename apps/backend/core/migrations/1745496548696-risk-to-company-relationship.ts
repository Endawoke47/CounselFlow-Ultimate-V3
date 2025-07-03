import { MigrationInterface, QueryRunner } from 'typeorm';

export class RiskToCompanyRelationship1745496548696
  implements MigrationInterface
{
  name = 'RiskToCompanyRelationship1745496548696';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "risks" ADD "company_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "risks" ADD CONSTRAINT "CHK_2e06d3cbe9965696e5c5650165" CHECK (NOT ("matter_id" IS NULL AND "company_id" IS NULL))`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ADD CONSTRAINT "CHK_c9feea772e0b93cf2936567dee" CHECK ("matter_id" IS NULL OR "company_id" IS NULL)`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ADD CONSTRAINT "FK_273a4a6f92965e449d6b303c75d" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "risks" DROP CONSTRAINT "FK_273a4a6f92965e449d6b303c75d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" DROP CONSTRAINT "CHK_c9feea772e0b93cf2936567dee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" DROP CONSTRAINT "CHK_2e06d3cbe9965696e5c5650165"`,
    );
    await queryRunner.query(`ALTER TABLE "risks" DROP COLUMN "company_id"`);
  }
}
