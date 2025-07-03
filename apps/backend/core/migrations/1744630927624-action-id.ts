import { MigrationInterface, QueryRunner } from 'typeorm';

export class ActionId1744630927624 implements MigrationInterface {
  name = 'ActionId1744630927624';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, drop all foreign key constraints that reference actions.id
    await queryRunner.query(
      `ALTER TABLE "action_dependencies" DROP CONSTRAINT "FK_fe17eb82abaa305d8cfb5e8cf28"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_dependencies" DROP CONSTRAINT "FK_4190abf3a4a9c158c003212994a"`,
    );

    // Drop the primary key constraint
    await queryRunner.query(
      `ALTER TABLE "actions" DROP CONSTRAINT "PK_7bfb822f56be449c0b8adbf83cf"`,
    );

    // Change the column type
    await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "actions" ADD "id" SERIAL NOT NULL`);

    // Recreate the primary key
    await queryRunner.query(
      `ALTER TABLE "actions" ADD CONSTRAINT "PK_7bfb822f56be449c0b8adbf83cf" PRIMARY KEY ("id")`,
    );

    // Update action_dependencies columns
    await queryRunner.query(
      `ALTER TABLE "action_dependencies" DROP COLUMN "action_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_dependencies" ADD "action_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_dependencies" DROP COLUMN "dependency_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_dependencies" ADD "dependency_id" integer NOT NULL`,
    );

    // Recreate foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "action_dependencies" ADD CONSTRAINT "FK_fe17eb82abaa305d8cfb5e8cf28" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_dependencies" ADD CONSTRAINT "FK_4190abf3a4a9c158c003212994a" FOREIGN KEY ("dependency_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );

    // Recreate indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_fe17eb82abaa305d8cfb5e8cf2" ON "action_dependencies" ("action_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4190abf3a4a9c158c003212994" ON "action_dependencies" ("dependency_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "action_dependencies" DROP CONSTRAINT "FK_4190abf3a4a9c158c003212994a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_dependencies" DROP CONSTRAINT "FK_fe17eb82abaa305d8cfb5e8cf28"`,
    );

    // Drop indexes
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4190abf3a4a9c158c003212994"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fe17eb82abaa305d8cfb5e8cf2"`,
    );

    // Drop primary key
    await queryRunner.query(
      `ALTER TABLE "actions" DROP CONSTRAINT "PK_7bfb822f56be449c0b8adbf83cf"`,
    );

    // Change columns back to UUID
    await queryRunner.query(`ALTER TABLE "actions" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "actions" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );

    // Update action_dependencies columns back to UUID
    await queryRunner.query(
      `ALTER TABLE "action_dependencies" DROP COLUMN "dependency_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_dependencies" ADD "dependency_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_dependencies" DROP COLUMN "action_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_dependencies" ADD "action_id" uuid NOT NULL`,
    );

    // Recreate primary key
    await queryRunner.query(
      `ALTER TABLE "actions" ADD CONSTRAINT "PK_7bfb822f56be449c0b8adbf83cf" PRIMARY KEY ("id")`,
    );

    // Recreate foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "action_dependencies" ADD CONSTRAINT "FK_4190abf3a4a9c158c003212994a" FOREIGN KEY ("dependency_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "action_dependencies" ADD CONSTRAINT "FK_fe17eb82abaa305d8cfb5e8cf28" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );

    // Recreate indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_4190abf3a4a9c158c003212994" ON "action_dependencies" ("dependency_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fe17eb82abaa305d8cfb5e8cf2" ON "action_dependencies" ("action_id") `,
    );
  }
}
