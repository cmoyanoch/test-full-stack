# Herramientas opcionales: pgAdmin, Grafana, Prometheus, Loki y Tempo (Docker)

Guía consolidada para **pgAdmin** y el stack de observabilidad **Grafana + Prometheus + Loki + Promtail + Tempo + OTel Collector** definidos en [`docker-compose.yml`](../docker-compose.yml). No son obligatorios para ejecutar la aplicación (listado Pokémon, favoritos, Socket.IO).

## Resumen de perfiles

| Perfil | Servicios | Puerto en el host |
|--------|-----------|-------------------|
| *(ninguno)* | `db`, `backend`, `frontend` | 3000, 4000, 5432 |
| `full` | + `pgadmin`, `loki`, `promtail`, `grafana`, `prometheus`, `tempo`, `otel-collector` | 5050, 3100, 3010, 9090, 3200 |

Ejemplos:

```bash
# Solo app + API + Postgres
docker compose up --build

# Incluir pgAdmin y observabilidad (Loki, Promtail, Grafana)
docker compose --profile full up --build
```

Variables de entorno: [`.env.example`](../.env.example) en la raíz (Compose interpola `${VAR:-default}`; un `.env` opcional sobrescribe valores del YAML).

---

## pgAdmin (perfil `full`)

### Qué se configura en Docker

- **Credenciales de la aplicación web** (no son las de PostgreSQL): `PGADMIN_DEFAULT_EMAIL` y `PGADMIN_DEFAULT_PASSWORD` en `docker-compose` o en `.env` (valores por defecto en compose: `admin@admin.com` / `admin`).
- **Persistencia** del propio pgAdmin: volumen `pgadmin-data`.

### Paso a paso

