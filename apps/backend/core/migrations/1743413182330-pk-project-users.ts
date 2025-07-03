import { MigrationInterface, QueryRunner } from 'typeorm';

export class PkProjectUsers1743413182330 implements MigrationInterface {
  name = 'PkProjectUsers1743413182330';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects_users" ADD "id" SERIAL NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" DROP CONSTRAINT "PK_2bdf8b14b34ac191f9fa6c67672"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" ADD CONSTRAINT "PK_66234d9561d96c5c1f225d7f5d2" PRIMARY KEY ("project_id", "user_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" DROP CONSTRAINT "fk_project_user_project"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" DROP CONSTRAINT "fk_project_user_user"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_PROJECT_OWNER"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_PROJECT_LEAD"`);
    await queryRunner.query(
      `ALTER TABLE "projects_users" DROP CONSTRAINT "PK_66234d9561d96c5c1f225d7f5d2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" ADD CONSTRAINT "PK_d6a9546518e1340f72113bc77b4" PRIMARY KEY ("user_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" DROP CONSTRAINT "PK_d6a9546518e1340f72113bc77b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" ADD CONSTRAINT "PK_3fdba03cb5a1887699cb7c629f2" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_PROJECT_OWNER" ON "projects_users" ("project_id", "is_owner") WHERE is_owner = true`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_PROJECT_LEAD" ON "projects_users" ("project_id", "is_lead") WHERE is_lead = true`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" ADD CONSTRAINT "fk_project_user_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" ADD CONSTRAINT "fk_project_user_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects_users" DROP CONSTRAINT "fk_project_user_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" DROP CONSTRAINT "fk_project_user_project"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_PROJECT_LEAD"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_PROJECT_OWNER"`);
    await queryRunner.query(
      `ALTER TABLE "projects_users" DROP CONSTRAINT "PK_3fdba03cb5a1887699cb7c629f2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" ADD CONSTRAINT "PK_d6a9546518e1340f72113bc77b4" PRIMARY KEY ("user_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" DROP CONSTRAINT "PK_d6a9546518e1340f72113bc77b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" ADD CONSTRAINT "PK_66234d9561d96c5c1f225d7f5d2" PRIMARY KEY ("project_id", "user_id", "id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_PROJECT_LEAD" ON "projects_users" ("is_lead", "project_id") WHERE (is_lead = true)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_PROJECT_OWNER" ON "projects_users" ("is_owner", "project_id") WHERE (is_owner = true)`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" ADD CONSTRAINT "fk_project_user_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" ADD CONSTRAINT "fk_project_user_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" DROP CONSTRAINT "PK_66234d9561d96c5c1f225d7f5d2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects_users" ADD CONSTRAINT "PK_2bdf8b14b34ac191f9fa6c67672" PRIMARY KEY ("project_id", "user_id")`,
    );
    await queryRunner.query(`ALTER TABLE "projects_users" DROP COLUMN "id"`);
  }
}
