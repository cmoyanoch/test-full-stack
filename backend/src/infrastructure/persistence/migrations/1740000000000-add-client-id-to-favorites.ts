import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClientIdToFavorites1740000000000 implements MigrationInterface {
  name = 'AddClientIdToFavorites1740000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "favorites"
      ADD COLUMN "clientId" character varying(64) NOT NULL DEFAULT 'default'
    `);
    await queryRunner.query(`
      ALTER TABLE "favorites" DROP CONSTRAINT IF EXISTS "UQ_favorites_pokemonId"
    `);
    await queryRunner.query(`
      ALTER TABLE "favorites"
      ADD CONSTRAINT "UQ_favorites_client_pokemon" UNIQUE ("clientId", "pokemonId")
    `);
    await queryRunner.query(`
      ALTER TABLE "favorites" ALTER COLUMN "clientId" DROP DEFAULT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "favorites" f1
      USING "favorites" f2
      WHERE f1."pokemonId" = f2."pokemonId"
        AND f1."id"::text > f2."id"::text
    `);
    await queryRunner.query(`
      ALTER TABLE "favorites" DROP CONSTRAINT IF EXISTS "UQ_favorites_client_pokemon"
    `);
    await queryRunner.query(`
      ALTER TABLE "favorites" DROP COLUMN "clientId"
    `);
    await queryRunner.query(`
      ALTER TABLE "favorites"
      ADD CONSTRAINT "UQ_favorites_pokemonId" UNIQUE ("pokemonId")
    `);
  }
}
