/**
 * 搜索栏/搜索引擎 Store：隐藏列表、自定义引擎、当前选中引擎。
 * 状态持久化到 localStorage（与 config/shortcuts 同前缀 page-start-）。
 */
import { defineStore } from 'pinia';
import { getItem, getJsonArray, setItem } from '@/utils/storage';
import { DEFAULT_ENGINES } from '@/constants/engines';
import type { CustomSearchEngine, SearchEngine } from '@/types';
import { StorageKey } from '@/types';
import { genUniqueId } from '@/utils/id';

const LEGACY_SELECTED_ENGINE_KEY = 'page-start-selected-engine';

function loadHiddenIds(): string[] {
  return getJsonArray(StorageKey.HiddenEngineIds, (x): x is string => typeof x === 'string');
}

function isCustomEngineLike(x: unknown): x is { id?: unknown; name: string; url: string } {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return typeof o.name === 'string' && typeof o.url === 'string';
}

function loadCustomEngines(): CustomSearchEngine[] {
  const raw = getJsonArray(StorageKey.CustomEngines, (x): x is unknown => Boolean(x));
  const list = raw.filter(isCustomEngineLike);

  const migrated: CustomSearchEngine[] = list.map((x) => ({
    id: typeof x.id === 'string' && x.id.trim() ? x.id : genUniqueId('ce-'),
    name: String(x.name),
    url: String(x.url),
  }));

  const needsWriteBack =
    migrated.length !== list.length || migrated.some((_, i) => typeof list[i]?.id !== 'string');
  if (needsWriteBack) setItem(StorageKey.CustomEngines, migrated);
  return migrated;
}

function loadSelectedEngine(): SearchEngine {
  try {
    let raw = getItem(StorageKey.SelectedEngine);
    if (raw === null) {
      raw = localStorage.getItem(LEGACY_SELECTED_ENGINE_KEY);
      if (raw) setItem(StorageKey.SelectedEngine, raw as string);
    }
    if (!raw) return DEFAULT_ENGINES[0];
    const o = JSON.parse(raw) as { id?: string; name?: string; url?: string };
    const found =
      DEFAULT_ENGINES.find((e) => e.id === o?.id) ||
      DEFAULT_ENGINES.find((e) => e.name === o?.name);
    if (found) return found;
    const customs = loadCustomEngines();
    // 自定义：优先按稳定 id 匹配
    if (o?.id) {
      const byId = customs.find((c) => c.id === o.id);
      if (byId) return { id: byId.id, name: byId.name, url: byId.url };
    }
    // 兼容旧数据：按 name/url 回退，并回写稳定 id
    if (o?.name && o?.url) {
      const byTuple = customs.find((c) => c.name === o.name && c.url === o.url);
      if (byTuple) {
        setItem(StorageKey.SelectedEngine, {
          id: byTuple.id,
          name: byTuple.name,
          url: byTuple.url,
        });
        return { id: byTuple.id, name: byTuple.name, url: byTuple.url };
      }
      return { id: 'custom', name: o.name, url: o.url };
    }
    return DEFAULT_ENGINES[0];
  } catch {
    return DEFAULT_ENGINES[0];
  }
}

interface SearchEnginesExport {
  hiddenEngineIds: string[];
  customEngines: CustomSearchEngine[];
  currentEngine?: { id?: string; name?: string; url?: string };
}

export const useSearchEnginesStore = defineStore('searchEngines', {
  state() {
    return {
      hiddenEngineIds: loadHiddenIds(),
      customEngines: loadCustomEngines(),
      selectedEngine: loadSelectedEngine(),
    };
  },
  actions: {
    setHiddenIds(ids: string[]) {
      this.hiddenEngineIds = ids;
      setItem(StorageKey.HiddenEngineIds, ids);
    },
    setCustomEngines(list: CustomSearchEngine[]) {
      this.customEngines = list;
      setItem(StorageKey.CustomEngines, list);
    },
    addCustomEngine(engine: { name: string; url: string }) {
      const full: CustomSearchEngine = { id: genUniqueId('ce-'), ...engine };
      this.customEngines = [...this.customEngines, full];
      setItem(StorageKey.CustomEngines, this.customEngines);
    },
    removeCustomEngineAt(index: number) {
      if (index < 0 || index >= this.customEngines.length) return;
      const removed = this.customEngines[index];
      this.customEngines = this.customEngines.filter((_, i) => i !== index);
      setItem(StorageKey.CustomEngines, this.customEngines);

      // 若删除的是当前选中引擎，则自动切回第一个默认引擎
      const first = DEFAULT_ENGINES[0];
      if (removed && this.selectedEngine?.id === removed.id && first) {
        this.setSelectedEngine(first);
      }
    },
    removeCustomEngineById(id: string) {
      if (!id) return;
      const removed = this.customEngines.find((e) => e.id === id);
      const next = this.customEngines.filter((e) => e.id !== id);
      if (next.length === this.customEngines.length) return;
      this.customEngines = next;
      setItem(StorageKey.CustomEngines, this.customEngines);

      // 若删除的是当前选中引擎，则自动切回第一个默认引擎
      const first = DEFAULT_ENGINES[0];
      if (removed && this.selectedEngine?.id === removed.id && first) {
        this.setSelectedEngine(first);
      }
    },
    setSelectedEngine(engine: SearchEngine | null | undefined) {
      if (!engine) return;
      this.selectedEngine = engine;
      setItem(StorageKey.SelectedEngine, { id: engine.id, name: engine.name, url: engine.url });
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
          url: this.selectedEngine?.url,
        },
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
        const list = data.customEngines.filter(isCustomEngineLike).map((x) => {
          const id = typeof x.id === 'string' && x.id.trim() ? x.id : genUniqueId('ce-');
          return { id, name: x.name, url: x.url } satisfies CustomSearchEngine;
        });
        this.setCustomEngines(list);
      }
      const sel = data.currentEngine;
      if (sel && typeof sel === 'object') {
        const s = sel as { id?: unknown; name?: unknown; url?: unknown };
        const payload = {
          id: typeof s.id === 'string' ? s.id : undefined,
          name: typeof s.name === 'string' ? s.name : undefined,
          url: typeof s.url === 'string' ? s.url : undefined,
        };
        if (payload.id || payload.name || payload.url) {
          setItem(StorageKey.SelectedEngine, payload);
          this.selectedEngine = loadSelectedEngine();
        }
      }
    },
  },
});
