import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveMatterType1745313775604 implements MigrationInterface {
  name = 'RemoveMatterType1745313775604';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "risks" DROP COLUMN "matter_type"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "risks" ADD "matter_type" character varying(50)`,
    );
  }
}
