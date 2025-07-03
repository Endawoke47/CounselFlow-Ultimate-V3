import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAccountToCompanyRelation1742359518221
  implements MigrationInterface
{
  name = 'UpdateAccountToCompanyRelation1742359518221';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "FK_b8607ec20e9c5db96b8eb457111"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."account_to_company_companytype_enum" AS ENUM('ADMIN', 'LAWYER', 'LAWYER_CUSTOMER', 'LAWYER_OUTSOURCE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "account_to_company" ("id" SERIAL NOT NULL, "companyType" "public"."account_to_company_companytype_enum" NOT NULL DEFAULT 'ADMIN', "companyId" integer NOT NULL, "accountId" integer NOT NULL, CONSTRAINT "PK_bd730fb07133469668af3cbf2ba" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP COLUMN "organization_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "REL_b8607ec20e9c5db96b8eb45711"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP COLUMN "owner_company_id"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "user_type"`);
    await queryRunner.query(`DROP TYPE "public"."users_user_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "organization_size" character varying(250) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_to_company" ADD CONSTRAINT "FK_4873f6bc27d4499c1987e2e8166" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_to_company" ADD CONSTRAINT "FK_f1f86567ac0d682a52fcf7cbb7e" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account_to_company" DROP CONSTRAINT "FK_f1f86567ac0d682a52fcf7cbb7e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_to_company" DROP CONSTRAINT "FK_4873f6bc27d4499c1987e2e8166"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP COLUMN "organization_size"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_user_type_enum" AS ENUM('ADMIN', 'LAWYER', 'TARGET', 'EXTERNAL')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "user_type" "public"."users_user_type_enum" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "owner_company_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "REL_b8607ec20e9c5db96b8eb45711" UNIQUE ("owner_company_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "organization_type" character varying(250) NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "account_to_company"`);
    await queryRunner.query(
      `DROP TYPE "public"."account_to_company_companytype_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "FK_b8607ec20e9c5db96b8eb457111" FOREIGN KEY ("owner_company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
