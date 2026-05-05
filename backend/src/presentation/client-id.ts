/** Longitud máxima del identificador opaco enviado por el cliente. */
const MAX_LEN = 64;

export const DEFAULT_CLIENT_ID = 'default';

/**
 * Normaliza el valor de `X-Client-Id` (o el enviado por socket en `auth`).
 * Cadena vacía o ausente → `default` (CI, herramientas sin header).
 */
export function resolveClientId(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) {
    return resolveClientId(value[0]);
  }
  if (value === undefined || value === null) {
    return DEFAULT_CLIENT_ID;
  }
  const t = String(value).trim();
  if (!t) {
    return DEFAULT_CLIENT_ID;
  }
  return t.slice(0, MAX_LEN);
}

export function clientRoomName(clientId: string): string {
  return `user:${clientId}`;
}
