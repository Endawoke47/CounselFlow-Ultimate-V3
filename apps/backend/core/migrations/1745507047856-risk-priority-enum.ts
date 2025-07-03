import { MigrationInterface, QueryRunner } from 'typeorm';

export class RiskPriorityEnum1745507047856 implements MigrationInterface {
  name = 'RiskPriorityEnum1745507047856';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "risks" DROP COLUMN "priority"`);
    await queryRunner.query(
      `CREATE TYPE "public"."risks_priority_enum" AS ENUM('Low', 'Medium', 'High', 'Critical')`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ADD "priority" "public"."risks_priority_enum" NOT NULL DEFAULT 'Medium'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "risks" DROP COLUMN "priority"`);
    await queryRunner.query(`DROP TYPE "public"."risks_priority_enum"`);
    await queryRunner.query(
      `ALTER TABLE "risks" ADD "priority" character varying(20) NOT NULL DEFAULT 'Medium'`,
    );
  }
}
