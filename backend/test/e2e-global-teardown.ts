import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';

export default async function teardown(): Promise<void> {
  const holder = globalThis as {
    __E2E_PG_CONTAINER__?: StartedPostgreSqlContainer;
  };
  const container = holder.__E2E_PG_CONTAINER__;
  if (!container) return;

  try {
    await container.stop({ remove: true });
  } catch (error) {
    console.warn(
      '[e2e] Error deteniendo el contenedor Postgres:',
      error instanceof Error ? error.message : error,
    );
  } finally {
    delete holder.__E2E_PG_CONTAINER__;
  }
}
