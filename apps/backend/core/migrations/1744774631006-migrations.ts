import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1744774631006 implements MigrationInterface {
  name = 'Migrations1744774631006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "actions" RENAME COLUMN "sub_tasks" TO "parentId"`,
    );
    await queryRunner.query(
      `CREATE TABLE "action_closure" ("ancestor_id" integer NOT NULL, "descendant_id" integer NOT NULL, CONSTRAINT "PK_2f045722ca7c86e4ee3941270d8" PRIMARY KEY ("ancestor_id", "descendant_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5879a3eb60f0e37c0d9528e3d1" ON "action_closure" ("ancestor_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fa4626f9788ddd77eae2531bb1" ON "action_closure" ("descendant_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" ALTER COLUMN "companyType" SET DEFAULT 'LAWYER'`,
    );
    await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN "parentId"`);
    await queryRunner.query(`ALTER TABLE "actions" ADD "parentId" integer`);
    await queryRunner.query(
      `ALTER TABLE "actions" ADD CONSTRAINT "FK_14740c355658ef3d5357ef84969" FOREIGN KEY ("parentId") REFERENCES "actions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_closure" ADD CONSTRAINT "FK_5879a3eb60f0e37c0d9528e3d13" FOREIGN KEY ("ancestor_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_closure" ADD CONSTRAINT "FK_fa4626f9788ddd77eae2531bb17" FOREIGN KEY ("descendant_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "action_closure" DROP CONSTRAINT "FK_fa4626f9788ddd77eae2531bb17"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_closure" DROP CONSTRAINT "FK_5879a3eb60f0e37c0d9528e3d13"`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions" DROP CONSTRAINT "FK_14740c355658ef3d5357ef84969"`,
    );
    await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN "parentId"`);
    await queryRunner.query(`ALTER TABLE "actions" ADD "parentId" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" ALTER COLUMN "companyType" SET DEFAULT 'ADMIN'`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fa4626f9788ddd77eae2531bb1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5879a3eb60f0e37c0d9528e3d1"`,
    );
    await queryRunner.query(`DROP TABLE "action_closure"`);
    await queryRunner.query(
      `ALTER TABLE "actions" RENAME COLUMN "parentId" TO "sub_tasks"`,
    );
  }
}
