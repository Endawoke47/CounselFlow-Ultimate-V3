import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRiskScoreAndActionsRelation1745573010893
  implements MigrationInterface
{
  name = 'AddRiskScoreAndActionsRelation1745573010893';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "actions" ADD "risk_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "risks" ADD "score" numeric(3,1) NOT NULL DEFAULT '5'`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions" ADD CONSTRAINT "FK_b2a1f8653c03dacdb27793681f9" FOREIGN KEY ("risk_id") REFERENCES "risks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "actions" DROP CONSTRAINT "FK_b2a1f8653c03dacdb27793681f9"`,
    );
    await queryRunner.query(`ALTER TABLE "risks" DROP COLUMN "score"`);
    await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN "risk_id"`);
  }
}
