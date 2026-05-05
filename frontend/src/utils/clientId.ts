const STORAGE_KEY_V1 = 'pokemon-app-client-id:v1';
const STORAGE_KEY_LEGACY = 'pokemon-app-client-id';

/**
 * UUID persistente por navegador; se envía en `X-Client-Id` y en `auth` de Socket.IO.
 * Si `localStorage` no está disponible, devuelve `default` (alineado al backend).
 */
export function getOrCreateClientId(): string {
  try {
    const legacy = localStorage.getItem(STORAGE_KEY_LEGACY);
    if (legacy) {
      if (!localStorage.getItem(STORAGE_KEY_V1)) {
        localStorage.setItem(STORAGE_KEY_V1, legacy);
      }
      localStorage.removeItem(STORAGE_KEY_LEGACY);
    }
    let id = localStorage.getItem(STORAGE_KEY_V1);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY_V1, id);
    }
    return id;
  } catch {
    return 'default';
  }
}
