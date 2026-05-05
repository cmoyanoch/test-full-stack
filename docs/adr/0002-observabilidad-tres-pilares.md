# ADR-0002: Observabilidad como tres pilares correlacionados

- **Status**: Accepted
- **Fecha**: 2026-05
- **Contexto**: extensión del ADR-0001 con stack completo de observabilidad bajo `--profile full`

## Contexto

[ADR-0001](0001-eleccion-de-stack.md) dejó cerrado el stack base con logs estructurados (Loki + Promtail + Grafana) y `prom-client` exponiendo `/metrics`, pero sin Prometheus ni trazas. La sección "Cómo escalaríamos esto a producción" del [README](../../README.md) prometía los tres pilares correlacionados; este ADR implementa esa promesa para que cualquier evaluador pueda verlos en marcha con un solo comando.

Restricciones que pesaron en la decisión:

1. **No replantear arquitectura**. La hexagonal del ADR-0001 obliga a que toda nueva preocupación sea un adaptador en `infrastructure/` o un middleware en `presentation/`.
2. **Mantener arranque mínimo ligero**. `docker compose up` (sin perfil) sigue siendo db + backend + frontend.
3. **No romper tests**. Jest unitarios y e2e con Testcontainers no deben intentar conectar a un collector inexistente.
4. **Demo-grade pero realista**. El stack debe parecerse al de producción para que el discurso ante el evaluador sea genuino.

## Decisión

Stack productivo bajo el perfil `full` existente:

| Pilar | Componente | Origen | Sink | Datasource Grafana |
|-------|-----------|--------|------|--------------------|
| Logs | `appLog()` JSON → stdout → Promtail | backend container | Loki | `loki` |
| Métricas | `prom-client` → `GET /metrics` | backend HTTP | Prometheus | `prometheus` |
| Trazas | `@opentelemetry/sdk-node` (auto-instr.) → OTLP/HTTP | backend Node | OTel Collector → Tempo | `tempo` |

**Correlación bidireccional**:

- Loki tiene un `derivedFields` que convierte el `traceId` del JSON en un enlace clicable a Tempo.
- Tempo tiene `tracesToLogsV2` que abre Loki filtrado por `traceId="..."` desde cualquier span.

Dashboard "Golden Signals" provisionado en Grafana con cinco paneles (latencia p50/p95/p99 por ruta, RPS por ruta, errores 4xx, errores 5xx, saturación RSS + event loop lag, eventos Socket.IO).

## Alternativas consideradas

### Tempo vs. Jaeger

- **Jaeger** es el stack histórico de OpenTracing/OpenTelemetry, UI familiar.
- **Tempo** se eligió por integración nativa con Grafana (un solo cockpit para los tres pilares), `tracesToLogsV2` ya soportado, y porque permite usar TraceQL en el mismo lenguaje de query que el resto del ecosistema. Jaeger habría requerido una UI separada y plugin adicional para correlación con Loki.

### OTel Collector entre backend y Tempo vs. backend → Tempo directo

Tempo tiene receptores OTLP nativos. En este demo el Collector es **pass-through** y, en estricta lógica, sobra. Aun así se incluyó porque:

- Es el patrón productivo: en cuanto se quiere **batching, sampling head/tail centralizado, multi-export (Tempo + APM SaaS), redacción de PII o métricas derivadas de spans**, el Collector deja de ser opcional.
- Quitarlo y volver a meterlo después de adoptar el patrón implicaría reconfigurar el endpoint OTLP en todos los servicios. Dejarlo desde el inicio aísla al backend de cambios futuros: el backend siempre habla a `otel-collector:4318`, lo que el Collector haga con esos spans es decisión operativa, no de código.
- En una entrevista, mostrar el Collector explica que se entiende la diferencia entre instrumentación (SDK) y pipeline de telemetría (Collector).

Trade-off aceptado: ~150 MB extra de RAM y una pieza más en el `docker compose ps`.

### Prometheus directo vs. via Collector

El Collector también podría hacer `prometheus_receiver` y `prometheusremotewrite_exporter`. Se descartó:

