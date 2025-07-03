import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropRisksTable1743701702839 implements MigrationInterface {
  name = 'DropRisksTable1743701702839';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, let's check what tables exist
    const tables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('risks', 'risks_categories', 'risks_comments', 'recommendations', 'due_date_options')
    `);
    console.log('Existing tables before drop:', tables);

    // Drop foreign key constraints first, but only if they exist
    try {
      await queryRunner.query(
        `ALTER TABLE "risks_comments" DROP CONSTRAINT IF EXISTS "fk_risks_comments_comment"`,
      );
      await queryRunner.query(
        `ALTER TABLE "risks_comments" DROP CONSTRAINT IF EXISTS "fk_risks_comments_risk"`,
      );
      await queryRunner.query(
        `ALTER TABLE "risks_categories" DROP CONSTRAINT IF EXISTS "fk_risks_categories_category"`,
      );
      await queryRunner.query(
        `ALTER TABLE "risks_categories" DROP CONSTRAINT IF EXISTS "fk_risks_categories_risk"`,
      );
      await queryRunner.query(
        `ALTER TABLE "risks" DROP CONSTRAINT IF EXISTS "fk_risk_assigned_to"`,
      );
      await queryRunner.query(
        `ALTER TABLE "risks" DROP CONSTRAINT IF EXISTS "fk_risk_created_by"`,
      );
      await queryRunner.query(
        `ALTER TABLE "risks" DROP CONSTRAINT IF EXISTS "fk_risk_project_target"`,
      );
      await queryRunner.query(
        `ALTER TABLE "recommendations" DROP CONSTRAINT IF EXISTS "fk_recommendation_risk"`,
      );
    } catch (error) {
      console.log('Some constraints were already dropped, continuing...');
    }

    // Drop the tables if they exist
    try {
      await queryRunner.query(`DROP TABLE IF EXISTS "risks_comments" CASCADE`);
      await queryRunner.query(
        `DROP TABLE IF EXISTS "risks_categories" CASCADE`,
      );
      await queryRunner.query(`DROP TABLE IF EXISTS "risks" CASCADE`);
      await queryRunner.query(`DROP TABLE IF EXISTS "recommendations" CASCADE`);
      await queryRunner.query(
        `DROP TABLE IF EXISTS "due_date_options" CASCADE`,
      );
    } catch (error) {
      console.log('Some tables were already dropped, continuing...');
    }

    // Drop the enum types if they exist
    try {
      await queryRunner.query(
        `DROP TYPE IF EXISTS "public"."risks_risk_rating_enum" CASCADE`,
      );
      await queryRunner.query(
        `DROP TYPE IF EXISTS "public"."risks_risk_status_enum" CASCADE`,
      );
      await queryRunner.query(
        `DROP TYPE IF EXISTS "public"."recommendations_recommendation_enum" CASCADE`,
      );
    } catch (error) {
      console.log('Some enum types were already dropped, continuing...');
    }

    // Verify tables are dropped
    const remainingTables = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('risks', 'risks_categories', 'risks_comments', 'recommendations', 'due_date_options')
    `);
    console.log('Remaining tables after drop:', remainingTables);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate enum types
    await queryRunner.query(
      `CREATE TYPE "public"."risks_risk_status_enum" AS ENUM('Draft', 'Pending Approval', 'Published')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."risks_risk_rating_enum" AS ENUM('High', 'Medium', 'Low')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."recommendations_recommendation_enum" AS ENUM('Price Adjustment', 'Warranty / Representation', 'Indemnity', 'Condition Precedent', 'Deal-Breaker', 'Condition Subsequent', 'Tidy-Up')`,
    );

    // Recreate tables
    await queryRunner.query(
      `CREATE TABLE "due_date_options" ("id" SERIAL NOT NULL, "option_value" character varying(255) NOT NULL, "user_id" integer, CONSTRAINT "PK_beed55945e1e2afa721c2504cc5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "recommendations" ("id" SERIAL NOT NULL, "recommendation" "public"."recommendations_recommendation_enum" NOT NULL, "details" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "risk_id" integer, "due_date_option_id" integer, "created_by" integer, CONSTRAINT "PK_23a8d2db26db8cabb6ae9d6cd87" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "risks" ("id" SERIAL NOT NULL, "risk_identifier" character varying(255) NOT NULL, "title" character varying(255) NOT NULL, "description" text, "risk_status" "public"."risks_risk_status_enum" NOT NULL DEFAULT 'Draft', "risk_rating" "public"."risks_risk_rating_enum" NOT NULL DEFAULT 'Medium', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "project_target_id" integer, "created_by" integer, "assigned_to" integer, CONSTRAINT "UQ_3d76fd69f1f48fc048aef4cbe4b" UNIQUE ("risk_identifier"), CONSTRAINT "PK_df437126f5dd05e856b8bf7157f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "risks_categories" ("risk_id" integer NOT NULL, "category_id" integer NOT NULL, CONSTRAINT "PK_440076535615ae505bbc6b1c2dd" PRIMARY KEY ("risk_id", "category_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "risks_comments" ("risk_id" integer NOT NULL, "comment_id" integer NOT NULL, CONSTRAINT "PK_ba160d1646f5d1d828800bb48fd" PRIMARY KEY ("risk_id", "comment_id"))`,
    );

    // Recreate indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_69ab6825e78321668b4f8e5530" ON "risks_categories" ("risk_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_65eeecbbc330c4430bc204b0c7" ON "risks_categories" ("category_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e233a9fe08eb8690be46a5fadb" ON "risks_comments" ("risk_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1a83aa96c997b0164703238700" ON "risks_comments" ("comment_id") `,
    );

    // Recreate foreign key constraints
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
}
