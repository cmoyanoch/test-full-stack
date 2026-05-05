# ADR-0001: Elección del stack y arquitectura base

- **Status**: Accepted
- **Fecha**: 2026-04
- **Contexto**: prueba técnica Senior Full Stack — entrega en una semana

## Contexto

El enunciado ([docs/prueba_tecnica_labs.md](../prueba_tecnica_labs.md)) pide una aplicación full stack que consuma PokéAPI, mantenga un CRUD de favoritos persistido y propague cambios en tiempo real entre clientes vía sockets, todo dockerizado.

El foco declarado del evaluador no es la complejidad funcional, sino "buenas prácticas de programación, manejo de estado, comunicación cliente-servidor y conocimientos de despliegue con contenedores". El stack permitido es amplio: Node con Express o NestJS para backend; React, Vue o Angular para frontend; relacional o NoSQL ligero para datos; Socket.IO recomendado.

Esto plantea dos tensiones a resolver:

1. **Velocidad vs. señalización de seniority**: una semana es poco para sobre-ingeniería, pero la prueba evalúa criterio. Hay que entregar funcional y a la vez dejar evidencia de decisiones conscientes.
2. **Acoplamiento accidental vs. extensibilidad**: el alcance es chico (un CRUD + sockets), pero el rol al que postula es "Senior con proyección a Arquitectura". Mostrar separación de responsabilidades y testabilidad pesa más que ahorrar boilerplate.

## Decisión

| Capa | Elección | Versión |
|------|---------|---------|
| Backend framework | **NestJS** + TypeScript | 10.x |
| Arquitectura backend | **Hexagonal** (domain / application / infrastructure / presentation) | — |
| ORM | **TypeORM** | 0.3.x |
| Base de datos | **PostgreSQL** dockerizado | 16-alpine |
| Cliente HTTP externo | **Axios** vía `@nestjs/axios` | — |
| Realtime | **Socket.IO** + `@nestjs/websockets` | 4.x |
| Frontend framework | **React** | 18.x |
| Build/dev frontend | **Vite** | 6.x |
| UI kit | **MUI (Emotion)** | 9.x |
| Tests backend | **Jest** (unit) + **Jest + Supertest** (e2e) | — |
| Tests frontend | **Vitest** + Testing Library | — |
| Observabilidad opcional | **Loki + Promtail + Grafana** (perfil `full`) — *ampliado en [ADR-0002](0002-observabilidad-tres-pilares.md) con Prometheus, Tempo y OpenTelemetry* | — |
| Documentación HTTP | **Swagger UI** servida por backend + `openapi.yaml` versionado | — |
| Multi-tenant ligero | Cabecera `X-Client-Id` + columna `clientId` en `favorites` | — |

## Alternativas consideradas

### Backend: NestJS vs. Express puro vs. Fastify

- **Express puro**: descartado. Habría que montar a mano DI, validación, estructura modular, gateways de WebSocket. Más rápido para tirar 4 endpoints, pero el resultado se ve "junior" y obliga a defender más código en code review.
- **Fastify**: descartado. Mejor performance bruta, pero ecosistema NestJS para WebSockets + Swagger UI + módulos más rico para esta prueba.
- **NestJS** elegido por DI nativa, decoradores, filtros de excepción, gateways Socket.IO de primera clase y por hablar el mismo idioma que un evaluador senior.

### Frontend: React vs. Vue 3 vs. Angular

- **Vue 3 + Vite + Pinia + PrimeVue**: era la opción más alineada con mi experiencia productiva más reciente (Sercol Ltda., Diciembre 2025–actualidad). La oferta laboral menciona "Angular o Vue", y el CV ya cubre Vue.
- **Angular**: descartado por tiempo de configuración (más boilerplate, RxJS para algo que no lo necesita).
- **React + Vite + MUI** elegido por velocidad de prototipado, dominio personal, ecosistema MUI maduro para entregar UI presentable sin tiempo de diseño y porque la prueba lista React explícitamente como opción válida. **Trade-off conocido**: el stack productivo de la oferta puede ser Vue/Angular; la decisión se justifica aquí y en [README.md](../../README.md). Si el equipo evaluador prefiere Vue, el dominio existe y el port es de 1–2 días.

