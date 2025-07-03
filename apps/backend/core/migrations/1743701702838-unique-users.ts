import { MigrationInterface, QueryRunner } from 'typeorm';

export class UniqueUsers1743701702838 implements MigrationInterface {
  name = 'UniqueUsers1743701702838';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_users_email_company" UNIQUE ("email", "company_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_users_email_company"`,
    );
  }
}
