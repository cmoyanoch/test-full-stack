import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPokemonSnapshotToFavorites1740000000001
  implements MigrationInterface
{
  name = 'AddPokemonSnapshotToFavorites1740000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "favorites"
      ADD COLUMN "pokemonName" character varying(100) NOT NULL DEFAULT ''
    `);
    await queryRunner.query(`
      ALTER TABLE "favorites"
      ADD COLUMN "imageUrl" text NOT NULL DEFAULT ''
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "favorites" DROP COLUMN "imageUrl"`);
    await queryRunner.query(`ALTER TABLE "favorites" DROP COLUMN "pokemonName"`);
  }
}
