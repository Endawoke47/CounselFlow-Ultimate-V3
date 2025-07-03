import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProjectAliases1741950170386 implements MigrationInterface {
  name = 'ProjectAliases1741950170386';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects" ADD "aliases" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "aliases"`);
  }
}
