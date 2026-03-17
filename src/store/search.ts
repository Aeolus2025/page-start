/**
 * 搜索栏/搜索引擎 Store：隐藏列表、自定义引擎、当前选中引擎。
 * 状态持久化到 localStorage（与 config/shortcuts 同前缀 page-start-）。
 */
import { defineStore } from 'pinia';
import { getItem, setItem } from '@/utils/storage';
import { DEFAULT_ENGINES } from '@/constants/engines';
import type { SearchEngine } from '@/types';
import { StorageKey } from '@/types';

function loadHiddenIds(): string[] {
  try {
    const raw = getItem(StorageKey.HiddenEngineIds);
    if (raw === null) return [];
    const a = JSON.parse(raw as string);
    return Array.isArray(a) ? a.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function loadCustomEngines(): { name: string; url: string }[] {
  try {
    const raw = getItem(StorageKey.CustomEngines);
    if (raw === null || raw === '') return [];
    const a = JSON.parse(raw as string);
    return Array.isArray(a)
      ? a.filter((x) => x && typeof x.name === 'string' && typeof x.url === 'string')
      : [];
  } catch {
    return [];
  }
}

function loadSelectedEngine(): SearchEngine {
  try {
    const raw = localStorage.getItem(StorageKey.SelectedEngine);
    if (!raw) return DEFAULT_ENGINES[0];
    const o = JSON.parse(raw) as { id?: string; name?: string; url?: string };
    const found =
      DEFAULT_ENGINES.find((e) => e.id === o?.id) || DEFAULT_ENGINES.find((e) => e.name === o?.name);
    if (found) return found;
    if (o?.name && o?.url) return { id: 'custom', name: o.name, url: o.url };
    return DEFAULT_ENGINES[0];
  } catch {
    return DEFAULT_ENGINES[0];
  }
}

export interface SearchEnginesExport {
  hiddenEngineIds: string[];
  customEngines: { name: string; url: string }[];
  currentEngine?: { id?: string; name?: string; url?: string };
}

export const useSearchEnginesStore = defineStore('searchEngines', {
  state() {
    return {
      hiddenEngineIds: loadHiddenIds(),
      customEngines: loadCustomEngines(),
      selectedEngine: loadSelectedEngine()
    };
  },
  actions: {
    setHiddenIds(ids: string[]) {
      this.hiddenEngineIds = ids;
      setItem(StorageKey.HiddenEngineIds, ids);
    },
    setCustomEngines(list: { name: string; url: string }[]) {
      this.customEngines = list;
      setItem(StorageKey.CustomEngines, list);
    },
    addCustomEngine(engine: { name: string; url: string }) {
      this.customEngines = [...this.customEngines, engine];
      setItem(StorageKey.CustomEngines, this.customEngines);
    },
    removeCustomEngineAt(index: number) {
      if (index < 0 || index >= this.customEngines.length) return;
      this.customEngines = this.customEngines.filter((_, i) => i !== index);
      setItem(StorageKey.CustomEngines, this.customEngines);
    },
    setSelectedEngine(engine: SearchEngine | null | undefined) {
      if (!engine) return;
      this.selectedEngine = engine;
      try {
        localStorage.setItem(
          StorageKey.SelectedEngine,
          JSON.stringify({ id: engine.id, name: engine.name, url: engine.url })
        );
      } catch {
        // ignore
      }
    },
    /** 仅清空隐藏列表（配置恢复默认时调用） */
    clearHiddenIds() {
      this.setHiddenIds([]);
    },
    /** 恢复搜索引擎为默认：清空隐藏与自定义，选中第一个内置引擎 */
    resetToDefaults() {
      this.setHiddenIds([]);
      this.setCustomEngines([]);
      const first = DEFAULT_ENGINES[0];
      if (first) this.setSelectedEngine(first);
    },
    /** 导出用：返回当前引擎相关数据 */
    getExportData(): SearchEnginesExport {
      return {
        hiddenEngineIds: [...this.hiddenEngineIds],
        customEngines: [...this.customEngines],
        currentEngine: {
          id: this.selectedEngine?.id,
          name: this.selectedEngine?.name,
          url: this.selectedEngine?.url
        }
      };
    },
    /** 导入用：应用引擎相关数据并持久化 */
    applyImport(data: {
      hiddenEngineIds?: unknown;
      customEngines?: unknown;
      currentEngine?: unknown;
    }) {
      if (Array.isArray(data.hiddenEngineIds)) {
        const ids = data.hiddenEngineIds.filter((x): x is string => typeof x === 'string');
        this.setHiddenIds(ids);
      }
      if (Array.isArray(data.customEngines)) {
        const list = data.customEngines.filter(
          (x) => x && typeof x.name === 'string' && typeof x.url === 'string'
        );
        this.setCustomEngines(list);
      }
      const sel = data.currentEngine;
      if (sel && typeof sel === 'object') {
        const s = sel as { id?: unknown; name?: unknown; url?: unknown };
        const payload = {
          id: typeof s.id === 'string' ? s.id : undefined,
          name: typeof s.name === 'string' ? s.name : undefined,
          url: typeof s.url === 'string' ? s.url : undefined
        };
        if (payload.id || payload.name || payload.url) {
          try {
            localStorage.setItem(StorageKey.SelectedEngine, JSON.stringify(payload));
            this.selectedEngine = loadSelectedEngine();
          } catch {
            // ignore
          }
        }
      }
    }
  }
});

