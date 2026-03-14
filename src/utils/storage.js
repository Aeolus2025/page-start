const prefix = 'page-start-';

export function getItem(key) {
  try {
    return localStorage.getItem(prefix + key);
  } catch {
    return null;
  }
}

export function setItem(key, value) {
  try {
    const v = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(prefix + key, v);
  } catch (_) {}
}

export function removeItem(key) {
  try {
    localStorage.removeItem(prefix + key);
  } catch (_) {}
}
