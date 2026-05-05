import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { appLog } from './logging/structured-log';
import { Response } from 'express';
import {
  DuplicateFavoriteError,
  FavoriteNotFoundError,
} from '../domain/domain.errors';
import {
  PokemonCatalogNotFoundError,
  PokemonCatalogUpstreamError,
} from '../infrastructure/pokemon/pokeapi-catalog.adapter';

@Catch(
  DuplicateFavoriteError,
  FavoriteNotFoundError,
  PokemonCatalogNotFoundError,
  PokemonCatalogUpstreamError,
)
export class DomainToHttpFilter implements ExceptionFilter {
  catch(
    exception:
      | DuplicateFavoriteError
      | FavoriteNotFoundError
      | PokemonCatalogNotFoundError
      | PokemonCatalogUpstreamError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<{ method?: string; url?: string }>();
    const res = ctx.getResponse<Response>();
    if (exception instanceof DuplicateFavoriteError) {
      appLog('warn', 'Http', 'domain error mapped', {
        error: 'DuplicateFavorite',
        statusCode: HttpStatus.CONFLICT,
        path: req.url,
        method: req.method,
      });
      res.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: exception.message,
        error: 'Conflict',
      });
      return;
    }
    if (exception instanceof FavoriteNotFoundError) {
      appLog('warn', 'Http', 'domain error mapped', {
        error: 'FavoriteNotFound',
        statusCode: HttpStatus.NOT_FOUND,
        path: req.url,
        method: req.method,
      });
      res.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: exception.message,
        error: 'Not Found',
      });
      return;
    }
    if (exception instanceof PokemonCatalogNotFoundError) {
      appLog('warn', 'Http', 'domain error mapped', {
        error: 'PokemonCatalogNotFound',
        statusCode: HttpStatus.NOT_FOUND,
        path: req.url,
        method: req.method,
      });
      res.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: exception.message,
        error: 'Not Found',
      });
      return;
    }
    appLog('error', 'Http', 'domain error mapped', {
      error: 'PokemonCatalogUpstream',
      statusCode: HttpStatus.BAD_GATEWAY,
      path: req.url,
      method: req.method,
    });
    res.status(HttpStatus.BAD_GATEWAY).json({
      statusCode: HttpStatus.BAD_GATEWAY,
      message: 'PokéAPI unavailable or error',
      error: 'Bad Gateway',
    });
  }
}
