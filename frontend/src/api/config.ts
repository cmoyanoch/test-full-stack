export function apiBase(): string {
  const url = import.meta.env.VITE_API_URL;
  return url.replace(/\/$/, '');
}