### ORM: TypeORM vs. Prisma vs. Drizzle vs. Knex

- **Prisma**: ergonomía superior, pero su `client` generado y migraciones imponen un modelo opinado que choca con un patrón Repository hexagonal limpio. Habría que envolverlo igual.
- **Drizzle**: muy moderno, comunidad pequeña aún en producción real para Postgres + NestJS.
- **Knex** + query builder: demasiado bajo nivel para el alcance.
- **TypeORM** elegido por integración nativa con NestJS (`@nestjs/typeorm`), soporte de entidades + repositorios, opción de `synchronize: true` para demo y migraciones para producción real (ver `CMD` condicional en [backend/Dockerfile](../../backend/Dockerfile)).

### Base de datos: PostgreSQL vs. MongoDB vs. SQLite

- **MongoDB**: no aporta nada aquí; el modelo es relacional simple (un cliente, muchos favoritos, unicidad por par).
- **SQLite**: tentador por lo embebido, pero la oferta menciona Postgres explícitamente y dockerizar Postgres es trivial.
- **PostgreSQL** elegido por estándar industrial, JSONB disponible si hace falta, y porque la unicidad `(clientId, pokemonId)` se modela limpia con un índice único.

### Realtime: Socket.IO vs. ws nativo vs. SSE

- **ws nativo**: más liviano, pero pierdes salas, fallback y reconexión automática.
- **SSE**: unidireccional, no encaja con el flujo CRUD compartido.
- **Socket.IO** elegido por ser el recomendado por el enunciado y por las salas (`clientRoomName(clientId)`) que aíslan multi-tenant sin lógica adicional.

### Logs: Loki + Promtail vs. ELK vs. solo console

- **ELK**: pesado de levantar localmente, demasiado para una prueba.
- **Solo console**: cumple el mínimo del enunciado pero no señala madurez.
- **Loki + Promtail + Grafana** elegido por liviandad ("logs como datos"), perfil opcional para no estorbar el arranque mínimo, y porque deja sembrada la infraestructura de observabilidad.

### Identidad de cliente: JWT vs. cabecera opaca

- **JWT/OAuth**: sobre-ingeniería para una prueba sin auth real.
- **Cabecera `X-Client-Id`** opaca + `clientId` en BD: cumple multi-tenant ligero, sin asumir esquema de auth concreto y permite migrar a JWT decodificando `sub` -> `clientId` sin tocar el dominio.

## Consecuencias

### Positivas

- Dominio puro y casos de uso testables sin levantar HTTP/BD; los unit tests en [backend/src/application/use-cases/](../../backend/src/application/use-cases/) usan repositorios y notificadores mockeados.
- Cambiar Postgres por otro motor implica escribir un nuevo adaptador, no reescribir la app.
- Swagger UI vivo + `openapi.yaml` versionado dan contrato consultable por el evaluador en `http://localhost:4000/api-docs`.
- Observabilidad lista para extenderse a métricas (Prometheus) y trazas (OpenTelemetry) sin replantear la arquitectura.

### Negativas / costo asumido

- **Hexagonal en un CRUD pequeño** introduce capas que un MVC plano no necesita. Justificable porque la prueba es vitrina de criterio, no producción real.
- **Dos copias del `openapi.yaml`** (referencia en `docs/`, copia desplegable en `backend/`) requieren disciplina manual para mantenerse alineadas. Decisión consciente para que el binario Docker sea autocontenido.
- **React en una vacante con Angular/Vue**: documentado en este ADR y en el README. Trade-off elegido por velocidad y dominio.
- **`synchronize: true` en demo** facilita arranque pero no es seguro en producción; el `CMD` condicional del Dockerfile cambia a `migration:run` cuando `TYPEORM_SYNC=false`.
