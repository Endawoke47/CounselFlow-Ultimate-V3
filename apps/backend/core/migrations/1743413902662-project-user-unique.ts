import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProjectUserUnique1743413902662 implements MigrationInterface {
  name = 'ProjectUserUnique1743413902662';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_PROJECT_USER_UNIQUE" ON "projects_users" ("project_id", "user_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_PROJECT_USER_UNIQUE"`);
  }
}
