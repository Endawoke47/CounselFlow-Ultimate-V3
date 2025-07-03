import { MigrationInterface, QueryRunner } from 'typeorm';

export class RisksDontDependOnTargets1742975196313
  implements MigrationInterface
{
  name = 'RisksDontDependOnTargets1742975196313';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "risks" DROP CONSTRAINT "fk_risk_project_target"`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" RENAME COLUMN "project_target_id" TO "project_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ADD CONSTRAINT "fk_risk_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "risks" DROP CONSTRAINT "fk_risk_project"`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" RENAME COLUMN "project_id" TO "project_target_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ADD CONSTRAINT "fk_risk_project_target" FOREIGN KEY ("project_target_id") REFERENCES "projects_targets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
