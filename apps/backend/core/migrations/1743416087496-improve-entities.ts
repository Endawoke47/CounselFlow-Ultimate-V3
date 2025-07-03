import { MigrationInterface, QueryRunner } from 'typeorm';

export class ImproveEntities1743416087496 implements MigrationInterface {
  name = 'ImproveEntities1743416087496';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects_targets" DROP CONSTRAINT "fk_project_target_project"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" DROP CONSTRAINT "fk_project_target_company"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_project_company_unique"`);
    await queryRunner.query(
      `ALTER TABLE "projects_targets" ALTER COLUMN "project_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" ALTER COLUMN "company_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" DROP CONSTRAINT "fk_target_sector_project"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" DROP CONSTRAINT "fk_target_sector_company"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_target_sector_unique"`);
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ALTER COLUMN "project_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ALTER COLUMN "company_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" DROP CONSTRAINT "fk_project_user_project"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" DROP CONSTRAINT "fk_project_user_user"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_PROJECT_USER_UNIQUE"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_PROJECT_OWNER"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_PROJECT_LEAD"`);
    await queryRunner.query(
      `ALTER TABLE "projects_users" ALTER COLUMN "project_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" ALTER COLUMN "user_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_project_company_unique" ON "projects_targets" ("project_id", "company_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_target_sector_unique" ON "targets_sectors" ("project_id", "company_id", "sector_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_PROJECT_USER_UNIQUE" ON "projects_users" ("project_id", "user_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_PROJECT_OWNER" ON "projects_users" ("project_id", "is_owner") WHERE is_owner = true`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_PROJECT_LEAD" ON "projects_users" ("project_id", "is_lead") WHERE is_lead = true`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" ADD CONSTRAINT "fk_project_target_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" ADD CONSTRAINT "fk_project_target_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ADD CONSTRAINT "fk_target_sector_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ADD CONSTRAINT "fk_target_sector_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" ADD CONSTRAINT "fk_project_user_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" ADD CONSTRAINT "fk_project_user_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects_users" DROP CONSTRAINT "fk_project_user_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" DROP CONSTRAINT "fk_project_user_project"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" DROP CONSTRAINT "fk_target_sector_company"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" DROP CONSTRAINT "fk_target_sector_project"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" DROP CONSTRAINT "fk_project_target_company"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" DROP CONSTRAINT "fk_project_target_project"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_PROJECT_LEAD"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_PROJECT_OWNER"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_PROJECT_USER_UNIQUE"`);
    await queryRunner.query(`DROP INDEX "public"."idx_target_sector_unique"`);
    await queryRunner.query(`DROP INDEX "public"."idx_project_company_unique"`);
    await queryRunner.query(
      `ALTER TABLE "projects_users" ALTER COLUMN "user_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" ALTER COLUMN "project_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_PROJECT_LEAD" ON "projects_users" ("is_lead", "project_id") WHERE (is_lead = true)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_PROJECT_OWNER" ON "projects_users" ("is_owner", "project_id") WHERE (is_owner = true)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_PROJECT_USER_UNIQUE" ON "projects_users" ("project_id", "user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" ADD CONSTRAINT "fk_project_user_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" ADD CONSTRAINT "fk_project_user_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ALTER COLUMN "company_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ALTER COLUMN "project_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_target_sector_unique" ON "targets_sectors" ("company_id", "project_id", "sector_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ADD CONSTRAINT "fk_target_sector_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ADD CONSTRAINT "fk_target_sector_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" ALTER COLUMN "company_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" ALTER COLUMN "project_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_project_company_unique" ON "projects_targets" ("company_id", "project_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" ADD CONSTRAINT "fk_project_target_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" ADD CONSTRAINT "fk_project_target_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
