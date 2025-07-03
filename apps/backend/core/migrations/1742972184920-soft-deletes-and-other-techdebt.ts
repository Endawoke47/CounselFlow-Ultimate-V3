import { MigrationInterface, QueryRunner } from 'typeorm';

export class SoftDeletesAndOtherTechdebt1742972184920
  implements MigrationInterface
{
  transaction?: boolean | undefined;
  name = 'SoftDeletesAndOtherTechdebt1742972184920';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First run direct queries to delete records with NULL names
    await queryRunner.query(`DELETE FROM countries WHERE name IS NULL`);
    await queryRunner.query(`DELETE FROM states WHERE name IS NULL`);
    await queryRunner.query(`DELETE FROM cities WHERE name IS NULL`);
    await queryRunner.query(`DELETE FROM categories WHERE name IS NULL`);
    await queryRunner.query(`DELETE FROM sectors WHERE name IS NULL`);

    // Now proceed with the migration
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" DROP CONSTRAINT "FK_735944085c8df1986e4bc8f2a41"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" DROP CONSTRAINT "FK_91da8776be5a929317e7f623378"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_91da8776be5a929317e7f62337"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_735944085c8df1986e4bc8f2a4"`,
    );
    await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "phonecode"`);
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" DROP CONSTRAINT "PK_f8c9a0d7dac5858c15de7c0da42"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" ADD CONSTRAINT "PK_735944085c8df1986e4bc8f2a41" PRIMARY KEY ("accountsId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" DROP COLUMN "companiesId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" DROP CONSTRAINT "PK_735944085c8df1986e4bc8f2a41"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" DROP COLUMN "accountsId"`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "created_by" integer`);
    await queryRunner.query(`ALTER TABLE "accounts" ADD "created_by" integer`);
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" ADD "id" SERIAL NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" ADD CONSTRAINT "PK_e5c0e2c81dfe82346a2376995f7" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."companies_accounts_companytype_enum" AS ENUM('ADMIN', 'LAWYER', 'LAWYER_CUSTOMER', 'LAWYER_OUTSOURCE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" ADD "companyType" "public"."companies_accounts_companytype_enum" NOT NULL DEFAULT 'ADMIN'`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" ADD "company_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" ADD "account_id" integer NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "companies" ADD "description" text`);
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "email" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "phone" character varying(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "website" character varying(255)`,
    );

    // For countries.name - ensure it appears right after id
    await queryRunner.query(
      `ALTER TABLE "countries" ADD "name_new" character varying(255)`,
    );
    await queryRunner.query(
      `UPDATE "countries" SET "name_new" = "name" WHERE "name" IS NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "countries" RENAME COLUMN "name_new" TO "name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "countries" ALTER COLUMN "name" SET NOT NULL`,
    );

    // For states.name - ensure it appears right after id
    await queryRunner.query(
      `ALTER TABLE "states" ADD "name_new" character varying(255)`,
    );
    await queryRunner.query(
      `UPDATE "states" SET "name_new" = "name" WHERE "name" IS NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "states" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "states" RENAME COLUMN "name_new" TO "name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "states" ALTER COLUMN "name" SET NOT NULL`,
    );

    // For cities.name - ensure it appears right after id
    await queryRunner.query(
      `ALTER TABLE "cities" ADD "name_new" character varying(255)`,
    );
    await queryRunner.query(
      `UPDATE "cities" SET "name_new" = "name" WHERE "name" IS NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "cities" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "cities" RENAME COLUMN "name_new" TO "name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cities" ALTER COLUMN "name" SET NOT NULL`,
    );

    // For categories.name
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "name_new" character varying(255)`,
    );
    await queryRunner.query(
      `UPDATE "categories" SET "name_new" = "name" WHERE "name" IS NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "categories" RENAME COLUMN "name_new" TO "name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ALTER COLUMN "name" SET NOT NULL`,
    );

    // For sectors.name
    await queryRunner.query(
      `ALTER TABLE "sectors" DROP CONSTRAINT "UQ_1a10b192342e5165948f4dccefc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sectors" ADD "name_new" character varying(255)`,
    );
    await queryRunner.query(
      `UPDATE "sectors" SET "name_new" = "name" WHERE "name" IS NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "sectors" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "sectors" RENAME COLUMN "name_new" TO "name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sectors" ALTER COLUMN "name" SET NOT NULL`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_COMPANY_ACCOUNT_UNIQUE" ON "companies_accounts" ("company_id", "account_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_f32b1cb14a9920477bcfd63df2c" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "fk_account_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" ADD CONSTRAINT "fk_company_account_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" ADD CONSTRAINT "fk_company_account_account" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" DROP CONSTRAINT "fk_company_account_account"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" DROP CONSTRAINT "fk_company_account_company"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "fk_account_created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_f32b1cb14a9920477bcfd63df2c"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_COMPANY_ACCOUNT_UNIQUE"`);
    await queryRunner.query(`ALTER TABLE "sectors" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "sectors" ADD "name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sectors" ADD CONSTRAINT "UQ_1a10b192342e5165948f4dccefc" UNIQUE ("name")`,
    );
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name")`,
    );
    await queryRunner.query(`ALTER TABLE "cities" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "cities" ADD "name" character varying(40) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "states" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "states" ADD "name" character varying(40) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "countries" ADD "name" character varying(150) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "website"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "phone"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "email"`);
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" DROP COLUMN "account_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" DROP COLUMN "company_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" DROP COLUMN "companyType"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."companies_accounts_companytype_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" DROP CONSTRAINT "PK_e5c0e2c81dfe82346a2376995f7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" DROP COLUMN "id"`,
    );
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "created_by"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_by"`);
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" ADD "accountsId" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" ADD CONSTRAINT "PK_735944085c8df1986e4bc8f2a41" PRIMARY KEY ("accountsId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" ADD "companiesId" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" DROP CONSTRAINT "PK_735944085c8df1986e4bc8f2a41"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" ADD CONSTRAINT "PK_f8c9a0d7dac5858c15de7c0da42" PRIMARY KEY ("companiesId", "accountsId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "countries" ADD "phonecode" integer NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_735944085c8df1986e4bc8f2a4" ON "companies_accounts" ("accountsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_91da8776be5a929317e7f62337" ON "companies_accounts" ("companiesId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" ADD CONSTRAINT "FK_91da8776be5a929317e7f623378" FOREIGN KEY ("companiesId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies_accounts" ADD CONSTRAINT "FK_735944085c8df1986e4bc8f2a41" FOREIGN KEY ("accountsId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
