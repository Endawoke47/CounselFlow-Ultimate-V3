import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1737005062038 implements MigrationInterface {
  name = 'Init1737005062038';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "states" ("id" SERIAL NOT NULL, "name" character varying(40) NOT NULL, "country_id" integer, CONSTRAINT "PK_09ab30ca0975c02656483265f4f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "states_pkey" ON "states" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "countries" ("id" SERIAL NOT NULL, "shortname" character varying(3) NOT NULL, "name" character varying(150) NOT NULL, "phonecode" integer NOT NULL, CONSTRAINT "PK_b2d7006793e8697ab3ae2deff18" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "countries_pkey" ON "countries" ("id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."lawyers_user_type_enum" AS ENUM('ADMIN', 'LAWYER', 'TARGET', 'EXTERNAL')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."lawyers_lawyer_type_enum" AS ENUM('Partner', 'Senior Associate', 'Associate')`,
    );
    await queryRunner.query(
      `CREATE TABLE "lawyers" ("id" SERIAL NOT NULL, "email" character varying(320) NOT NULL, "user_type" "public"."lawyers_user_type_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL, "updated_at" TIMESTAMP NOT NULL, "company_id" integer NOT NULL, "title" character varying(255) NOT NULL, "first_name" character varying(255) NOT NULL, "middle_name" character varying(255), "last_name" character varying(255) NOT NULL, "department" character varying(255) NOT NULL, "phone" character varying(255) NOT NULL, "best_way_to_contact" character varying(255), "entity" character varying(255), "notes" text, "country_id" integer NOT NULL, "state_id" integer NOT NULL, "city_id" integer NOT NULL, "user_id" integer NOT NULL, "lawyer_type" "public"."lawyers_lawyer_type_enum", CONSTRAINT "PK_8b5b7d154a11291f3f5972e920c" PRIMARY KEY ("id", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "lawyers_pkey" ON "lawyers" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_user_type_enum" AS ENUM('ADMIN', 'LAWYER', 'TARGET', 'EXTERNAL')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying(320) NOT NULL, "user_type" "public"."users_user_type_enum" NOT NULL, "created_at" TIMESTAMP DEFAULT now(), "updated_at" TIMESTAMP NOT NULL, "company_id" integer NOT NULL, "title" character varying(255) NOT NULL, "first_name" character varying(255) NOT NULL, "middle_name" character varying(255), "last_name" character varying(255) NOT NULL, "department" character varying(255) NOT NULL, "phone" character varying(255), "best_way_to_contact" character varying(255), "entity" character varying(255), "notes" text, "city_id" integer, "country_id" integer, "state_id" integer, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "users_pkey" ON "users" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "cities" ("id" SERIAL NOT NULL, "name" character varying(40) NOT NULL, "state_id" integer, CONSTRAINT "PK_4762ffb6e5d198cfec5606bc11e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "cities_pkey" ON "cities" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "categories_pkey" ON "categories" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "company_categories" ("id" SERIAL NOT NULL, "category_id" integer, "company_id" integer, CONSTRAINT "PK_646863e09dfd590ceac68300b2c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "company_categories_pkey" ON "company_categories" ("id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."privileges_module_enum" AS ENUM('USER', 'IRL', 'SCHEDULE', 'PROJECT', 'VDR', 'TASK')`,
    );
    await queryRunner.query(
      `CREATE TABLE "privileges" ("id" SERIAL NOT NULL, "module" "public"."privileges_module_enum" NOT NULL, "allow_edit" boolean NOT NULL, "allow_view" boolean NOT NULL, "allow_create" boolean NOT NULL, "allow_delete" boolean NOT NULL, CONSTRAINT "PK_13f3ff98ae4d5565ec5ed6036cd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "privileges_pkey" ON "privileges" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "role_privileges" ("id" SERIAL NOT NULL, "privilege_id" integer, "role_id" integer, CONSTRAINT "PK_f671486fe8eab3081c087946f2c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "role_privileges_pkey" ON "role_privileges" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "project_id" integer, CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "roles_pkey" ON "roles" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "projects" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "projects_pkey" ON "projects" ("id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."project_companies_type_enum" AS ENUM('CLIENT', 'TARGET')`,
    );
    await queryRunner.query(
      `CREATE TABLE "project_companies" ("id" SERIAL NOT NULL, "type" "public"."project_companies_type_enum" NOT NULL, "company_id" integer, "project_id" integer, CONSTRAINT "PK_e8f6df7e98cd797e89821f128e6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "project_companies_pkey" ON "project_companies" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "companies" ("id" SERIAL NOT NULL, "contact" text, "name" character varying(255) NOT NULL, "address" character varying(255) NOT NULL, "city_id" integer, "country_id" integer, "state_id" integer, CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "companies_pkey" ON "companies" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "company_sectors" ("id" SERIAL NOT NULL, "company_id" integer, "sector_id" integer, CONSTRAINT "PK_db8142add966d168598754888eb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "company_sectors_pkey" ON "company_sectors" ("id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "sectors" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, CONSTRAINT "PK_923fdda0dc12f59add7b3a1782f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "sectors_pkey" ON "sectors" ("id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."project_teams_user_type_enum" AS ENUM('LAWYER', 'TARGET', 'CLIENT')`,
    );
    await queryRunner.query(
      `CREATE TABLE "project_teams" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "project_id" integer NOT NULL, "role_id" integer NOT NULL, "user_type" "public"."project_teams_user_type_enum" NOT NULL, CONSTRAINT "PK_01a9679008fec32d42fe331ff10" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "project_teams_pkey" ON "project_teams" ("id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "states" ADD CONSTRAINT "FK_f3bbd0bc19bb6d8a887add08461" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "lawyers" ADD CONSTRAINT "FK_883a07136aae7c152afa2ea1cdd" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_03934bca2709003c5f08fd436d2" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_ae78dc6cb10aa14cfef96b2dd90" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_e589d18ac4320f3f83fc7891421" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cities" ADD CONSTRAINT "FK_1229b56aa12cae674b824fccd13" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_categories" ADD CONSTRAINT "FK_573ba4cbe7979a28df1af6ccf5f" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_categories" ADD CONSTRAINT "FK_6566c273a06368ae170905076bf" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_privileges" ADD CONSTRAINT "FK_6a6438e163c9c40c41288ebc9bf" FOREIGN KEY ("privilege_id") REFERENCES "privileges"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_privileges" ADD CONSTRAINT "FK_c2ab0794b38051da6c6bee31aa4" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "FK_cb48212dfe65dfe431d486034d2" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_companies" ADD CONSTRAINT "FK_e5748d1454b3a25b3f91473dfd8" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_companies" ADD CONSTRAINT "FK_6d62b2cd707f3c231c78073216c" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "FK_6398f263de442e9becb2b7b68d3" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "FK_c0b822f1f2592917b52bd7368ba" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "FK_cd205039764358ab5ef410049cc" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_sectors" ADD CONSTRAINT "FK_0425a8393cec6c3163a5389cd9e" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_sectors" ADD CONSTRAINT "FK_35149927e74663fd4bbbb0e34a7" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "company_sectors" DROP CONSTRAINT "FK_35149927e74663fd4bbbb0e34a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_sectors" DROP CONSTRAINT "FK_0425a8393cec6c3163a5389cd9e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP CONSTRAINT "FK_cd205039764358ab5ef410049cc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP CONSTRAINT "FK_c0b822f1f2592917b52bd7368ba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP CONSTRAINT "FK_6398f263de442e9becb2b7b68d3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_companies" DROP CONSTRAINT "FK_6d62b2cd707f3c231c78073216c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "project_companies" DROP CONSTRAINT "FK_e5748d1454b3a25b3f91473dfd8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" DROP CONSTRAINT "FK_cb48212dfe65dfe431d486034d2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_privileges" DROP CONSTRAINT "FK_c2ab0794b38051da6c6bee31aa4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_privileges" DROP CONSTRAINT "FK_6a6438e163c9c40c41288ebc9bf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_categories" DROP CONSTRAINT "FK_6566c273a06368ae170905076bf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_categories" DROP CONSTRAINT "FK_573ba4cbe7979a28df1af6ccf5f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cities" DROP CONSTRAINT "FK_1229b56aa12cae674b824fccd13"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_e589d18ac4320f3f83fc7891421"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_ae78dc6cb10aa14cfef96b2dd90"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_03934bca2709003c5f08fd436d2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lawyers" DROP CONSTRAINT "FK_883a07136aae7c152afa2ea1cdd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "states" DROP CONSTRAINT "FK_f3bbd0bc19bb6d8a887add08461"`,
    );
    await queryRunner.query(`DROP INDEX "public"."project_teams_pkey"`);
    await queryRunner.query(`DROP TABLE "project_teams"`);
    await queryRunner.query(
      `DROP TYPE "public"."project_teams_user_type_enum"`,
    );
    await queryRunner.query(`DROP INDEX "public"."sectors_pkey"`);
    await queryRunner.query(`DROP TABLE "sectors"`);
    await queryRunner.query(`DROP INDEX "public"."company_sectors_pkey"`);
    await queryRunner.query(`DROP TABLE "company_sectors"`);
    await queryRunner.query(`DROP INDEX "public"."companies_pkey"`);
    await queryRunner.query(`DROP TABLE "companies"`);
    await queryRunner.query(`DROP INDEX "public"."project_companies_pkey"`);
    await queryRunner.query(`DROP TABLE "project_companies"`);
    await queryRunner.query(`DROP TYPE "public"."project_companies_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."projects_pkey"`);
    await queryRunner.query(`DROP TABLE "projects"`);
    await queryRunner.query(`DROP INDEX "public"."roles_pkey"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP INDEX "public"."role_privileges_pkey"`);
    await queryRunner.query(`DROP TABLE "role_privileges"`);
    await queryRunner.query(`DROP INDEX "public"."privileges_pkey"`);
    await queryRunner.query(`DROP TABLE "privileges"`);
    await queryRunner.query(`DROP TYPE "public"."privileges_module_enum"`);
    await queryRunner.query(`DROP INDEX "public"."company_categories_pkey"`);
    await queryRunner.query(`DROP TABLE "company_categories"`);
    await queryRunner.query(`DROP INDEX "public"."categories_pkey"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP INDEX "public"."cities_pkey"`);
    await queryRunner.query(`DROP TABLE "cities"`);
    await queryRunner.query(`DROP INDEX "public"."users_pkey"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_user_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."lawyers_pkey"`);
    await queryRunner.query(`DROP TABLE "lawyers"`);
    await queryRunner.query(`DROP TYPE "public"."lawyers_lawyer_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."lawyers_user_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."countries_pkey"`);
    await queryRunner.query(`DROP TABLE "countries"`);
    await queryRunner.query(`DROP INDEX "public"."states_pkey"`);
    await queryRunner.query(`DROP TABLE "states"`);
  }
}
