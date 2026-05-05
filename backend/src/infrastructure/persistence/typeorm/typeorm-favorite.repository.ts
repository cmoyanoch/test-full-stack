import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../../../domain/favorite.entity';
import { IFavoriteRepository } from '../../../application/ports/favorite-repository.port';
import { FavoriteOrmEntity } from './favorite.orm-entity';
import { favoriteToDomain, favoriteToOrm } from './favorite.mapper';

@Injectable()
export class TypeOrmFavoriteRepository implements IFavoriteRepository {
  constructor(
    @InjectRepository(FavoriteOrmEntity)
    private readonly repo: Repository<FavoriteOrmEntity>,
  ) {}

  async findAll(clientId: string): Promise<Favorite[]> {
    const rows = await this.repo.find({
      where: { clientId },
      order: { createdAt: 'DESC' },
    });
    return rows.map(favoriteToDomain);
  }

  async findById(clientId: string, id: string): Promise<Favorite | null> {
    const row = await this.repo.findOne({ where: { id, clientId } });
    return row ? favoriteToDomain(row) : null;
  }

  async findByPokemonId(
    clientId: string,
    pokemonId: number,
  ): Promise<Favorite | null> {
    const row = await this.repo.findOne({ where: { clientId, pokemonId } });
    return row ? favoriteToDomain(row) : null;
  }

  async save(favorite: Favorite): Promise<Favorite> {
    const row = favoriteToOrm(favorite);
    const saved = await this.repo.save(row);
    return favoriteToDomain(saved);
  }

  async delete(clientId: string, id: string): Promise<void> {
    await this.repo.delete({ id, clientId });
  }
}
