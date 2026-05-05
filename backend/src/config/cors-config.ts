/**
 * CORS HTTP y Socket.IO alineados con CORS_ORIGINS (coma-separada).
 * Vacío → permisivo en desarrollo (reflejar origen o permitir todo).
 */
export function parseOriginsFromEnv(): string[] | undefined {
  const raw = process.env.CORS_ORIGINS?.trim();
  if (!raw) return undefined;
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

export function getHttpCorsOptions(): {
  origin: boolean | string[] | ((origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => void);
  credentials?: boolean;
  allowedHeaders?: string[];
} {
  const origins = parseOriginsFromEnv();
  return {
    origin:
      origins === undefined
        ? true
        : origins.length === 0
          ? true
          : origins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'X-Client-Id'],
  };
}

export function getSocketIoCorsConfig(): {
  origin: boolean | string[];
  credentials: boolean;
  allowedHeaders?: string[];
} {
  const origins = parseOriginsFromEnv();
  return {
    origin: origins === undefined || origins.length === 0 ? true : origins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'X-Client-Id'],
  };
}
