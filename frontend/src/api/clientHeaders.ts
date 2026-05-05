import { getOrCreateClientId } from '../utils/clientId';

export function clientHeaders(): Record<string, string> {
  return { 'X-Client-Id': getOrCreateClientId() };
}
