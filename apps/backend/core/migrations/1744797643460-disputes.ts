import { MigrationInterface, QueryRunner } from 'typeorm';

export class Disputes1744797643460 implements MigrationInterface {
  name = 'Disputes1744797643460';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."dispute_claims_status_enum" AS ENUM('Active', 'Pending', 'Resolved', 'Dismissed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "dispute_claims" ("id" SERIAL NOT NULL, "claimType" character varying NOT NULL, "status" "public"."dispute_claims_status_enum" NOT NULL DEFAULT 'Pending', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "dispute_id" integer, "created_by_id" integer, CONSTRAINT "PK_fb0dbfc8cf41d07aac54a4c7f53" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."dispute_parties_role_enum" AS ENUM('Plaintiff', 'Defendant', 'Third Party', 'Witness', 'Expert')`,
    );
    await queryRunner.query(
      `CREATE TABLE "dispute_parties" ("id" SERIAL NOT NULL, "role" "public"."dispute_parties_role_enum" NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "dispute_id" integer, "company_id" integer, "created_by_id" integer, CONSTRAINT "PK_100ca23a38f3df066b04d3e54e1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."disputes_type_enum" AS ENUM('Litigation', 'Arbitration', 'Mediation')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."disputes_status_enum" AS ENUM('Pre-Filing', 'Filed', 'Discovery', 'Hearing/Trial', 'Settlement Discussions', 'Resolved', 'Appeal', 'Closed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."disputes_riskassessment_enum" AS ENUM('Very High', 'High', 'Medium', 'Low', 'Very Low')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."disputes_resolutiontype_enum" AS ENUM('Settlement', 'Judgment', 'Dismissal', 'Withdrawal', 'Other')`,
    );
    await queryRunner.query(
      `CREATE TABLE "disputes" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "type" "public"."disputes_type_enum" NOT NULL, "status" "public"."disputes_status_enum" NOT NULL DEFAULT 'Pre-Filing', "description" text, "jurisdiction" character varying, "filingDate" date, "keyDates" jsonb, "amountClaimed" numeric(15,2), "currency" character varying(10), "estimatedCost" numeric(15,2), "actualCost" numeric(15,2), "riskAssessment" "public"."disputes_riskassessment_enum", "resolutionType" "public"."disputes_resolutiontype_enum", "resolutionDate" date, "resolutionSummary" text, "notes" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "matter_id" integer, "initiating_company_id" integer, "lead_attorney_id" integer, "created_by" integer, CONSTRAINT "PK_3c97580d01c1a4b0b345c42a107" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "dispute_claims" ADD CONSTRAINT "FK_c1c50855b1c4fa9190e32a694e4" FOREIGN KEY ("dispute_id") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dispute_claims" ADD CONSTRAINT "FK_8786a2327566405c67f06bd119b" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dispute_parties" ADD CONSTRAINT "FK_3e989f9d6d73e01927043fd8dad" FOREIGN KEY ("dispute_id") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dispute_parties" ADD CONSTRAINT "FK_e2e7aab74da94691ceff239c12f" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "dispute_parties" ADD CONSTRAINT "FK_f224010f80bc99195617aee8447" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "disputes" ADD CONSTRAINT "FK_8afbd4528907cdc919b2c4ed1e1" FOREIGN KEY ("matter_id") REFERENCES "matters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "disputes" ADD CONSTRAINT "FK_3e73955f36628fbd5e48bb44225" FOREIGN KEY ("initiating_company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "disputes" ADD CONSTRAINT "FK_48a1fd7d3428d3a7ade81c5b5b8" FOREIGN KEY ("lead_attorney_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "disputes" ADD CONSTRAINT "FK_e42a833d66c8b5118dd8e9860b1" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "disputes" DROP CONSTRAINT "FK_e42a833d66c8b5118dd8e9860b1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "disputes" DROP CONSTRAINT "FK_48a1fd7d3428d3a7ade81c5b5b8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "disputes" DROP CONSTRAINT "FK_3e73955f36628fbd5e48bb44225"`,
    );
    await queryRunner.query(
      `ALTER TABLE "disputes" DROP CONSTRAINT "FK_8afbd4528907cdc919b2c4ed1e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dispute_parties" DROP CONSTRAINT "FK_f224010f80bc99195617aee8447"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dispute_parties" DROP CONSTRAINT "FK_e2e7aab74da94691ceff239c12f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dispute_parties" DROP CONSTRAINT "FK_3e989f9d6d73e01927043fd8dad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dispute_claims" DROP CONSTRAINT "FK_8786a2327566405c67f06bd119b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "dispute_claims" DROP CONSTRAINT "FK_c1c50855b1c4fa9190e32a694e4"`,
    );
    await queryRunner.query(`DROP TABLE "disputes"`);
    await queryRunner.query(
      `DROP TYPE "public"."disputes_resolutiontype_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."disputes_riskassessment_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."disputes_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."disputes_type_enum"`);
    await queryRunner.query(`DROP TABLE "dispute_parties"`);
    await queryRunner.query(`DROP TYPE "public"."dispute_parties_role_enum"`);
    await queryRunner.query(`DROP TABLE "dispute_claims"`);
    await queryRunner.query(`DROP TYPE "public"."dispute_claims_status_enum"`);
  }
}
