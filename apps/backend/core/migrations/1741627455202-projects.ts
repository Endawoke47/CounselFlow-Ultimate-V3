import { MigrationInterface, QueryRunner } from 'typeorm';

export class Projects1741627455202 implements MigrationInterface {
  name = 'Projects1741627455202';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "projects_users" ("project_id" integer NOT NULL, "user_id" integer NOT NULL, "is_lead" boolean NOT NULL DEFAULT false, "is_owner" boolean NOT NULL DEFAULT false, "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_2bdf8b14b34ac191f9fa6c67672" PRIMARY KEY ("project_id", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_PROJECT_OWNER" ON "projects_users" ("project_id", "is_owner") WHERE is_owner = true`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_PROJECT_LEAD" ON "projects_users" ("project_id", "is_lead") WHERE is_lead = true`,
    );
    await queryRunner.query(
      `CREATE TABLE "targets_categories" ("project_id" integer NOT NULL, "company_id" integer NOT NULL, "category_id" integer NOT NULL, "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_7ebd90a898cd59a6bfc99fa4539" PRIMARY KEY ("project_id", "company_id", "category_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "targets_sectors" ("project_id" integer NOT NULL, "company_id" integer NOT NULL, "sector_id" integer NOT NULL, "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_2e774f9cd2d66ecc6fb9c586109" PRIMARY KEY ("project_id", "company_id", "sector_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "projects" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "matter_number" character varying(20), "description" text, "identifier_color" character varying(7), "image_path" character varying(255), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "projects_categories" ("project_id" integer NOT NULL, "category_id" integer NOT NULL, CONSTRAINT "PK_6c943ec45ccc7b3a1eee414d1f7" PRIMARY KEY ("project_id", "category_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ff3d4df9702acb4d5a4a1d963c" ON "projects_categories" ("project_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4a0578a6a3cb1c1758d9bd5e3a" ON "projects_categories" ("category_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "projects_clients" ("project_id" integer NOT NULL, "company_id" integer NOT NULL, CONSTRAINT "PK_70280343a530d7a6550c8e25403" PRIMARY KEY ("project_id", "company_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_53f02c80b1fa478c6a22a34ef6" ON "projects_clients" ("project_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1e9fa6d3e40c97c462bc4f5662" ON "projects_clients" ("company_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "projects_targets" ("project_id" integer NOT NULL, "company_id" integer NOT NULL, CONSTRAINT "PK_1e5c1dfd3f85bf130a13b0ea119" PRIMARY KEY ("project_id", "company_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_52e1c2b4927c6f9329845eb265" ON "projects_targets" ("project_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d2befe9caad0fe0ca32f247b1e" ON "projects_targets" ("company_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "number" character varying(255)`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "companies"."number" IS 'Company number, e.g. client number'`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ALTER COLUMN "address" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" ADD CONSTRAINT "fk_project_user_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" ADD CONSTRAINT "fk_project_user_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" ADD CONSTRAINT "fk_target_category_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" ADD CONSTRAINT "fk_target_category_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" ADD CONSTRAINT "fk_target_category_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ADD CONSTRAINT "fk_target_sector_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ADD CONSTRAINT "fk_target_sector_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ADD CONSTRAINT "fk_target_sector_sector" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "fk_project_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_categories" ADD CONSTRAINT "fk_projects_categories_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_categories" ADD CONSTRAINT "fk_projects_categories_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_clients" ADD CONSTRAINT "fk_projects_clients_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_clients" ADD CONSTRAINT "fk_projects_clients_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" ADD CONSTRAINT "fk_projects_targets_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" ADD CONSTRAINT "fk_projects_targets_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects_targets" DROP CONSTRAINT "fk_projects_targets_company"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" DROP CONSTRAINT "fk_projects_targets_project"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_clients" DROP CONSTRAINT "fk_projects_clients_company"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_clients" DROP CONSTRAINT "fk_projects_clients_project"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_categories" DROP CONSTRAINT "fk_projects_categories_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_categories" DROP CONSTRAINT "fk_projects_categories_project"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "fk_project_created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" DROP CONSTRAINT "fk_target_sector_sector"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" DROP CONSTRAINT "fk_target_sector_company"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" DROP CONSTRAINT "fk_target_sector_project"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" DROP CONSTRAINT "fk_target_category_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" DROP CONSTRAINT "fk_target_category_company"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" DROP CONSTRAINT "fk_target_category_project"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" DROP CONSTRAINT "fk_project_user_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" DROP CONSTRAINT "fk_project_user_project"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ALTER COLUMN "address" SET NOT NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "companies"."number" IS 'Company number, e.g. client number'`,
    );
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "number"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d2befe9caad0fe0ca32f247b1e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_52e1c2b4927c6f9329845eb265"`,
    );
    await queryRunner.query(`DROP TABLE "projects_targets"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1e9fa6d3e40c97c462bc4f5662"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_53f02c80b1fa478c6a22a34ef6"`,
    );
    await queryRunner.query(`DROP TABLE "projects_clients"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4a0578a6a3cb1c1758d9bd5e3a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ff3d4df9702acb4d5a4a1d963c"`,
    );
    await queryRunner.query(`DROP TABLE "projects_categories"`);
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP TABLE "targets_sectors"`);
    await queryRunner.query(`DROP TABLE "targets_categories"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_PROJECT_LEAD"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_PROJECT_OWNER"`);
    await queryRunner.query(`DROP TABLE "projects_users"`);
  }
}
