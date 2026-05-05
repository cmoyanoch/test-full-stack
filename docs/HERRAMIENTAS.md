# Herramientas opcionales: pgAdmin y Grafana (Docker)

Guía consolidada para **pgAdmin** y el stack **Grafana + Loki + Promtail** definidos en [`docker-compose.yml`](../docker-compose.yml). No son obligatorios para ejecutar la aplicación (listado Pokémon, favoritos, Socket.IO).

## Resumen de perfiles

| Perfil | Servicios | Puerto en el host |
|--------|-----------|-------------------|
| *(ninguno)* | `db`, `backend`, `frontend` | 3000, 4000, 5432 |
| `full` | + `pgadmin`, `loki`, `promtail`, `grafana` | 5050, 3100, 3010 |

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

## Grafana y Loki (perfil `full`)

### Qué se configura en Docker

- **Grafana:** usuario y contraseña de administrador con `GF_SECURITY_ADMIN_USER` y `GF_SECURITY_ADMIN_PASSWORD` (por defecto `admin` / `admin` en el YAML; sobrescribibles vía `.env`, véase [.env.example](../.env.example)).
- **Datasource Loki:** provisionado al arrancar desde [`observability/grafana/provisioning/datasources/loki.yml`](../observability/grafana/provisioning/datasources/loki.yml) (URL interna `http://loki:3100`; no es necesario crear el datasource a mano).
- **Loki:** configuración en [`observability/loki-config.yaml`](../observability/loki-config.yaml), datos en volumen `loki-data`.
- **Promtail:** lee logs de contenedores Docker vía socket del host; en [`observability/promtail-config.yml`](../observability/promtail-config.yml) solo se conservan streams cuyo nombre de contenedor coincide con `.*backend.*`.

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

### Si no ves líneas en Loki

- Confirma que el contenedor **backend** está en ejecución y que genera logs.
- Promtail requiere acceso a `/var/run/docker.sock` (ya montado en compose).
- El nombre del contenedor del backend debe ser reconocible por la expresión `.*backend.*` (convención habitual de Docker Compose).

---

## Referencias cruzadas

- Tabla de puertos y fragmentos LogQL: [README principal Puertos y observabilidad](../README.md).
- Recorrido de entrega con prueba en Grafana: [GUIA_ENTREGA.md](GUIA_ENTREGA.md).