- `/metrics` ya está expuesto por `prom-client` en el backend. Prometheus scrapeando directo es una flecha menos en el diagrama.
- Para metrics_generator basado en spans (RED metrics derivadas de Tempo) sí valdría la pena meter al Collector, pero queda fuera de alcance del demo.

### Sampling 100% vs. parent-based

`OTEL_TRACES_SAMPLER=always_on` en el demo. En producción debería ser `parentbased_traceidratio` con un ratio del 1-10% para servicios de alto tráfico. Se documenta pero no se aplica para que el evaluador vea trazas consistentes con poco tráfico.

### Habilitar OTel siempre vs. gating triple

Se eligió un **triple gate** en [`tracing.ts`](../../backend/src/infrastructure/observability/tracing.ts):

```ts
if (process.env.OTEL_ENABLED === 'false') return false;
if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) return false;
if (process.env.NODE_ENV === 'test') return false;
```

Razones:

- **Tests**: Jest unitarios + e2e (Testcontainers) no necesitan OTel y un timeout de 30s al collector inexistente convierte cada run en una pesadilla.
- **Dev local sin compose**: alguien puede hacer `npm run start:dev` con Postgres en host. Sin endpoint, el SDK simplemente no arranca.
- **Kill switch en prod**: si el collector se cae, `OTEL_ENABLED=false` permite reiniciar el backend sin trazas pero saludable, sin tener que redeploy.

### Promtail keep regex inalterado

Promtail sigue filtrando `*backend*` ([observability/promtail-config.yml](../../observability/promtail-config.yml)). Los nuevos contenedores (`prometheus`, `tempo`, `otel-collector`) no llegan a Loki — sus logs operacionales se ven con `docker compose logs <servicio>` y normalmente no aportan al evaluador. Si en el futuro hace falta debug, el cambio es un regex.

## Consecuencias

### Positivas

- **Arquitectura intacta**: cero cambios en `domain/` o `application/`. La instrumentación vive 100% en `infrastructure/observability/` y `presentation/logging/`.
- **Demostrable end-to-end** con un solo comando: `docker compose --profile full up`.
- **Discurso de Arquitectura listo**: tres pilares + correlación + Collector como "puerta a producción" (batching, sampling, multi-export).
- **Listo para escalar**: el `OTEL_EXPORTER_OTLP_ENDPOINT` apunta hoy al Collector local; mañana puede apuntar a Grafana Cloud, Datadog Agent, Honeycomb, etc., sin tocar código.

### Negativas / costo asumido

- **Memoria/CPU**: el stack `--profile full` pesa ~600 MB extra (Prometheus + Tempo + Collector). Aceptable para demo, opt-in.
- **Acoplamiento al ecosistema Grafana**: Loki + Tempo + Prometheus es muy LGTM-céntrico. Migrar a otro vendor (Datadog, New Relic) implica replantear datasources y dashboards, aunque el código del backend sigue agnóstico.
- **OTel SDK obliga al primer-import**: comentario explícito en [`main.ts`](../../backend/src/main.ts) y validación visual en code review. Si alguien añade un import antes, las auto-instrumentaciones se rompen silenciosamente.
- **Sampling 100%** llena disco rápido si se deja corriendo días. Mitigado con `block_retention: 24h` en Tempo, pero no es solución productiva.
- **Tempo storage local** no es válido en producción (HA, multi-tenant, S3/GCS). Documentado.
- **Versiones OTel cambian rápido**: el upgrade requiere validar que las auto-instrumentaciones siguen siendo compatibles.

## Pendientes (fuera de alcance del ADR)

- Alertmanager + reglas de alerta (5xx > 1%, p95 > 500ms, event loop lag > 100ms).
- Sampling head-based con ratio configurable por entorno.
- Propagación `traceparent` desde el frontend (fetch + Socket.IO handshake) para tener trazas que comiencen en el navegador.
- `metrics_generator` de Tempo para RED metrics derivadas de spans.
- Tests del propio stack de observabilidad (test que verifique que `/metrics` expone las métricas esperadas — *este ya está en el e2e*; pendiente: test que valide spans en Tempo en CI con un mock collector).
