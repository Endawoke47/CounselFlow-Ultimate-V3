import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimestampsAndSoftDeleteToCoreTables1743684809264
  implements MigrationInterface
{
  name = 'AddTimestampsAndSoftDeleteToCoreTables1743684809264';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add columns to sectors table
    const sectorColumns = await queryRunner.getTable('sectors');
    if (!sectorColumns?.findColumnByName('created_at')) {
      await queryRunner.query(
        `ALTER TABLE "sectors" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
      );
    }
    if (!sectorColumns?.findColumnByName('updated_at')) {
      await queryRunner.query(
        `ALTER TABLE "sectors" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
      );
    }
    if (!sectorColumns?.findColumnByName('deleted_at')) {
      await queryRunner.query(
        `ALTER TABLE "sectors" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
      );
    }

    // Add columns to categories table
    const categoriesColumns = await queryRunner.getTable('categories');
    if (!categoriesColumns?.findColumnByName('created_at')) {
      await queryRunner.query(
        `ALTER TABLE "categories" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
      );
    }
    if (!categoriesColumns?.findColumnByName('updated_at')) {
      await queryRunner.query(
        `ALTER TABLE "categories" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
      );
    }
    if (!categoriesColumns?.findColumnByName('deleted_at')) {
      await queryRunner.query(
        `ALTER TABLE "categories" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
      );
    }

    // Add columns to countries table
    const countriesColumns = await queryRunner.getTable('countries');
    if (!countriesColumns?.findColumnByName('created_at')) {
      await queryRunner.query(
        `ALTER TABLE "countries" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
      );
    }
    if (!countriesColumns?.findColumnByName('updated_at')) {
      await queryRunner.query(
        `ALTER TABLE "countries" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
      );
    }
    if (!countriesColumns?.findColumnByName('deleted_at')) {
      await queryRunner.query(
        `ALTER TABLE "countries" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
      );
    }

    // Add columns to states table
    const statesColumns = await queryRunner.getTable('states');
    if (!statesColumns?.findColumnByName('created_at')) {
      await queryRunner.query(
        `ALTER TABLE "states" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
      );
    }
    if (!statesColumns?.findColumnByName('updated_at')) {
      await queryRunner.query(
        `ALTER TABLE "states" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
      );
    }
    if (!statesColumns?.findColumnByName('deleted_at')) {
      await queryRunner.query(
        `ALTER TABLE "states" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
      );
    }

    // Add columns to cities table
    const citiesColumns = await queryRunner.getTable('cities');
    if (!citiesColumns?.findColumnByName('created_at')) {
      await queryRunner.query(
        `ALTER TABLE "cities" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
      );
    }
    if (!citiesColumns?.findColumnByName('updated_at')) {
      await queryRunner.query(
        `ALTER TABLE "cities" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
      );
    }
    if (!citiesColumns?.findColumnByName('deleted_at')) {
      await queryRunner.query(
        `ALTER TABLE "cities" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
      );
    }

    // Add columns to accounts table
    const accountsColumns = await queryRunner.getTable('accounts');
    if (!accountsColumns?.findColumnByName('is_admin')) {
      await queryRunner.query(
        `ALTER TABLE "accounts" ADD "is_admin" boolean NOT NULL DEFAULT false`,
      );
    }
    if (!accountsColumns?.findColumnByName('created_at')) {
      await queryRunner.query(
        `ALTER TABLE "accounts" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
      );
    }
    if (!accountsColumns?.findColumnByName('updated_at')) {
      await queryRunner.query(
        `ALTER TABLE "accounts" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
      );
    }
    if (!accountsColumns?.findColumnByName('deleted_at')) {
      await queryRunner.query(
        `ALTER TABLE "accounts" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
      );
    }

    // Add columns to companies table
    const companiesColumns = await queryRunner.getTable('companies');
    if (!companiesColumns?.findColumnByName('created_at')) {
      await queryRunner.query(
        `ALTER TABLE "companies" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
      );
    }
    if (!companiesColumns?.findColumnByName('updated_at')) {
      await queryRunner.query(
        `ALTER TABLE "companies" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
      );
    }
    if (!companiesColumns?.findColumnByName('deleted_at')) {
      await queryRunner.query(
        `ALTER TABLE "companies" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
      );
    }

    // Add/update columns to users table
    const usersColumns = await queryRunner.getTable('users');
    if (!usersColumns?.findColumnByName('deleted_at')) {
      await queryRunner.query(
        `ALTER TABLE "users" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
      );
    }

    // For users table, we're modifying existing columns, so we need a different approach
    const createdAtColumn = usersColumns?.findColumnByName('created_at');
    if (createdAtColumn) {
      if (createdAtColumn.type !== 'timestamp with time zone') {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
        await queryRunner.query(
          `ALTER TABLE "users" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
        );
      }
    } else {
      await queryRunner.query(
        `ALTER TABLE "users" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
      );
    }

    const updatedAtColumn = usersColumns?.findColumnByName('updated_at');
    if (updatedAtColumn) {
      if (updatedAtColumn.type !== 'timestamp with time zone') {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_at"`);
        await queryRunner.query(
          `ALTER TABLE "users" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
        );
      }
    } else {
      await queryRunner.query(
        `ALTER TABLE "users" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "updated_at" TIMESTAMP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "created_at" TIMESTAMP DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "is_admin"`);
    await queryRunner.query(`ALTER TABLE "cities" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "cities" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "cities" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "states" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "states" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "states" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "categories" DROP COLUMN "deleted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(`ALTER TABLE "sectors" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "sectors" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "sectors" DROP COLUMN "created_at"`);
  }
}
