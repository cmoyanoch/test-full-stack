/** Logs en una línea JSON (útil para Loki/Promtail) o formato legible en desarrollo. */

import { trace } from '@opentelemetry/api';

export type LogLevel = 'log' | 'error' | 'warn' | 'debug';

export function useStructuredLogs(): boolean {
  const v = process.env.STRUCTURED_LOGS?.toLowerCase();
  if (v === 'true' || v === '1') return true;
  if (v === 'false' || v === '0') return false;
  return process.env.NODE_ENV === 'production';
}

/**
 * Devuelve traceId/spanId del span activo, si OTel está cargado y hay un span en curso.
 * Si no hay SDK ni span (tests, dev local sin compose), no agrega nada al log.
 */
function activeTraceContext(): { traceId: string; spanId: string } | undefined {
  const span = trace.getActiveSpan();
  const ctx = span?.spanContext();
  if (!ctx || !ctx.traceId) return undefined;
  return { traceId: ctx.traceId, spanId: ctx.spanId };
}

export function structuredLog(
  level: LogLevel,
  context: string,
  msg: string,
  extra?: Record<string, unknown>,
): void {
  const traceCtx = activeTraceContext();
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    context,
    msg,
    ...(traceCtx ?? {}),
    ...extra,
  };
  const line = JSON.stringify(payload);
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export function appLog(
  level: LogLevel,
  context: string,
  msg: string,
  extra?: Record<string, unknown>,
): void {
  if (useStructuredLogs()) {
    structuredLog(level, context, msg, extra);
    return;
  }
  const nestLike = `[${context}] ${msg}${
    extra && Object.keys(extra).length
      ? ` ${JSON.stringify(extra)}`
      : ''
  }`;
  if (level === 'error') console.error(nestLike);
  else if (level === 'warn') console.warn(nestLike);
  else console.log(nestLike);
}