1. Levanta el stack con el perfil: `docker compose --profile full up --build`.
2. Abre [http://localhost:5050](http://localhost:5050).
3. Inicia sesión con el email y contraseña de pgAdmin (por defecto o los definidos en `.env`).
4. Registra el servidor PostgreSQL: menú **Object → Register → Server**.
   - **General → Name:** por ejemplo `Pokemon (Docker)`.
   - **Connection:**
     - **Host name/address:** `db` (nombre del servicio en Compose; **no** uses `localhost` desde dentro del contenedor pgAdmin).
     - **Port:** `5432`.
     - **Maintenance database:** el valor de `POSTGRES_DB` (por defecto `pokemon`; véase [.env.example](../.env.example)).
     - **Username:** `POSTGRES_USER` (por defecto `postgres`).
     - **Password:** `POSTGRES_PASSWORD` (por defecto `postgres`; debe coincidir con el servicio `db` en [`docker-compose.yml`](../docker-compose.yml) o tu `.env`).

5. Navega por **Schemas → public** para ver tablas (p. ej. `favorites`).

Si conectas pgAdmin **instalado en tu máquina** (fuera de Docker) al Postgres que expone el host en el puerto 5432, entonces **Host** sería `localhost` — solo en ese caso.

---

## Grafana, Prometheus, Loki y Tempo (perfil `full`)

### Qué se configura en Docker

- **Grafana:** usuario y contraseña de administrador con `GF_SECURITY_ADMIN_USER` y `GF_SECURITY_ADMIN_PASSWORD` (por defecto `admin` / `admin` en el YAML; sobrescribibles vía `.env`, véase [.env.example](../.env.example)).
- **Datasource Loki:** provisionado al arrancar desde [`observability/grafana/provisioning/datasources/loki.yml`](../observability/grafana/provisioning/datasources/loki.yml) (URL interna `http://loki:3100`; no es necesario crear el datasource a mano).
- **Loki:** configuración en [`observability/loki-config.yaml`](../observability/loki-config.yaml), datos en volumen `loki-data`.
- **Promtail:** lee logs de contenedores Docker vía socket del host; en [`observability/promtail-config.yml`](../observability/promtail-config.yml) solo se conservan streams cuyo nombre de contenedor coincide con `.*backend.*`.
- **Datasource Prometheus:** provisionado desde [`observability/grafana/provisioning/datasources/prometheus.yml`](../observability/grafana/provisioning/datasources/prometheus.yml) con URL interna `http://prometheus:9090` y marcado como *default* (`isDefault: true`); no se edita desde la UI (`editable: false`).
- **Prometheus:** configuración en [`observability/prometheus.yml`](../observability/prometheus.yml). Scrapea cada 15 s el endpoint `/metrics` del backend (target `backend:4000`, etiquetas `service=pokemon-favorites-backend`, `env=demo`). Datos en volumen `prom-data` con retención 24 h.
- **Dashboard "Golden Signals":** provisionado desde [`observability/grafana/provisioning/dashboards/golden-signals.json`](../observability/grafana/provisioning/dashboards/golden-signals.json) (latencia p50/p95/p99 por ruta, tráfico RPS, errores 4xx/5xx, saturación RSS + event loop lag).
- **Datasource Tempo:** provisionado desde [`observability/grafana/provisioning/datasources/tempo.yml`](../observability/grafana/provisioning/datasources/tempo.yml). Habilita correlación traza→logs (`tracesToLogsV2` filtrando por `traceId` en Loki) y *service map* contra Prometheus.

El backend debe tener **`STRUCTURED_LOGS=true`** (por defecto en `docker-compose` para el servicio `backend`) para líneas JSON útiles en Explore.

### Paso a paso

1. Levanta el stack con el perfil: `docker compose --profile full up --build`.
2. Abre Grafana en [http://localhost:3010](http://localhost:3010).
3. Inicia sesión (`admin` / `admin` si no cambiaste `GF_SECURITY_ADMIN_*`).
4. Ve a **Explore**, elige el datasource **Loki**.
5. Ejemplos de consultas **LogQL**:

```logql
{container=~".*backend.*"} | json | context="Socket"
```

```logql
{container=~".*backend.*"} | json | statusCode >= 400
```

6. Para métricas, ve a **Dashboards → Pokemon Favorites - Golden Signals** (provisionado automáticamente). Para trazas, **Explore → Tempo** (búsqueda libre o por `traceId` proveniente de un log Loki).

### Verificación rápida (en orden)

1. `curl http://localhost:4000/metrics` debe devolver texto tipo `# HELP http_requests_total ...`. Si falla, el backend no está arriba o no expone `/metrics`.
2. [http://localhost:9090/targets](http://localhost:9090/targets): el job `backend` debe aparecer en estado **UP** (verde). Si está **DOWN**, la causa más común es un error de DNS (debe ser `backend:4000`, **no** `localhost:4000`) o que el backend aún no pasó el healthcheck definido en [`docker-compose.yml`](../docker-compose.yml).
3. En Grafana → **Connections → Data sources** deben aparecer **Prometheus** (marcada *default*), **Loki** y **Tempo** ya configuradas, sin necesidad de crearlas a mano.
4. Dashboards → **Pokemon Favorites - Golden Signals** debería mostrar series tras ~30 s. Si está vacío, dispara tráfico al backend (por ejemplo `curl http://localhost:4000/pokemon` o usa la UI sobre `/favorites`) y espera a que Prometheus complete un par de scrapes.

### Troubleshooting

**Loki sin líneas:**

- Confirma que el contenedor **backend** está en ejecución y que genera logs.
- Promtail requiere acceso a `/var/run/docker.sock` (ya montado en compose).
- El nombre del contenedor del backend debe ser reconocible por la expresión `.*backend.*` (convención habitual de Docker Compose).

**Prometheus target DOWN:**

- Si en `/targets` aparece `connection refused` o `no such host`, revisa que [`observability/prometheus.yml`](../observability/prometheus.yml) apunte a `backend:4000` (DNS de la red Compose), no a `localhost`.
- El servicio `prometheus` declara `depends_on: backend (service_healthy)`; si el backend tarda en responder al healthcheck, Prometheus mostrará el target DOWN durante los primeros segundos.
- Tras editar `observability/prometheus.yml` necesitas reiniciar el servicio: `docker compose restart prometheus` (el archivo se monta `:ro` y solo se relee al arrancar, salvo que actives `--web.enable-lifecycle`).

**Tempo sin trazas:**

- Verifica que el backend tenga la auto-instrumentación OTel activa (ver [`backend/src/infrastructure/observability/tracing.ts`](../backend/src/infrastructure/observability/tracing.ts)) y que la variable `OTEL_EXPORTER_OTLP_ENDPOINT` apunte al collector (`http://otel-collector:4318`).
- El flujo es backend → `otel-collector` → `tempo`. Si el collector no arranca, no hay trazas; revísalo con `docker compose logs otel-collector`.
- En Grafana → Explore → Tempo, prueba primero "Search" sin filtros para descartar problema de query antes que de pipeline.

---

## Referencias cruzadas

- Tabla de puertos y fragmentos LogQL: [README principal Puertos y observabilidad](../README.md).
- Recorrido de entrega con prueba en Grafana: [GUIA_ENTREGA.md](GUIA_ENTREGA.md).
- Decisión arquitectónica de los tres pilares (logs, métricas, trazas): [ADR-0002 Observabilidad](adr/0002-observabilidad-tres-pilares.md).
