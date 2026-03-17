/**
 * 快捷方式 Store：增删改查，持久化到 localStorage（key: shortcuts）。
 */
import { defineStore } from 'pinia';
import { genUniqueId } from '@/utils/id';
import { getJsonArray, setItem } from '@/utils/storage';
import type { ShortcutItem } from '@/types';
import { StorageKey } from '@/types';
import { isShortcutItem } from '@/types/guards';

function loadShortcuts(): ShortcutItem[] {
  return getJsonArray(StorageKey.Shortcuts, isShortcutItem);
}

function saveShortcuts(list: ShortcutItem[]) {
  setItem(StorageKey.Shortcuts, list);
}

function genId(): string {
  return genUniqueId('sc-');
}

export const useShortcutsStore = defineStore('shortcuts', {
  state() {
    return {
      items: loadShortcuts()
    };
  },
  actions: {
    add(item: Omit<ShortcutItem, 'id'>) {
      const full: ShortcutItem = { ...item, id: genId() };
      this.items = [...this.items, full];
      saveShortcuts(this.items);
      return full;
    },
    remove(id: string) {
      this.items = this.items.filter((x) => x.id !== id);
      saveShortcuts(this.items);
    },
    update(id: string, patch: Partial<Omit<ShortcutItem, 'id'>>) {
      const idx = this.items.findIndex((x) => x.id === id);
      if (idx === -1) return;
      this.items = this.items.slice();
      this.items[idx] = { ...this.items[idx], ...patch };
      saveShortcuts(this.items);
    },
    /** 清空所有快捷方式（恢复默认时调用） */
    clearAll() {
      this.items = [];
      saveShortcuts(this.items);
    },
    /** 导入时整体替换列表并持久化 */
    replaceAll(list: ShortcutItem[]) {
      this.items = list.filter(
        (x): x is ShortcutItem =>
          x &&
          typeof x.id === 'string' &&
          typeof x.name === 'string' &&
          typeof x.url === 'string' &&
          typeof x.icon === 'string'
      );
      saveShortcuts(this.items);
    }
  }
});
