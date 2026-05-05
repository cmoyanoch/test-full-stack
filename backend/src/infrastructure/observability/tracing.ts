/**
 * OpenTelemetry SDK initializer.
 *
 * Auto-instrumentación de HTTP, Express, axios, pg/TypeORM y Socket.IO.
 * Solo arranca si:
 *   - OTEL_ENABLED no es la cadena "false", y
 *   - OTEL_EXPORTER_OTLP_ENDPOINT está definida (apunta al collector), y
 *   - NODE_ENV no es "test".
 *
 * IMPORTANTE: este módulo debe ser el PRIMER import de main.ts: las
 * auto-instrumentaciones parchean require()/import hooks y necesitan
 * cargarse antes que cualquier módulo de Nest, axios, pg, etc.
 *
 * El SDK consume estas variables de entorno:
 *   OTEL_SERVICE_NAME           Nombre del servicio en spans/traces.
 *   OTEL_RESOURCE_ATTRIBUTES    Pares clave=valor extra (deployment.environment=...).
 *   OTEL_EXPORTER_OTLP_ENDPOINT Base URL del receptor OTLP/HTTP. Trazas a /v1/traces.
 *   OTEL_TRACES_SAMPLER         "always_on" en demo; en prod usar "parentbased_traceidratio".
 */
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

function shouldEnable(): boolean {
  if (process.env.OTEL_ENABLED === 'false') return false;
  if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) return false;
  if (process.env.NODE_ENV === 'test') return false;
  return true;
}

if (shouldEnable()) {
  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter(),
    instrumentations: [
      getNodeAutoInstrumentations({
        // El sistema de archivos genera ruido y poco valor en HTTP/CRUD.
        '@opentelemetry/instrumentation-fs': { enabled: false },
      }),
    ],
  });

  try {
    sdk.start();
    // Logger nativo: el módulo de logs estructurados aún no se inicializa aquí.
    console.log(
      `[otel] SDK iniciado, exportando trazas a ${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
    );

    const shutdown = (signal: NodeJS.Signals) => {
      sdk
        .shutdown()
        .catch((err: unknown) => {
          console.error('[otel] error en shutdown', err);
        })
        .finally(() => {
          process.exit(signal === 'SIGTERM' ? 0 : 1);
        });
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    // Si la auto-instrumentación falla, no bloqueamos el arranque del backend.
    console.error('[otel] SDK init failed', err);
  }
}
