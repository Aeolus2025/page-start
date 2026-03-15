/**
 * 快捷方式 Store：增删改查，持久化到 localStorage（key: shortcuts）。
 */
import { defineStore } from 'pinia';
import { getItem, setItem } from '@/utils/storage';
import type { ShortcutItem } from '@/types';

const STORAGE_KEY = 'shortcuts';

function loadShortcuts(): ShortcutItem[] {
  try {
    const raw = getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed = JSON.parse(raw as string);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is ShortcutItem =>
        x &&
        typeof x.id === 'string' &&
        typeof x.name === 'string' &&
        typeof x.url === 'string' &&
        typeof x.icon === 'string'
    );
  } catch {
    return [];
  }
}

function saveShortcuts(list: ShortcutItem[]) {
  setItem(STORAGE_KEY, list);
}

function genId(): string {
  return `sc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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
    }
  }
});
