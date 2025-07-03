import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserUuid1742547947868 implements MigrationInterface {
  name = 'AddUserUuid1742547947868';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "uuid" character varying NOT NULL DEFAULT gen_random_uuid()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "uuid"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
