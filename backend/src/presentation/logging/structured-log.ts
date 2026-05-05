/** Logs en una línea JSON (útil para Loki/Promtail) o formato legible en desarrollo. */

export type LogLevel = 'log' | 'error' | 'warn' | 'debug';

export function useStructuredLogs(): boolean {
  const v = process.env.STRUCTURED_LOGS?.toLowerCase();
  if (v === 'true' || v === '1') return true;
  if (v === 'false' || v === '0') return false;
  return process.env.NODE_ENV === 'production';
}

export function structuredLog(
  level: LogLevel,
  context: string,
  msg: string,
  extra?: Record<string, unknown>,
): void {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    context,
    msg,
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
