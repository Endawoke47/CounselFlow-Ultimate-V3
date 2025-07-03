import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyId1740632452599 implements MigrationInterface {
  name = 'AddCompanyId1740632452599';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "company_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_7ae6334059289559722437bcc1c" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_7ae6334059289559722437bcc1c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "company_id" SET NOT NULL`,
    );
  }
}
