import type { ShortcutItem } from './index';

export function isShortcutItem(x: unknown): x is ShortcutItem {
  return (
    !!x &&
    typeof (x as ShortcutItem).id === 'string' &&
    typeof (x as ShortcutItem).name === 'string' &&
    typeof (x as ShortcutItem).url === 'string' &&
    typeof (x as ShortcutItem).icon === 'string'
  );
}

