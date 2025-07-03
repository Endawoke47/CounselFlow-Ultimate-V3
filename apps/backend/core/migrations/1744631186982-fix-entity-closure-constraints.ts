import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixEntityClosureConstraints1744631186982
  implements MigrationInterface
{
  name = 'FixEntityClosureConstraints1744631186982';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "entity_closure" DROP CONSTRAINT "FK_5afc3ec2dbbc4f2655a30e7f29b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_closure" DROP CONSTRAINT "FK_b8fb7fcfe8ac5d3098ad78f2e12"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b8fb7fcfe8ac5d3098ad78f2e1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5afc3ec2dbbc4f2655a30e7f29"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_dependencies" ADD CONSTRAINT "PK_a065a81cff2d8972317acfe024b" PRIMARY KEY ("action_id", "dependency_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_20f9a122ea46ecd5a3bd76d6a9" ON "entity_closure" ("ancestor_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_88b92c16dd51aba40f64c07aab" ON "entity_closure" ("descendant_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_closure" ADD CONSTRAINT "FK_20f9a122ea46ecd5a3bd76d6a99" FOREIGN KEY ("ancestor_id") REFERENCES "entities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_closure" ADD CONSTRAINT "FK_88b92c16dd51aba40f64c07aab0" FOREIGN KEY ("descendant_id") REFERENCES "entities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "entity_closure" DROP CONSTRAINT "FK_88b92c16dd51aba40f64c07aab0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_closure" DROP CONSTRAINT "FK_20f9a122ea46ecd5a3bd76d6a99"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_88b92c16dd51aba40f64c07aab"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_20f9a122ea46ecd5a3bd76d6a9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_dependencies" DROP CONSTRAINT "PK_a065a81cff2d8972317acfe024b"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5afc3ec2dbbc4f2655a30e7f29" ON "entity_closure" ("descendant_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b8fb7fcfe8ac5d3098ad78f2e1" ON "entity_closure" ("ancestor_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_closure" ADD CONSTRAINT "FK_b8fb7fcfe8ac5d3098ad78f2e12" FOREIGN KEY ("ancestor_id") REFERENCES "entities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "entity_closure" ADD CONSTRAINT "FK_5afc3ec2dbbc4f2655a30e7f29b" FOREIGN KEY ("descendant_id") REFERENCES "entities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
