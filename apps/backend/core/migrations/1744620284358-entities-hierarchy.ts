import { MigrationInterface, QueryRunner } from 'typeorm';

export class EntitiesHierarchy1744620284358 implements MigrationInterface {
  name = 'EntitiesHierarchy1744620284358';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "entity_closure" ("ancestor_id" integer NOT NULL, "descendant_id" integer NOT NULL, CONSTRAINT "PK_f3a5c0e8c435fa11930cf329a47" PRIMARY KEY ("ancestor_id", "descendant_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b8fb7fcfe8ac5d3098ad78f2e1" ON "entity_closure" ("ancestor_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5afc3ec2dbbc4f2655a30e7f29" ON "entity_closure" ("descendant_id") `,
    );
    await queryRunner.query(`ALTER TABLE "entities" ADD "parentId" integer`);
    await queryRunner.query(
      `ALTER TABLE "entities" ADD CONSTRAINT "FK_8d41164aba2ddb9234faebbeede" FOREIGN KEY ("parentId") REFERENCES "entities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_closure" ADD CONSTRAINT "FK_b8fb7fcfe8ac5d3098ad78f2e12" FOREIGN KEY ("ancestor_id") REFERENCES "entities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_closure" ADD CONSTRAINT "FK_5afc3ec2dbbc4f2655a30e7f29b" FOREIGN KEY ("descendant_id") REFERENCES "entities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "entity_closure" DROP CONSTRAINT "FK_5afc3ec2dbbc4f2655a30e7f29b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_closure" DROP CONSTRAINT "FK_b8fb7fcfe8ac5d3098ad78f2e12"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entities" DROP CONSTRAINT "FK_8d41164aba2ddb9234faebbeede"`,
    );
    await queryRunner.query(`ALTER TABLE "entities" DROP COLUMN "parentId"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5afc3ec2dbbc4f2655a30e7f29"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b8fb7fcfe8ac5d3098ad78f2e1"`,
    );
    await queryRunner.query(`DROP TABLE "entity_closure"`);
  }
}
