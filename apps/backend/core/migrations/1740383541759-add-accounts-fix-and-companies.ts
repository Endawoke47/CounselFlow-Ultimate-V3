import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccountsAndFixCompanies1740383541759
  implements MigrationInterface
{
  name = 'AddAccountsAndFixCompanies1740383541759';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project_companies" DROP CONSTRAINT "FK_e5748d1454b3a25b3f91473dfd8"`,
    );
    await queryRunner.query(`DROP INDEX "public"."categories_pkey"`);
    await queryRunner.query(`DROP INDEX "public"."sectors_pkey"`);
    await queryRunner.query(
      `CREATE TABLE "accounts" ("id" SERIAL NOT NULL, "organization_type" character varying(250) NOT NULL, "owner_company_id" integer, CONSTRAINT "REL_b8607ec20e9c5db96b8eb45711" UNIQUE ("owner_company_id"), CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "accounts_pkey" ON "accounts" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "companies_categories_categories" ("companiesId" integer NOT NULL, "categoriesId" integer NOT NULL, CONSTRAINT "PK_815debd801ef621478da65df902" PRIMARY KEY ("companiesId", "categoriesId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_63040136fd92a59e8f6e367797" ON "companies_categories_categories" ("companiesId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6dbec7d8c65f2c66fafe390e8d" ON "companies_categories_categories" ("categoriesId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "companies_sectors_sectors" ("companiesId" integer NOT NULL, "sectorsId" integer NOT NULL, CONSTRAINT "PK_dd2306a5cac805758f195a6fa94" PRIMARY KEY ("companiesId", "sectorsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a75eb65481100548990e93c5dd" ON "companies_sectors_sectors" ("companiesId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_968d9fa2caa73f181bd920178c" ON "companies_sectors_sectors" ("sectorsId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "companies_accounts_accounts" ("companiesId" integer NOT NULL, "accountsId" integer NOT NULL, CONSTRAINT "PK_2a19b7d266d8df6f91a88fd50fe" PRIMARY KEY ("companiesId", "accountsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4d475882219e46e9bf3a979270" ON "companies_accounts_accounts" ("companiesId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4b388f704a0379a93e7607b67d" ON "companies_accounts_accounts" ("accountsId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "project_companies" DROP COLUMN "company_id"`,
    );
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name")`,
    );
    await queryRunner.query(`ALTER TABLE "sectors" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "sectors" ADD "name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sectors" ADD CONSTRAINT "UQ_1a10b192342e5165948f4dccefc" UNIQUE ("name")`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "FK_b8607ec20e9c5db96b8eb457111" FOREIGN KEY ("owner_company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_categories_categories" ADD CONSTRAINT "FK_63040136fd92a59e8f6e3677979" FOREIGN KEY ("companiesId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_categories_categories" ADD CONSTRAINT "FK_6dbec7d8c65f2c66fafe390e8d6" FOREIGN KEY ("categoriesId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_sectors_sectors" ADD CONSTRAINT "FK_a75eb65481100548990e93c5dd8" FOREIGN KEY ("companiesId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_sectors_sectors" ADD CONSTRAINT "FK_968d9fa2caa73f181bd920178cd" FOREIGN KEY ("sectorsId") REFERENCES "sectors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts_accounts" ADD CONSTRAINT "FK_4d475882219e46e9bf3a979270f" FOREIGN KEY ("companiesId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts_accounts" ADD CONSTRAINT "FK_4b388f704a0379a93e7607b67d5" FOREIGN KEY ("accountsId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "companies_accounts_accounts" DROP CONSTRAINT "FK_4b388f704a0379a93e7607b67d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts_accounts" DROP CONSTRAINT "FK_4d475882219e46e9bf3a979270f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_sectors_sectors" DROP CONSTRAINT "FK_968d9fa2caa73f181bd920178cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_sectors_sectors" DROP CONSTRAINT "FK_a75eb65481100548990e93c5dd8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_categories_categories" DROP CONSTRAINT "FK_6dbec7d8c65f2c66fafe390e8d6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_categories_categories" DROP CONSTRAINT "FK_63040136fd92a59e8f6e3677979"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "FK_b8607ec20e9c5db96b8eb457111"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sectors" DROP CONSTRAINT "UQ_1a10b192342e5165948f4dccefc"`,
    );
    await queryRunner.query(`ALTER TABLE "sectors" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "sectors" ADD "name" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878"`,
    );
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "name" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_companies" ADD "company_id" integer`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4b388f704a0379a93e7607b67d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4d475882219e46e9bf3a979270"`,
    );
    await queryRunner.query(`DROP TABLE "companies_accounts_accounts"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_968d9fa2caa73f181bd920178c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a75eb65481100548990e93c5dd"`,
    );
    await queryRunner.query(`DROP TABLE "companies_sectors_sectors"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6dbec7d8c65f2c66fafe390e8d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_63040136fd92a59e8f6e367797"`,
    );
    await queryRunner.query(`DROP TABLE "companies_categories_categories"`);
    await queryRunner.query(`DROP INDEX "public"."accounts_pkey"`);
    await queryRunner.query(`DROP TABLE "accounts"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "sectors_pkey" ON "sectors" ("id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "categories_pkey" ON "categories" ("id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "project_companies" ADD CONSTRAINT "FK_e5748d1454b3a25b3f91473dfd8" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
