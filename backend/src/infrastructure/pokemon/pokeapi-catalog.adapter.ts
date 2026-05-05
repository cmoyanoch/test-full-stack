import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import {
  IPokemonCatalogPort,
  PokemonDetail,
  PokemonListResult,
  PokemonSummary,
} from '../../application/ports/pokemon-catalog.port';
import { TtlCache } from '../common/ttl-cache';

interface PokeApiListResponse {
  count: number;
  next: string | null;
  results: { name: string; url: string }[];
}

interface PokeApiDetailResponse {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    other?: {
      'official-artwork'?: { front_default: string | null };
    };
  };
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
}

@Injectable()
export class PokeApiCatalogAdapter
  implements IPokemonCatalogPort, OnModuleInit
{
  private readonly logger = new Logger(PokeApiCatalogAdapter.name);
  private readonly detailCache: TtlCache<PokemonDetail>;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    const ttlRaw = this.config.get<string>(
      'POKEAPI_DETAIL_CACHE_TTL_MS',
      '300000',
    );
    const maxRaw = this.config.get<string>(
      'POKEAPI_DETAIL_CACHE_MAX',
      '500',
    );
    const parsedTtl = parseInt(ttlRaw, 10);
    const ttlMs = Number.isNaN(parsedTtl)
      ? 300000
      : Math.max(0, parsedTtl);
    const parsedMax = parseInt(maxRaw, 10);
    const maxEntries = Number.isNaN(parsedMax)
      ? 500
      : Math.max(1, parsedMax);
    this.detailCache = new TtlCache<PokemonDetail>(maxEntries, ttlMs);
  }

  async onModuleInit(): Promise<void> {
    if (!this.shouldWarmUp()) {
      return;
    }
    try {
      await this.list(0, 1);
      this.logger.log('PokéAPI: conexión inicial lista (warm-up)');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`PokéAPI: warm-up omitido (${msg})`);
    }
  }

  private shouldWarmUp(): boolean {
    if (process.env.NODE_ENV === 'test') {
      return false;
    }
    const flag = this.config
      .get<string>('POKEAPI_WARMUP', 'true')
      .toLowerCase();
    return flag !== 'false' && flag !== '0';
  }

  private baseUrl(): string {
    return this.config.get<string>('POKEAPI_BASE_URL', 'https://pokeapi.co/api/v2');
  }

  async list(offset: number, limit: number): Promise<PokemonListResult> {
    const url = `${this.baseUrl()}/pokemon`;
    try {
      const { data } = await firstValueFrom(
        this.http.get<PokeApiListResponse>(url, {
          params: { offset, limit },
          timeout: 15000,
        }),
      );
      const items: PokemonSummary[] = data.results.map((r) => ({
        name: r.name,
        url: r.url,
      }));
      let nextOffset: number | null = null;
      if (data.next) {
        const u = new URL(data.next);
        const no = u.searchParams.get('offset');
        nextOffset = no !== null ? parseInt(no, 10) : offset + limit;
      }
      return { items, total: data.count, nextOffset };
    } catch (err) {
      this.mapAxiosError(err);
    }
  }

  async getById(idOrName: string): Promise<PokemonDetail> {
    const cacheKey = this.detailCacheKey(idOrName);
    const cached = this.detailCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const url = `${this.baseUrl()}/pokemon/${encodeURIComponent(idOrName)}`;
    try {
      const { data } = await firstValueFrom(
        this.http.get<PokeApiDetailResponse>(url, { timeout: 15000 }),
      );
      const detail = this.mapDetail(data);
      this.detailCache.set(cacheKey, detail);
      return detail;
    } catch (err) {
      this.mapAxiosError(err);
    }
  }

  private detailCacheKey(idOrName: string): string {
    const t = idOrName.trim();
    if (/^\d+$/.test(t)) {
      return t;
    }
    return t.toLowerCase();
  }

  private mapDetail(data: PokeApiDetailResponse): PokemonDetail {
    const official =
      data.sprites.other?.['official-artwork']?.front_default ??
      data.sprites.front_default ??
      '';
    return {
      id: data.id,
      name: data.name,
      imageUrl: official,
      types: data.types.map((t) => t.type.name),
      stats: data.stats.map((s) => ({
        name: s.stat.name,
        baseStat: s.base_stat,
      })),
    };
  }

  private mapAxiosError(err: unknown): never {
    const ax = err as AxiosError;
    if (ax.response?.status === 404) {
      throw new PokemonCatalogNotFoundError();
    }
    this.logger.error(
      `PokéAPI error: ${ax.message}`,
      ax.stack,
    );
    throw new PokemonCatalogUpstreamError(ax.message);
  }
}

export class PokemonCatalogNotFoundError extends Error {
  constructor() {
    super('Pokemon not found in PokéAPI');
    this.name = 'PokemonCatalogNotFoundError';
  }
}

export class PokemonCatalogUpstreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PokemonCatalogUpstreamError';
  }
}
