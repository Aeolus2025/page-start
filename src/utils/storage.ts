const prefix = 'page-start-';

export function getItem(key: string): string | null {
  try {
    return localStorage.getItem(prefix + key);
  } catch {
    return null;
  }
}

export function setItem(key: string, value: string | number | boolean | object): void {
  try {
    const v = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(prefix + key, v);
  } catch (_) {}
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(prefix + key);
  } catch (_) {}
}
