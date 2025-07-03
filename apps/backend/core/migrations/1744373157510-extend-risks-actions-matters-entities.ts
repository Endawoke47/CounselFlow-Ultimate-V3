import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendRisksActionsMattersEntities1744373157510
  implements MigrationInterface
{
  name = 'ExtendRisksActionsMattersEntities1744373157510';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "action_dependencies" ("action_id" uuid NOT NULL, "dependency_id" uuid NOT NULL, CONSTRAINT "PK_a065a81cff2d8972317acfe024b" PRIMARY KEY ("action_id", "dependency_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fe17eb82abaa305d8cfb5e8cf2" ON "action_dependencies" ("action_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4190abf3a4a9c158c003212994" ON "action_dependencies" ("dependency_id") `,
    );
    await queryRunner.query(`ALTER TABLE "risks" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "entities" ADD "shareholders_info" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "entities" ADD "directors_info" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "entities" ADD "status" character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "entities" ADD "jurisdiction_of_incorporation" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "entities" ADD "incorporation_date" date`,
    );
    await queryRunner.query(
      `ALTER TABLE "entities" ADD "tax_id" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "entities" ADD "business_reg_number" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "entities" ADD "registered_address" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "entities" ADD "industry_sector" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "entities" ADD "fiscal_year_end" date`,
    );
    await queryRunner.query(
      `ALTER TABLE "entities" ADD "reporting_currency" character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "entities" ADD "regulatory_bodies" text array`,
    );
    await queryRunner.query(`ALTER TABLE "entities" ADD "notes" text`);
    await queryRunner.query(`ALTER TABLE "entities" ADD "created_by" integer`);
    await queryRunner.query(
      `ALTER TABLE "matters" ADD "type" character varying(50) NOT NULL DEFAULT 'General'`,
    );
    await queryRunner.query(
      `ALTER TABLE "matters" ADD "subtype" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "matters" ADD "status" character varying(50) NOT NULL DEFAULT 'Open'`,
    );
    await queryRunner.query(
      `ALTER TABLE "matters" ADD "priority" character varying(20)`,
    );
    await queryRunner.query(`ALTER TABLE "matters" ADD "key_dates" jsonb`);
    await queryRunner.query(`ALTER TABLE "matters" ADD "entity_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "risks" ADD "matter_type" character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ADD "title" character varying(255) DEFAULT 'Unknown Title' NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ADD "category" character varying(100) NOT NULL DEFAULT 'Uncategorized'`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ADD "inherent_likelihood" character varying(20) NOT NULL DEFAULT 'Medium'`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ADD "financial_impact_min" numeric(15,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ADD "financial_impact_max" numeric(15,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ADD "currency" character varying(10)`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ADD "priority" character varying(20) NOT NULL DEFAULT 'Medium'`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ADD "tolerance" character varying(20) NOT NULL DEFAULT 'Medium'`,
    );
    await queryRunner.query(`ALTER TABLE "risks" ADD "mitigation_plan" text`);
    await queryRunner.query(
      `ALTER TABLE "risks" ADD "mitigation_status" character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ADD "internal_department_code" character varying(50)`,
    );
    await queryRunner.query(`ALTER TABLE "risks" ADD "document_access" text`);
    await queryRunner.query(`ALTER TABLE "risks" ADD "document_links" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "risks" ADD "reputational_assessment" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ADD "identification_date" date NOT NULL DEFAULT ('now'::text)::date`,
    );
    await queryRunner.query(`ALTER TABLE "risks" ADD "review_date" date`);
    await queryRunner.query(`ALTER TABLE "risks" ADD "resolution_date" date`);
    await queryRunner.query(
      `ALTER TABLE "risks" ADD "regulatory_implications" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ADD "related_regulations" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ADD "status" character varying(50) NOT NULL DEFAULT 'Open'`,
    );
    await queryRunner.query(`ALTER TABLE "risks" ADD "notes" text`);
    await queryRunner.query(`ALTER TABLE "risks" ADD "matter_id" integer`);
    await queryRunner.query(`ALTER TABLE "risks" ADD "owner_id" integer`);
    await queryRunner.query(
      `CREATE TYPE "public"."actions_type_enum" AS ENUM('Task', 'Approval', 'Review', 'Meeting', 'Decision', 'Other')`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions" ADD "type" "public"."actions_type_enum" NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."actions_status_enum" AS ENUM('Not Started', 'In Progress', 'On Hold', 'Completed', 'Blocked', 'Pending', 'Overdue')`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions" ADD "status" "public"."actions_status_enum" NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."actions_priority_enum" AS ENUM('Low', 'Medium', 'High', 'Critical')`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions" ADD "priority" "public"."actions_priority_enum" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions" ADD "start_date" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions" ADD "due_date" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions" ADD "completion_date" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions" ADD "recurring" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions" ADD "recurrence_pattern" text`,
    );
    await queryRunner.query(`ALTER TABLE "actions" ADD "notes" text`);
    await queryRunner.query(`ALTER TABLE "actions" ADD "sub_tasks" jsonb`);
    await queryRunner.query(`ALTER TABLE "actions" ADD "attachments" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "actions" ADD "reminder_settings" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions" ADD "matter_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions" ADD "assigned_to_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ALTER COLUMN "description" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions" DROP CONSTRAINT "PK_7bfb822f56be449c0b8adbf83cf"`,
    );
    await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "actions" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions" ADD CONSTRAINT "PK_7bfb822f56be449c0b8adbf83cf" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN "title"`);
    await queryRunner.query(`ALTER TABLE "actions" ADD "title" text NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "actions" ALTER COLUMN "description" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "entities" ADD CONSTRAINT "FK_5f19e0a2ab7ec5611e7b6815749" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "matters" ADD CONSTRAINT "FK_c77849ec3a685e017d365bbb01d" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ADD CONSTRAINT "FK_aa175c22ddbe89a5372ba11567a" FOREIGN KEY ("matter_id") REFERENCES "matters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ADD CONSTRAINT "FK_a8ca14b19ef074dca2ca4a7d960" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions" ADD CONSTRAINT "FK_258944662bcaae59e4ae45ec4b0" FOREIGN KEY ("matter_id") REFERENCES "matters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions" ADD CONSTRAINT "FK_95f56efe0c0f6dda16165a13887" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_dependencies" ADD CONSTRAINT "FK_fe17eb82abaa305d8cfb5e8cf28" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_dependencies" ADD CONSTRAINT "FK_4190abf3a4a9c158c003212994a" FOREIGN KEY ("dependency_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `UPDATE "matters" SET "entity_id" = (SELECT MIN(id) FROM "entities") WHERE "entity_id" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "matters" ALTER COLUMN "entity_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "risks" SET "matter_id" = (SELECT MIN(id) FROM "matters") WHERE "matter_id" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ALTER COLUMN "matter_id" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "matters" ALTER COLUMN "entity_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ALTER COLUMN "matter_id" DROP NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "action_dependencies" DROP CONSTRAINT "FK_4190abf3a4a9c158c003212994a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_dependencies" DROP CONSTRAINT "FK_fe17eb82abaa305d8cfb5e8cf28"`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions" DROP CONSTRAINT "FK_95f56efe0c0f6dda16165a13887"`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions" DROP CONSTRAINT "FK_258944662bcaae59e4ae45ec4b0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" DROP CONSTRAINT "FK_a8ca14b19ef074dca2ca4a7d960"`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" DROP CONSTRAINT "FK_aa175c22ddbe89a5372ba11567a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "matters" DROP CONSTRAINT "FK_c77849ec3a685e017d365bbb01d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entities" DROP CONSTRAINT "FK_5f19e0a2ab7ec5611e7b6815749"`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions" ALTER COLUMN "description" DROP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN "title"`);
    await queryRunner.query(
      `ALTER TABLE "actions" ADD "title" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions" DROP CONSTRAINT "PK_7bfb822f56be449c0b8adbf83cf"`,
    );
    await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "actions" ADD "id" SERIAL NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "actions" ADD CONSTRAINT "PK_7bfb822f56be449c0b8adbf83cf" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ALTER COLUMN "description" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "actions" DROP COLUMN "assigned_to_id"`,
    );
    await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN "matter_id"`);
    await queryRunner.query(
      `ALTER TABLE "actions" DROP COLUMN "reminder_settings"`,
    );
    await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN "attachments"`);
    await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN "sub_tasks"`);
    await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN "notes"`);
    await queryRunner.query(
      `ALTER TABLE "actions" DROP COLUMN "recurrence_pattern"`,
    );
    await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN "recurring"`);
    await queryRunner.query(
      `ALTER TABLE "actions" DROP COLUMN "completion_date"`,
    );
    await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN "due_date"`);
    await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN "start_date"`);
    await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN "priority"`);
    await queryRunner.query(`DROP TYPE "public"."actions_priority_enum"`);
    await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."actions_status_enum"`);
    await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."actions_type_enum"`);
    await queryRunner.query(`ALTER TABLE "risks" DROP COLUMN "owner_id"`);
    await queryRunner.query(`ALTER TABLE "risks" DROP COLUMN "matter_id"`);
    await queryRunner.query(`ALTER TABLE "risks" DROP COLUMN "notes"`);
    await queryRunner.query(`ALTER TABLE "risks" DROP COLUMN "status"`);
    await queryRunner.query(
      `ALTER TABLE "risks" DROP COLUMN "related_regulations"`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" DROP COLUMN "regulatory_implications"`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" DROP COLUMN "resolution_date"`,
    );
    await queryRunner.query(`ALTER TABLE "risks" DROP COLUMN "review_date"`);
    await queryRunner.query(
      `ALTER TABLE "risks" DROP COLUMN "identification_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" DROP COLUMN "reputational_assessment"`,
    );
    await queryRunner.query(`ALTER TABLE "risks" DROP COLUMN "document_links"`);
    await queryRunner.query(
      `ALTER TABLE "risks" DROP COLUMN "document_access"`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" DROP COLUMN "internal_department_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" DROP COLUMN "mitigation_status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" DROP COLUMN "mitigation_plan"`,
    );
    await queryRunner.query(`ALTER TABLE "risks" DROP COLUMN "tolerance"`);
    await queryRunner.query(`ALTER TABLE "risks" DROP COLUMN "priority"`);
    await queryRunner.query(`ALTER TABLE "risks" DROP COLUMN "currency"`);
    await queryRunner.query(
      `ALTER TABLE "risks" DROP COLUMN "financial_impact_max"`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" DROP COLUMN "financial_impact_min"`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" DROP COLUMN "inherent_likelihood"`,
    );
    await queryRunner.query(`ALTER TABLE "risks" DROP COLUMN "category"`);
    await queryRunner.query(`ALTER TABLE "risks" DROP COLUMN "title"`);
    await queryRunner.query(`ALTER TABLE "risks" DROP COLUMN "matter_type"`);
    await queryRunner.query(`ALTER TABLE "matters" DROP COLUMN "entity_id"`);
    await queryRunner.query(`ALTER TABLE "matters" DROP COLUMN "key_dates"`);
    await queryRunner.query(`ALTER TABLE "matters" DROP COLUMN "priority"`);
    await queryRunner.query(`ALTER TABLE "matters" DROP COLUMN "status"`);
    await queryRunner.query(`ALTER TABLE "matters" DROP COLUMN "subtype"`);
    await queryRunner.query(`ALTER TABLE "matters" DROP COLUMN "type"`);
    await queryRunner.query(`ALTER TABLE "entities" DROP COLUMN "created_by"`);
    await queryRunner.query(`ALTER TABLE "entities" DROP COLUMN "notes"`);
    await queryRunner.query(
      `ALTER TABLE "entities" DROP COLUMN "regulatory_bodies"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entities" DROP COLUMN "reporting_currency"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entities" DROP COLUMN "fiscal_year_end"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entities" DROP COLUMN "industry_sector"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entities" DROP COLUMN "registered_address"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entities" DROP COLUMN "business_reg_number"`,
    );
    await queryRunner.query(`ALTER TABLE "entities" DROP COLUMN "tax_id"`);
    await queryRunner.query(
      `ALTER TABLE "entities" DROP COLUMN "incorporation_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entities" DROP COLUMN "jurisdiction_of_incorporation"`,
    );
    await queryRunner.query(`ALTER TABLE "entities" DROP COLUMN "status"`);
    await queryRunner.query(
      `ALTER TABLE "entities" DROP COLUMN "directors_info"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entities" DROP COLUMN "shareholders_info"`,
    );
    await queryRunner.query(
      `ALTER TABLE "risks" ADD "name" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4190abf3a4a9c158c003212994"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fe17eb82abaa305d8cfb5e8cf2"`,
    );
    await queryRunner.query(`DROP TABLE "action_dependencies"`);
  }
}
