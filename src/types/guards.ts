import type { ShortcutItem } from './index';

export function isShortcutItem(x: unknown): x is ShortcutItem {
  const v = x as ShortcutItem;
  return (
    !!x &&
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    typeof v.url === 'string' &&
    typeof v.icon === 'string' &&
    (v.disableAutoIcon === undefined || typeof v.disableAutoIcon === 'boolean')
  );
}
