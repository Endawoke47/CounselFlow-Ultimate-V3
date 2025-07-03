import { MigrationInterface, QueryRunner } from 'typeorm';

export class Matters1744272514095 implements MigrationInterface {
  name = 'Matters1744272514095';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "matters" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "description" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_b6e879e12614eaedc4a6fdcb2b3" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "matters"`);
  }
}
