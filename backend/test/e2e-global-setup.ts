import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

/**
 * Levanta un Postgres efímero (Testcontainers) antes de la suite e2e y publica las
 * variables de entorno (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME) que el
 * AppModule lee a través de ConfigService. El contenedor queda referenciado en
 * `globalThis` para que `e2e-global-teardown.ts` lo detenga al final.
 *
 * Si la variable `E2E_USE_TESTCONTAINERS=false` está presente, se usa la BD del
 * host (modo legacy: requiere Postgres corriendo). Útil cuando el daemon Docker
 * no está disponible.
 */
export default async function setup(): Promise<void> {
  if (process.env.E2E_USE_TESTCONTAINERS === 'false') {
    return;
  }

  const container: StartedPostgreSqlContainer =
    await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('pokemon_e2e')
      .withUsername('postgres')
      .withPassword('postgres')
      .start();

  process.env.DB_HOST = container.getHost();
  process.env.DB_PORT = String(container.getPort());
  process.env.DB_USER = container.getUsername();
  process.env.DB_PASSWORD = container.getPassword();
  process.env.DB_NAME = container.getDatabase();
  process.env.TYPEORM_SYNC = 'true';
  process.env.POKEAPI_WARMUP = 'false';
  process.env.THROTTLE_LIMIT = process.env.THROTTLE_LIMIT ?? '10000';

  // Triple gate para que el SDK OTel no intente conectar al collector durante e2e.
  process.env.OTEL_ENABLED = 'false';
  delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

  (globalThis as { __E2E_PG_CONTAINER__?: StartedPostgreSqlContainer }).__E2E_PG_CONTAINER__ =
    container;

  console.log(
    `[e2e] Postgres efímero iniciado en ${container.getHost()}:${container.getPort()} (db ${container.getDatabase()})`,
  );
}
