import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1744685981799 implements MigrationInterface {
  name = 'Migrations1744685981799';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "matters" DROP CONSTRAINT "FK_c77849ec3a685e017d365bbb01d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "matters" RENAME COLUMN "entity_id" TO "company_id"`,
    );
    await queryRunner.query(
      `CREATE TABLE "company_closure" ("ancestor_id" integer NOT NULL, "descendant_id" integer NOT NULL, CONSTRAINT "PK_a10ec32049608c433f51054eec0" PRIMARY KEY ("ancestor_id", "descendant_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d455d72c98ba288bd1916ceacf" ON "company_closure" ("ancestor_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3136010afba9ff56406acd755c" ON "company_closure" ("descendant_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "shareholders_info" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "directors_info" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "status" character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "jurisdiction_of_incorporation" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "incorporation_date" date`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "tax_id" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "business_reg_number" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "registered_address" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "industry_sector" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "fiscal_year_end" date`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "reporting_currency" character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "regulatory_bodies" text array`,
    );
    await queryRunner.query(`ALTER TABLE "companies" ADD "notes" text`);
    await queryRunner.query(`ALTER TABLE "companies" ADD "parentId" integer`);
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "FK_70df33feb9da86bcf0cfbf3a206" FOREIGN KEY ("parentId") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "matters" ADD CONSTRAINT "FK_7c4ed7342a237adb90bc89f9d2e" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_closure" ADD CONSTRAINT "FK_d455d72c98ba288bd1916ceacfd" FOREIGN KEY ("ancestor_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_closure" ADD CONSTRAINT "FK_3136010afba9ff56406acd755ca" FOREIGN KEY ("descendant_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "company_closure" DROP CONSTRAINT "FK_3136010afba9ff56406acd755ca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_closure" DROP CONSTRAINT "FK_d455d72c98ba288bd1916ceacfd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "matters" DROP CONSTRAINT "FK_7c4ed7342a237adb90bc89f9d2e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP CONSTRAINT "FK_70df33feb9da86bcf0cfbf3a206"`,
    );
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "parentId"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "notes"`);
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "regulatory_bodies"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "reporting_currency"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "fiscal_year_end"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "industry_sector"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "registered_address"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "business_reg_number"`,
    );
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "tax_id"`);
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "incorporation_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "jurisdiction_of_incorporation"`,
    );
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "status"`);
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "directors_info"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "shareholders_info"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3136010afba9ff56406acd755c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d455d72c98ba288bd1916ceacf"`,
    );
    await queryRunner.query(`DROP TABLE "company_closure"`);
    await queryRunner.query(
      `ALTER TABLE "matters" RENAME COLUMN "company_id" TO "entity_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "matters" ADD CONSTRAINT "FK_c77849ec3a685e017d365bbb01d" FOREIGN KEY ("entity_id") REFERENCES "entities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
