import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCompositePk1743413654483 implements MigrationInterface {
  name = 'RemoveCompositePk1743413654483';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "targets_categories" ADD "id" SERIAL NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" DROP CONSTRAINT "PK_7ebd90a898cd59a6bfc99fa4539"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" ADD CONSTRAINT "PK_a08feaa6f8b893de2f0a0013b68" PRIMARY KEY ("project_id", "company_id", "category_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ADD "id" SERIAL NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" DROP CONSTRAINT "PK_2e774f9cd2d66ecc6fb9c586109"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ADD CONSTRAINT "PK_0b0e3b0da13d8886fa9d42954bb" PRIMARY KEY ("project_id", "company_id", "sector_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" DROP CONSTRAINT "fk_target_category_project"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" DROP CONSTRAINT "fk_target_category_company"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" DROP CONSTRAINT "fk_target_category_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" DROP CONSTRAINT "PK_a08feaa6f8b893de2f0a0013b68"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" ADD CONSTRAINT "PK_574f0d2e41e0c88ba7339281178" PRIMARY KEY ("company_id", "category_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" DROP CONSTRAINT "PK_574f0d2e41e0c88ba7339281178"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" ADD CONSTRAINT "PK_d957253f2f514c1cc546531b666" PRIMARY KEY ("category_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" DROP CONSTRAINT "PK_d957253f2f514c1cc546531b666"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" ADD CONSTRAINT "PK_9b61d042fd08b09a567545e1589" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" DROP CONSTRAINT "fk_target_sector_project"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" DROP CONSTRAINT "fk_target_sector_company"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" DROP CONSTRAINT "fk_target_sector_sector"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" DROP CONSTRAINT "PK_0b0e3b0da13d8886fa9d42954bb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ADD CONSTRAINT "PK_46c84484d795b1e64b979e9b6b4" PRIMARY KEY ("company_id", "sector_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" DROP CONSTRAINT "PK_46c84484d795b1e64b979e9b6b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ADD CONSTRAINT "PK_a1256f37f58100c2982d8134f69" PRIMARY KEY ("sector_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" DROP CONSTRAINT "PK_a1256f37f58100c2982d8134f69"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ADD CONSTRAINT "PK_a376e7128a2c570271ec2c5f8ff" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_target_category_unique" ON "targets_categories" ("project_id", "company_id", "category_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_target_sector_unique" ON "targets_sectors" ("project_id", "company_id", "sector_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" ADD CONSTRAINT "fk_target_category_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" ADD CONSTRAINT "fk_target_category_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" ADD CONSTRAINT "fk_target_category_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ADD CONSTRAINT "fk_target_sector_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ADD CONSTRAINT "fk_target_sector_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ADD CONSTRAINT "fk_target_sector_sector" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" DROP CONSTRAINT "fk_target_sector_sector"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" DROP CONSTRAINT "fk_target_sector_company"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" DROP CONSTRAINT "fk_target_sector_project"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" DROP CONSTRAINT "fk_target_category_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" DROP CONSTRAINT "fk_target_category_company"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" DROP CONSTRAINT "fk_target_category_project"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_target_sector_unique"`);
    await queryRunner.query(`DROP INDEX "public"."idx_target_category_unique"`);
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" DROP CONSTRAINT "PK_a376e7128a2c570271ec2c5f8ff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ADD CONSTRAINT "PK_a1256f37f58100c2982d8134f69" PRIMARY KEY ("sector_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" DROP CONSTRAINT "PK_a1256f37f58100c2982d8134f69"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ADD CONSTRAINT "PK_46c84484d795b1e64b979e9b6b4" PRIMARY KEY ("company_id", "sector_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" DROP CONSTRAINT "PK_46c84484d795b1e64b979e9b6b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ADD CONSTRAINT "PK_0b0e3b0da13d8886fa9d42954bb" PRIMARY KEY ("project_id", "company_id", "sector_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ADD CONSTRAINT "fk_target_sector_sector" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ADD CONSTRAINT "fk_target_sector_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ADD CONSTRAINT "fk_target_sector_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" DROP CONSTRAINT "PK_9b61d042fd08b09a567545e1589"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" ADD CONSTRAINT "PK_d957253f2f514c1cc546531b666" PRIMARY KEY ("category_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" DROP CONSTRAINT "PK_d957253f2f514c1cc546531b666"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" ADD CONSTRAINT "PK_574f0d2e41e0c88ba7339281178" PRIMARY KEY ("company_id", "category_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" DROP CONSTRAINT "PK_574f0d2e41e0c88ba7339281178"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" ADD CONSTRAINT "PK_a08feaa6f8b893de2f0a0013b68" PRIMARY KEY ("project_id", "company_id", "category_id", "id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" ADD CONSTRAINT "fk_target_category_category" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" ADD CONSTRAINT "fk_target_category_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" ADD CONSTRAINT "fk_target_category_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" DROP CONSTRAINT "PK_0b0e3b0da13d8886fa9d42954bb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_sectors" ADD CONSTRAINT "PK_2e774f9cd2d66ecc6fb9c586109" PRIMARY KEY ("project_id", "company_id", "sector_id")`,
    );
    await queryRunner.query(`ALTER TABLE "targets_sectors" DROP COLUMN "id"`);
    await queryRunner.query(
      `ALTER TABLE "targets_categories" DROP CONSTRAINT "PK_a08feaa6f8b893de2f0a0013b68"`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" ADD CONSTRAINT "PK_7ebd90a898cd59a6bfc99fa4539" PRIMARY KEY ("project_id", "company_id", "category_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "targets_categories" DROP COLUMN "id"`,
    );
  }
}
