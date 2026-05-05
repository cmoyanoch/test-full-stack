import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'favorites' })
@Unique('UQ_favorites_client_pokemon', ['clientId', 'pokemonId'])
export class FavoriteOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 64, default: 'default' })
  clientId!: string;

  @Column({ type: 'int' })
  pokemonId!: number;

  @Column({ type: 'varchar', length: 100 })
  pokemonName!: string;

  @Column({ type: 'text' })
  imageUrl!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  note!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}
