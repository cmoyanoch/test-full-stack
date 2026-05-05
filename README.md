# Pokémon favoritos — prueba técnica full stack

SPA **React** + API **NestJS** que consume **PokéAPI**, persiste **favoritos** en **PostgreSQL** y sincroniza cambios en tiempo real con **Socket.IO** (`favorite:added`, `favorite:removed`, `favorite:updated`). Stack dockerizado en un único [`docker-compose.yml`](docker-compose.yml).

---

## Guía de revisión (evaluador)

Orden sugerido para validar el entregable:

1. **Guía y checklist:** criterios típicos de una prueba full stack (PokéAPI, favoritos, tiempo real, Docker) en [docs/GUIA_ENTREGA.md](docs/GUIA_ENTREGA.md#11-checklist-de-entrega-vs-enunciado); decisiones técnicas y alcance en este README.
2. **Arranque:** desde la raíz del repo, `cp .env.example .env` y `docker compose up --build` (detalle en [Instalación y ejecución con Docker](#instalación-y-ejecución-con-docker-recomendado)).
3. **URLs:**
   - Aplicación: [http://localhost:3000](http://localhost:3000)
   - API y Swagger: [http://localhost:4000/api-docs](http://localhost:4000/api-docs)
   - YAML: [http://localhost:4000/openapi.yaml](http://localhost:4000/openapi.yaml)
4. **Tiempo real:** procedimiento en [Cómo probar el feature de tiempo real](#cómo-probar-el-feature-de-tiempo-real) (dos pestañas, misma `X-Client-Id`).
5. **Tests (opcional):** [Tests](#tests) en máquina host con Node 20+; la imagen Docker de producción no incluye runners de test.

Recorrido ampliado (Docker, Grafana/Loki, `curl`, diagramas): [docs/GUIA_ENTREGA.md](docs/GUIA_ENTREGA.md). Contrato HTTP de referencia: [docs/openapi.yaml](docs/openapi.yaml).

---

## Decisiones técnicas

- **Backend:** NestJS + TypeScript, arquitectura **hexagonal** (dominio y casos de uso sin acoplarse a HTTP, ORM ni sockets; puertos en `application/ports`, adaptadores en `infrastructure`).
- **Logs:** acceso HTTP (`context: Http`, método, ruta, `statusCode`, duración) y eventos socket (`context: Socket`) en **JSON por línea** cuando `STRUCTURED_LOGS=true` (activado en `docker-compose.yml` para el servicio `backend`). Errores de dominio mapeados a HTTP se registran en el filtro con el mismo formato.
- **Persistencia:** TypeORM + PostgreSQL. El [`backend/Dockerfile`](backend/Dockerfile) usa un **CMD condicional:** si `TYPEORM_SYNC=true` (como en [`docker-compose.yml`](docker-compose.yml)), solo arranca `node dist/main.js` y Nest sincroniza el esquema; si no, ejecuta antes `migration:run` contra [`data-source.ts`](backend/src/infrastructure/persistence/data-source.ts) compilado en `dist/` y después levanta la API.
- **Usuario / cliente:** sin autenticación real. Cada navegador envía **`X-Client-Id`** (UUID en `localStorage`, ver `frontend/src/utils/clientId.ts`) en REST y en **`auth.clientId`** al conectar Socket.IO. Sin cabecera, el backend usa el id **`default`**. Los favoritos se guardan en BD con columna `clientId` y unicidad `(clientId, pokemonId)`.
- **Favoritos duplicados:** mismo `pokemonId` dos veces → respuesta **409 Conflict**.
- **Frontend:** React + Vite; llamadas al backend propio; cliente Socket.IO con URL base `VITE_API_URL`.
- **Tiempo real:** el backend emite `favorite:added`, `favorite:removed` y `favorite:updated` (esta última al editar nota). Los payloads incluyen `favoriteId`, `pokemonId`, `note`, `createdAt` cuando aplica.

### Seguridad y límites (demo)

- **CORS:** orígenes permitidos vienen de la variable **`CORS_ORIGINS`** (coma-separada). En Docker hay valores por defecto en [`docker-compose.yml`](docker-compose.yml), sobrescribibles con un `.env` en la raíz del repo (véase [.env.example](.env.example)); vacío en desarrollo puede ser permisivo según [`config/cors-config.ts`](backend/src/config/cors-config.ts). Se permiten cabeceras **`X-Client-Id`** y **`Content-Type`** en preflight.
- **Listado Pokémon:** query `limit` está acotada entre **1 y 100** en [`pokemon.controller.ts`](backend/src/presentation/pokemon.controller.ts).
- **Dos pestañas en el mismo navegador** comparten el mismo `X-Client-Id` (misma lista). **Dos perfiles o dispositivos** con ids distintos tienen listas independientes.

---

## Requisitos previos

- **Docker** 24+ y Docker Compose v2 (`docker compose`).

---

## Instalación y ejecución con Docker (recomendado)

Desde la raíz del repositorio:

```bash
cp .env.example .env
docker compose up --build
```

El primer arranque construye las imágenes y levanta por defecto **`db`**, **`backend`** y **`frontend`** (véase [`docker-compose.yml`](docker-compose.yml)). **pgAdmin**, **Loki**, **Promtail** y **Grafana** son opcionales, perfil **`full`**: `docker compose --profile full up --build`.

Cuando los servicios estén listos:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend HTTP/Socket.IO: [http://localhost:4000](http://localhost:4000)
- PostgreSQL: puerto **5432** en el host (credenciales según `docker-compose.yml` / [.env.example](.env.example)).
- pgAdmin (solo perfil `full`): [http://localhost:5050](http://localhost:5050); al registrar el servidor PostgreSQL, **Host** = nombre del servicio **`db`**, no `localhost`.

Variables: [.env.example](.env.example) (bloque **Docker Compose** lista las claves interpolables).

### Desarrollo local (sin Docker)

Opcional frente al stack con contenedores: PostgreSQL en el host (base `pokemon`), variables según [.env.example](.env.example); `npm install` y `npm run start:dev` en `backend/`; en `frontend/` `npm install`, `frontend/.env.local` con `VITE_API_URL=http://localhost:4000` y `npm run dev`.

---

## Puertos

| Servicio | Puerto (host) | Notas |
|----------|----------------|--------|
| Frontend | 3000 | |
| Backend API + WebSocket | 4000 | |
| PostgreSQL | 5432 | |
| pgAdmin | 5050 | solo con `--profile full` |
| Grafana | 3010 | solo con `--profile full` |
| Loki | 3100 | solo con `--profile full` |

Perfil opcional, variables y pgAdmin paso a paso: [docs/HERRAMIENTAS.md](docs/HERRAMIENTAS.md).

---

## Cómo probar el feature de tiempo real

1. Con el stack en marcha (`docker compose up`), abre **dos pestañas** en `http://localhost:3000`.
2. En la pestaña A, **Pokémon** → detalle → **Añadir a favoritos** (o opera desde **Favoritos**).
3. En la pestaña B, abre **Favoritos**: la lista debe **actualizarse sola** sin recargar si A crea, elimina o cambia una nota.
4. Opcional: **toast** abajo a la derecha cuando el cambio viene de la otra pestaña (no suele duplicarse para la propia acción reciente en la misma pestaña).
5. En los **logs del backend** deben verse conexión/desconexión de sockets y emisión de eventos (requisito del enunciado).

---

## Endpoints del backend

Prefijo: ninguno (raíz).

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/pokemon` | Lista paginada (`offset`, `limit`; default limit 20, máx. 100) |
| GET | `/pokemon/:id` | Detalle normalizado (id numérico o nombre) |
| GET | `/favorites` | Lista de favoritos |
| POST | `/favorites` | Crea favorito (`pokemonId`, `pokemonName`, `imageUrl`, `note` opcional; ver OpenAPI) |
| DELETE | `/favorites/:id` | Elimina por UUID del favorito |
| PATCH | `/favorites/:id` | Actualiza nota (`note`: string o null) |

### Eventos Socket.IO

| Evento | Payload (resumen) |
|--------|-------------------|
| `favorite:added` | `clientId`, `favoriteId`, `pokemonId`, `note`, `createdAt`, … |
| `favorite:removed` | `clientId`, `favoriteId`, `pokemonId` |
| `favorite:updated` | `clientId`, `favoriteId`, `pokemonId`, `note`, `createdAt`, … |

Emisión acotada a la sala del mismo `clientId` que en `auth` al conectar.

**Contrato HTTP (OpenAPI 3):** referencia en [docs/openapi.yaml](docs/openapi.yaml); en runtime la copia desplegada es [`backend/openapi.yaml`](backend/openapi.yaml) (`GET /openapi.yaml`). **Swagger UI:** [http://localhost:4000/api-docs](http://localhost:4000/api-docs) con el backend en marcha.

---

## Tests

Los tests **no son obligatorios** en el enunciado, pero demuestran regresión rápida sobre casos de uso (backend), utilidades compartidas, un camino HTTP real (e2e) y comportamiento de hooks/UI (frontend).

**Dónde ejecutarlos:** las imágenes Docker usan `npm ci --omit=dev`: **no** incluyen Jest ni Vitest. Corre todo en el **host** con **Node.js 20+** y `npm install` en cada carpeta (`backend/`, `frontend/`) la primera vez.

### Backend — unitarios (Jest)

Ejercitan **casos de uso** de favoritos con puertos simulados (`application/use-cases/*.spec.ts`) y la utilidad **`TtlCache`** (`infrastructure/common/ttl-cache.spec.ts`). Variables de entorno típicas: [.env.example](.env.example) en la raíz (según cómo Jest cargue la config del proyecto; si falla por BD, levanta PostgreSQL como para desarrollo).

```bash
cd backend && npm test
```

### Backend — e2e (Jest + Supertest)

Levantan la aplicación Nest con [`AppModule`](backend/src/app.module.ts) y llaman HTTP reales. El spec actual comprueba que **`GET /favorites`** responde **200** y un **array** ([`test/app.e2e-spec.ts`](backend/test/app.e2e-spec.ts)). **PostgreSQL debe estar en marcha** con la misma configuración que usarías para `npm run start:dev` en `backend/`. Config: [`jest-e2e.config.cjs`](backend/jest-e2e.config.cjs).

```bash
cd backend && npm run test:e2e
```

**Opcional:** `npm run test:all` en `backend/` ejecuta unitarios y e2e seguidos (`npm test && npm run test:e2e`); solo tiene sentido si Postgres está disponible para la parte e2e.

### Frontend (Vitest + Testing Library)

Prueban hooks de favoritos, socket simulado, listado/detalle Pokémon y fragmentos de UI (paginación, vista de favoritos). Configuración: [`frontend/vite.config.ts`](frontend/vite.config.ts); matchers DOM: [`frontend/src/test-setup.ts`](frontend/src/test-setup.ts).

```bash
cd frontend && npm test
```

| Área | Ubicación típica |
|------|------------------|
| Hooks favoritos / socket | `frontend/src/features/favorites/*.test.tsx` |
| Lista y detalle Pokémon | `frontend/src/features/pokemon-list/`, `pokemon-detail/` |
| UI favoritos / paginación | `features/favorites/FavoritesView.test.tsx`, `shared/components/ListPaginationFooter.test.tsx` |

---

## Estructura del monorepo

- `backend/` — NestJS hexagonal (`domain`, `application`, `infrastructure`, `presentation`; módulos `favorites`, `pokemon`, TypeORM).
- `frontend/` — React + Vite.
- `docker-compose.yml` — stack por defecto `db`, `backend`, `frontend`; perfil **`full`** para pgAdmin + observabilidad; healthcheck del backend antes del frontend.
- `observability/` — Loki, Promtail, provisioning Grafana.
- `docs/` — [GUIA_ENTREGA.md](docs/GUIA_ENTREGA.md), [HERRAMIENTAS.md](docs/HERRAMIENTAS.md) y [openapi.yaml](docs/openapi.yaml) (referencia; la API sirve [`backend/openapi.yaml`](backend/openapi.yaml)).

---

## Observabilidad opcional (perfil full)

No forma parte del requisito mínimo del enunciado. Mismo [`docker-compose.yml`](docker-compose.yml): Grafana en [http://localhost:3010](http://localhost:3010) (credenciales demo en [.env.example](.env.example)). Consultas LogQL de ejemplo:

```logql
{container=~".*backend.*"} | json | context="Socket"
```

```logql
{container=~".*backend.*"} | json | statusCode >= 400
```

Con `docker compose up` **sin** `--profile full` no se descargan pgAdmin ni stack Loki/Grafana (menos pulls si Docker Hub va lento). Detalle: [docs/HERRAMIENTAS.md](docs/HERRAMIENTAS.md).

---

## Docker build falla: DNS / `registry-1.docker.io`

Si aparece un error de resolución tipo:

`lookup registry-1.docker.io on [fe80::1%...]:53: ... connection refused`

suele ser el **resolvedor DNS del sistema** (p. ej. `nameserver fe80::1` en `/etc/resolv.conf`).

**Opciones:**

1. **Docker:** en `/etc/docker/daemon.json`, añadir `"dns": ["8.8.8.8", "8.8.4.4"]` (o la IP del router), `sudo systemctl restart docker`, volver a construir.
2. **Sistema:** DNS públicos fiables o corregir IPv6 roto en la configuración de red.

El fallo ocurre al resolver Docker Hub, **antes** de ejecutar el código del proyecto. El stack mínimo solo requiere PostgreSQL externo y builds locales de backend/frontend.
