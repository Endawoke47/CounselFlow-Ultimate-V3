import { MigrationInterface, QueryRunner } from 'typeorm';

export class Contracts1744720463741 implements MigrationInterface {
  name = 'Contracts1744720463741';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "contract_parties" ("id" SERIAL NOT NULL, "role" character varying NOT NULL, "signatory" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "contract_id" integer NOT NULL, "company_id" integer NOT NULL, "created_by" integer, CONSTRAINT "PK_9e508ab7f0492be169fb29dcc57" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."contracts_type_enum" AS ENUM('Sales', 'Procurement', 'Employment', 'Real Estate', 'Intellectual Property', 'Financial', 'Partnership', 'Confidentiality', 'Compliance', 'Other')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."contracts_status_enum" AS ENUM('Draft', 'Under Review', 'In Negotiation', 'Executed', 'Active', 'Expired', 'Terminated')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."contracts_priority_enum" AS ENUM('Critical', 'High', 'Medium', 'Low')`,
    );
    await queryRunner.query(
      `CREATE TABLE "contracts" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "type" "public"."contracts_type_enum" NOT NULL, "description" text, "status" "public"."contracts_status_enum" NOT NULL DEFAULT 'Draft', "priority" "public"."contracts_priority_enum" DEFAULT 'Medium', "counterpartyName" character varying, "effectiveDate" date, "executionDate" date, "expirationDate" date, "valueAmount" numeric(15,2), "valueCurrency" character varying(10), "paymentTerms" text, "documentId" integer, "notes" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "matter_id" integer, "owning_company_id" integer, "counterparty_id" integer, "internal_legal_owner_id" integer, "created_by" integer, CONSTRAINT "PK_2c7b8f3a7b1acdd49497d83d0fb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_parties" ADD CONSTRAINT "FK_b57a402b15f8ab3f56346f66dd1" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_parties" ADD CONSTRAINT "FK_8bc398e6056ee1c2aee1b595dc8" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_parties" ADD CONSTRAINT "FK_46e9a557441454d0b6d043b5b12" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" ADD CONSTRAINT "FK_1c4784fee849a13de61ea09ccb1" FOREIGN KEY ("matter_id") REFERENCES "matters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" ADD CONSTRAINT "FK_02636207375ec7fe3411ac843f7" FOREIGN KEY ("owning_company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" ADD CONSTRAINT "FK_4b8f0ccb5926cfeabea7c18b8e0" FOREIGN KEY ("counterparty_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" ADD CONSTRAINT "FK_312b4f0f3361ac3da021bf8ff58" FOREIGN KEY ("internal_legal_owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" ADD CONSTRAINT "FK_c0a3fac2a4731eabc427a4ad1b5" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contracts" DROP CONSTRAINT "FK_c0a3fac2a4731eabc427a4ad1b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" DROP CONSTRAINT "FK_312b4f0f3361ac3da021bf8ff58"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" DROP CONSTRAINT "FK_4b8f0ccb5926cfeabea7c18b8e0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" DROP CONSTRAINT "FK_02636207375ec7fe3411ac843f7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" DROP CONSTRAINT "FK_1c4784fee849a13de61ea09ccb1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_parties" DROP CONSTRAINT "FK_46e9a557441454d0b6d043b5b12"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_parties" DROP CONSTRAINT "FK_8bc398e6056ee1c2aee1b595dc8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_parties" DROP CONSTRAINT "FK_b57a402b15f8ab3f56346f66dd1"`,
    );
    await queryRunner.query(`DROP TABLE "contracts"`);
    await queryRunner.query(`DROP TYPE "public"."contracts_priority_enum"`);
    await queryRunner.query(`DROP TYPE "public"."contracts_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."contracts_type_enum"`);
    await queryRunner.query(`DROP TABLE "contract_parties"`);
  }
}
