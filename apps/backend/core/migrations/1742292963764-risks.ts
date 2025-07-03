import { MigrationInterface, QueryRunner } from 'typeorm';

export class Risks1742292963764 implements MigrationInterface {
  name = 'Risks1742292963764';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects_targets" DROP CONSTRAINT "fk_projects_targets_company"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" DROP CONSTRAINT "fk_projects_targets_project"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_52e1c2b4927c6f9329845eb265"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d2befe9caad0fe0ca32f247b1e"`,
    );
    await queryRunner.query(
      `CREATE TABLE "comments" ("id" SERIAL NOT NULL, "comment_text" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "due_date_options" ("id" SERIAL NOT NULL, "option_value" character varying(255) NOT NULL, "user_id" integer, CONSTRAINT "PK_beed55945e1e2afa721c2504cc5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `INSERT INTO "due_date_options" ("option_value") VALUES 
        ('Pre Signing'),
        ('Pre Completion'),
        ('Post Completion'),
        ('Conditions Precedent')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."recommendations_recommendation_enum" AS ENUM('Price Adjustment', 'Warranty / Representation', 'Indemnity', 'Condition Precedent', 'Deal-Breaker', 'Condition Subsequent', 'Tidy-Up')`,
    );
    await queryRunner.query(
      `CREATE TABLE "recommendations" ("id" SERIAL NOT NULL, "recommendation" "public"."recommendations_recommendation_enum" NOT NULL, "details" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "risk_id" integer, "due_date_option_id" integer, "created_by" integer, CONSTRAINT "PK_23a8d2db26db8cabb6ae9d6cd87" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."risks_risk_status_enum" AS ENUM('Draft', 'Pending Approval', 'Published')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."risks_risk_rating_enum" AS ENUM('High', 'Medium', 'Low')`,
    );
    await queryRunner.query(
      `CREATE TABLE "risks" ("id" SERIAL NOT NULL, "risk_identifier" character varying(255) NOT NULL, "title" character varying(255) NOT NULL, "description" text, "risk_status" "public"."risks_risk_status_enum" NOT NULL DEFAULT 'Draft', "risk_rating" "public"."risks_risk_rating_enum" NOT NULL DEFAULT 'Medium', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "project_target_id" integer, "created_by" integer, "assigned_to" integer, CONSTRAINT "UQ_3d76fd69f1f48fc048aef4cbe4b" UNIQUE ("risk_identifier"), CONSTRAINT "PK_df437126f5dd05e856b8bf7157f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "risks_categories" ("risk_id" integer NOT NULL, "category_id" integer NOT NULL, CONSTRAINT "PK_440076535615ae505bbc6b1c2dd" PRIMARY KEY ("risk_id", "category_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_69ab6825e78321668b4f8e5530" ON "risks_categories" ("risk_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_65eeecbbc330c4430bc204b0c7" ON "risks_categories" ("category_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "risks_comments" ("risk_id" integer NOT NULL, "comment_id" integer NOT NULL, CONSTRAINT "PK_ba160d1646f5d1d828800bb48fd" PRIMARY KEY ("risk_id", "comment_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e233a9fe08eb8690be46a5fadb" ON "risks_comments" ("risk_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1a83aa96c997b0164703238700" ON "risks_comments" ("comment_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" ADD "id" SERIAL NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" DROP CONSTRAINT "PK_1e5c1dfd3f85bf130a13b0ea119"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" ADD CONSTRAINT "PK_5019ad302a3f57e882b296272f7" PRIMARY KEY ("project_id", "company_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" DROP CONSTRAINT "PK_5019ad302a3f57e882b296272f7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" ADD CONSTRAINT "PK_ab85ac45ac368ce038b62fffbee" PRIMARY KEY ("company_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" DROP CONSTRAINT "PK_ab85ac45ac368ce038b62fffbee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" ADD CONSTRAINT "PK_75795d3da168e767a72e83df15f" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_project_company_unique" ON "projects_targets" ("project_id", "company_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" ADD CONSTRAINT "fk_project_target_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" ADD CONSTRAINT "fk_project_target_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" ADD CONSTRAINT "fk_comment_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "due_date_options" ADD CONSTRAINT "fk_due_date_option_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "recommendations" ADD CONSTRAINT "fk_recommendation_risk" FOREIGN KEY ("risk_id") REFERENCES "risks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "recommendations" ADD CONSTRAINT "fk_recommendation_due_date_option" FOREIGN KEY ("due_date_option_id") REFERENCES "due_date_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "recommendations" ADD CONSTRAINT "fk_recommendation_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ADD CONSTRAINT "fk_risk_project_target" FOREIGN KEY ("project_target_id") REFERENCES "projects_targets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ADD CONSTRAINT "fk_risk_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ADD CONSTRAINT "fk_risk_assigned_to" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks_categories" ADD CONSTRAINT "fk_risks_categories_risk" FOREIGN KEY ("risk_id") REFERENCES "risks"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks_categories" ADD CONSTRAINT "fk_risks_categories_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks_comments" ADD CONSTRAINT "fk_risks_comments_risk" FOREIGN KEY ("risk_id") REFERENCES "risks"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks_comments" ADD CONSTRAINT "fk_risks_comments_comment" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "risks_comments" DROP CONSTRAINT "fk_risks_comments_comment"`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks_comments" DROP CONSTRAINT "fk_risks_comments_risk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks_categories" DROP CONSTRAINT "fk_risks_categories_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks_categories" DROP CONSTRAINT "fk_risks_categories_risk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" DROP CONSTRAINT "fk_risk_assigned_to"`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" DROP CONSTRAINT "fk_risk_created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" DROP CONSTRAINT "fk_risk_project_target"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recommendations" DROP CONSTRAINT "fk_recommendation_created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recommendations" DROP CONSTRAINT "fk_recommendation_due_date_option"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recommendations" DROP CONSTRAINT "fk_recommendation_risk"`,
    );
    await queryRunner.query(
      `ALTER TABLE "due_date_options" DROP CONSTRAINT "fk_due_date_option_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "comments" DROP CONSTRAINT "fk_comment_created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" DROP CONSTRAINT "fk_project_target_company"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" DROP CONSTRAINT "fk_project_target_project"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_project_company_unique"`);
    await queryRunner.query(
      `ALTER TABLE "projects_targets" DROP CONSTRAINT "PK_75795d3da168e767a72e83df15f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" ADD CONSTRAINT "PK_ab85ac45ac368ce038b62fffbee" PRIMARY KEY ("company_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" DROP CONSTRAINT "PK_ab85ac45ac368ce038b62fffbee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" ADD CONSTRAINT "PK_5019ad302a3f57e882b296272f7" PRIMARY KEY ("project_id", "company_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" DROP CONSTRAINT "PK_5019ad302a3f57e882b296272f7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" ADD CONSTRAINT "PK_1e5c1dfd3f85bf130a13b0ea119" PRIMARY KEY ("project_id", "company_id")`,
    );
    await queryRunner.query(`ALTER TABLE "projects_targets" DROP COLUMN "id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1a83aa96c997b0164703238700"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e233a9fe08eb8690be46a5fadb"`,
    );
    await queryRunner.query(`DROP TABLE "risks_comments"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_65eeecbbc330c4430bc204b0c7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_69ab6825e78321668b4f8e5530"`,
    );
    await queryRunner.query(`DROP TABLE "risks_categories"`);
    await queryRunner.query(`DROP TABLE "risks"`);
    await queryRunner.query(`DROP TYPE "public"."risks_risk_rating_enum"`);
    await queryRunner.query(`DROP TYPE "public"."risks_risk_status_enum"`);
    await queryRunner.query(`DROP TABLE "recommendations"`);
    await queryRunner.query(
      `DROP TYPE "public"."recommendations_recommendation_enum"`,
    );
    await queryRunner.query(`DROP TABLE "due_date_options"`);
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_d2befe9caad0fe0ca32f247b1e" ON "projects_targets" ("company_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_52e1c2b4927c6f9329845eb265" ON "projects_targets" ("project_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" ADD CONSTRAINT "fk_projects_targets_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_targets" ADD CONSTRAINT "fk_projects_targets_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
