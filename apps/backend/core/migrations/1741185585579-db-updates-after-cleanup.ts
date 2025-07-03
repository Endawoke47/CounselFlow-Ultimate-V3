import { MigrationInterface, QueryRunner } from 'typeorm';

export class DbUpdatesAfterCleanup1741185585579 implements MigrationInterface {
  name = 'DbUpdatesAfterCleanup1741185585579';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop redundant indexes on primary keys
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."accounts_pkey"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."states_pkey"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."cities_pkey"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."countries_pkey"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."companies_pkey"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."users_pkey"`);

    await queryRunner.query(
      `CREATE TABLE "companies_categories" ("companiesId" integer NOT NULL, "categoriesId" integer NOT NULL, CONSTRAINT "PK_7ee03d1617c50467256f71bbb1d" PRIMARY KEY ("companiesId", "categoriesId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6bcb36a0a763c9c0523bc2694a" ON "companies_categories" ("companiesId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0045a1cb8ea2e81fbb09b0750a" ON "companies_categories" ("categoriesId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "companies_sectors" ("companiesId" integer NOT NULL, "sectorsId" integer NOT NULL, CONSTRAINT "PK_540c0bd01ece7e7768e746bd5a3" PRIMARY KEY ("companiesId", "sectorsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4b31a532331d04c184d620c8cb" ON "companies_sectors" ("companiesId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1c3c968be80cdfb3a5457f8950" ON "companies_sectors" ("sectorsId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "companies_accounts" ("companiesId" integer NOT NULL, "accountsId" integer NOT NULL, CONSTRAINT "PK_f8c9a0d7dac5858c15de7c0da42" PRIMARY KEY ("companiesId", "accountsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_91da8776be5a929317e7f62337" ON "companies_accounts" ("companiesId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_735944085c8df1986e4bc8f2a4" ON "companies_accounts" ("accountsId") `,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "entity"`);
    await queryRunner.query(
      `ALTER TABLE "companies_categories" ADD CONSTRAINT "FK_6bcb36a0a763c9c0523bc2694af" FOREIGN KEY ("companiesId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_categories" ADD CONSTRAINT "FK_0045a1cb8ea2e81fbb09b0750a6" FOREIGN KEY ("categoriesId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_sectors" ADD CONSTRAINT "FK_4b31a532331d04c184d620c8cb9" FOREIGN KEY ("companiesId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_sectors" ADD CONSTRAINT "FK_1c3c968be80cdfb3a5457f8950a" FOREIGN KEY ("sectorsId") REFERENCES "sectors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" ADD CONSTRAINT "FK_91da8776be5a929317e7f623378" FOREIGN KEY ("companiesId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" ADD CONSTRAINT "FK_735944085c8df1986e4bc8f2a41" FOREIGN KEY ("accountsId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // After creating new junction tables and setting up their foreign keys,
    // drop the old tables that are no longer needed
    await queryRunner.query(`DROP TABLE IF EXISTS "company_categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "company_sectors"`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "companies_accounts_accounts"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "companies_categories_categories"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "companies_sectors_sectors"`);

    // Drop any incorrectly named junction tables
    await queryRunner.query(
      `DROP TABLE IF EXISTS "companies_accounts_accounts"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "companies_categories_categories"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "companies_sectors_sectors"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "project_companies" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "project_teams" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "projects" CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" DROP CONSTRAINT "FK_735944085c8df1986e4bc8f2a41"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" DROP CONSTRAINT "FK_91da8776be5a929317e7f623378"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_sectors" DROP CONSTRAINT "FK_1c3c968be80cdfb3a5457f8950a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_sectors" DROP CONSTRAINT "FK_4b31a532331d04c184d620c8cb9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_categories" DROP CONSTRAINT "FK_0045a1cb8ea2e81fbb09b0750a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_categories" DROP CONSTRAINT "FK_6bcb36a0a763c9c0523bc2694af"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "entity" character varying(255)`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_735944085c8df1986e4bc8f2a4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_91da8776be5a929317e7f62337"`,
    );
    await queryRunner.query(`DROP TABLE "companies_accounts"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1c3c968be80cdfb3a5457f8950"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4b31a532331d04c184d620c8cb"`,
    );
    await queryRunner.query(`DROP TABLE "companies_sectors"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0045a1cb8ea2e81fbb09b0750a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6bcb36a0a763c9c0523bc2694a"`,
    );
    await queryRunner.query(`DROP TABLE "companies_categories"`);

    // Recreate the old tables that were dropped
    await queryRunner.query(
      `CREATE TABLE "company_categories" ("id" SERIAL NOT NULL, "category_id" integer, "company_id" integer, CONSTRAINT "PK_646863e09dfd590ceac68300b2c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "company_categories_pkey" ON "company_categories" ("id")`,
    );
    await queryRunner.query(
      `CREATE TABLE "company_sectors" ("id" SERIAL NOT NULL, "company_id" integer, "sector_id" integer, CONSTRAINT "PK_db8142add966d168598754888eb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "company_sectors_pkey" ON "company_sectors" ("id")`,
    );

    // Add foreign key constraints for the recreated tables
    await queryRunner.query(
      `ALTER TABLE "company_categories" ADD CONSTRAINT "FK_573ba4cbe7979a28df1af6ccf5f" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_categories" ADD CONSTRAINT "FK_6566c273a06368ae170905076bf" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_sectors" ADD CONSTRAINT "FK_0425a8393cec6c3163a5389cd9e" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_sectors" ADD CONSTRAINT "FK_35149927e74663fd4bbbb0e34a7" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Recreate companies_accounts table if it existed
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "companies_accounts" ("companiesId" integer NOT NULL, "accountsId" integer NOT NULL, CONSTRAINT "PK_companies_accounts" PRIMARY KEY ("companiesId", "accountsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_companies_accounts_companies" ON "companies_accounts" ("companiesId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_companies_accounts_accounts" ON "companies_accounts" ("accountsId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" ADD CONSTRAINT "FK_companies_accounts_companies" FOREIGN KEY ("companiesId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" ADD CONSTRAINT "FK_companies_accounts_accounts" FOREIGN KEY ("accountsId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Recreate project-related tables
    await queryRunner.query(
      `CREATE TYPE IF NOT EXISTS "public"."project_companies_type_enum" AS ENUM('CLIENT', 'TARGET')`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "projects" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "projects_pkey" ON "projects" ("id")`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "project_companies" ("id" SERIAL NOT NULL, "type" "public"."project_companies_type_enum" NOT NULL, "company_id" integer, "project_id" integer, CONSTRAINT "PK_e8f6df7e98cd797e89821f128e6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "project_companies_pkey" ON "project_companies" ("id")`,
    );
    await queryRunner.query(
      `CREATE TYPE IF NOT EXISTS "public"."project_teams_user_type_enum" AS ENUM('LAWYER', 'TARGET', 'CLIENT')`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "project_teams" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "project_id" integer NOT NULL, "role_id" integer NOT NULL, "user_type" "public"."project_teams_user_type_enum" NOT NULL, CONSTRAINT "PK_01a9679008fec32d42fe331ff10" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "project_teams_pkey" ON "project_teams" ("id")`,
    );

    // Add foreign key constraints for project-related tables
    await queryRunner.query(
      `ALTER TABLE "project_companies" ADD CONSTRAINT "FK_e5748d1454b3a25b3f91473dfd8" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_companies" ADD CONSTRAINT "FK_6d62b2cd707f3c231c78073216c" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    // Recreate the redundant indexes on primary keys if migration is rolled back
    await queryRunner.query(
      `CREATE UNIQUE INDEX "cities_pkey" ON "cities" ("id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "states_pkey" ON "states" ("id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "accounts_pkey" ON "accounts" ("id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "countries_pkey" ON "countries" ("id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "companies_pkey" ON "companies" ("id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "users_pkey" ON "users" ("id")`,
    );
  }
}
